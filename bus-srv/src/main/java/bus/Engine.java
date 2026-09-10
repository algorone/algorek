package bus;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.MappedByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.WritableByteChannel;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import static java.nio.file.StandardOpenOption.*;

public class Engine {

    int pubsNo, subsNo;
    Path dataDir;
    ReadWriteLock locks[];

    long pubs[];
    FileChannel buses[];
    MappedByteBuffer subscriptions;
    Map<Long, FileChannel> busReaders = new ConcurrentHashMap<>();
    Map<Long, Lock> busReaderLocks = new ConcurrentHashMap<>();

    public Engine(int pubsNo, int subsNo, Path dataDir) throws IOException {
        this.pubsNo = pubsNo;
        this.subsNo = subsNo;
        this.dataDir = dataDir;
        pubs = new long[pubsNo];
        init();
    }

    private void init() throws IOException {
        buses = new FileChannel[pubsNo];
        locks = new ReadWriteLock[pubsNo];
        for (int i = 0; i < pubsNo; i++) {
            var pubPath = new File(dataDir.toFile(), "" + i).toPath();
            buses[i] = FileChannel.open(pubPath, CREATE, APPEND);
            pubs[i] = buses[i].size();
            locks[i] = new ReentrantReadWriteLock();
        }
        var subscribtionsFile = new File(dataDir.toFile(), "subscriptions");
        if (!subscribtionsFile.exists()) {
            subscribtionsFile.createNewFile();
        }

        RandomAccessFile subscriptionRWfile = new RandomAccessFile(subscribtionsFile, "rw");
        var subscriptionsCh = subscriptionRWfile.getChannel();
        subscriptions = subscriptionsCh.map(FileChannel.MapMode.READ_WRITE, 0, 8 * subsNo * subsNo);
    }

    public void put(int busNo, InputStream is, long length) throws IOException {
        if (busNo >= pubsNo || busNo < 0)
            throw new RuntimeException("No such bus");

        var timestamp = System.currentTimeMillis();
        var header = ByteBuffer.allocateDirect(2 * Long.BYTES);
        header.putLong(timestamp);
        header.putLong(length);
        header.flip();

        var bus = buses[busNo];
        var busLock = locks[busNo];
        busLock.writeLock().lock();
        var lastSize = pubs[busNo];
        try (ReadableByteChannel source = Channels.newChannel(is)) {
            bus.write(header);
            bus.transferFrom(source, 0, length);
            pubs[busNo] = bus.size();
        } catch (Exception e) {
            bus.truncate(lastSize);
            pubs[busNo] = buses[busNo].size();
        } finally {
            busLock.writeLock().unlock();
        }

    }

    public ByteBuffer nextHeader(int subNo, int busNo) throws IOException {
        if (busNo >= pubsNo || busNo < 0)
            throw new RuntimeException("No such bus");
        if (subNo >= subsNo || subNo < 0)
            throw new RuntimeException("No such subscription");
        var nextPos = subs(subNo, busNo);

        if (nextPos < pubs[busNo]) {
            var header = ByteBuffer.allocateDirect(3 * Long.BYTES);
            header.putLong(nextPos);
            var bus = getBusReader(busNo, subNo);
            bus.position(nextPos);
            bus.read(header);
            header.flip();
            var position = header.getLong();
            var timestamp = header.getLong();
            var length = header.getLong();
            moveTo(subNo, busNo, position + 16 + length);
            header.position(0);
            return header;
        }
        return null;
    }

    public void writeTo(OutputStream responseBody, int busNo, int subNo, long position, long length)
            throws IOException {
        FileChannel bus = getBusReader(busNo, subNo);
        try (WritableByteChannel out = Channels.newChannel(responseBody)) {
            bus.transferTo(position, length, out);
        }
    }

    private void moveTo(int subNo, int busNo, long position) {
        subscriptions.position(8 * subNo * subsNo + 8 * busNo);
        subscriptions.putLong(position);
    }

    private long subs(int subNo, int busNo) {
        subscriptions.position(8 * subNo * subsNo + 8 * busNo);
        long v1 = subscriptions.getLong();
        return v1;
    }

    private FileChannel getBusReader(int busNo, int subNo) throws IOException {
        var busLock = locks[busNo];
        busLock.readLock().lock();
        var busSubNo = ((long) busNo << 32) | (subNo & 0xFFFFFFFFL);
        var lock = busReaderLocks.get(busSubNo);
        if (lock == null) {
            lock = new ReentrantLock();
            busReaderLocks.put(busSubNo, lock);
        }
        try {
            lock.lock();
            var bus = busReaders.get(busSubNo);
            if (bus == null) {
                var pubPath = new File(dataDir.toFile(), "" + busNo).toPath();
                bus = FileChannel.open(pubPath, READ);
                busReaders.put(busSubNo, bus);
            }
            return bus;
        } finally {
            lock.unlock();
            busLock.readLock().unlock();
        }

    }

}
