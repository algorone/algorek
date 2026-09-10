package state;

import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.logging.*;

import static java.nio.file.FileVisitResult.*;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;

public class DirectStateReader extends SimpleFileVisitor<Path> {
    private static Logger logger = Logger.getLogger(DirectStateReader.class.getName());

    private final Path source;
    private final OutputStream os;
    private final PrintStream ps;

    private DirectStateReader(OutputStream outputStream, Path source){
        this.source = source;
        this.os = outputStream;
        this.ps = new PrintStream(this.os);
    }

    public static void readState( OutputStream outputStream,Path source) {
        var reader = new DirectStateReader(outputStream, source);
        try {
            Files.walkFileTree(source, reader);
        } catch (IOException e) {
            logger.log(Level.SEVERE, "Cannot read state", e);
        }

    }

    public static void readState(OutputStream outputStream, Path base, Path source) {
        var reader = new DirectStateReader(outputStream, base);
        try {
            Files.walkFileTree(source, reader);
        } catch (IOException e) {
            logger.log(Level.SEVERE, "Cannot read state", e);
        }
    }

    @Override
    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
        var key = source.relativize(dir).toString();
        ps.println(key+"/");
        return CONTINUE;
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
        try {
            var key = source.relativize(file).toString();
            ps.println(key);
            Files.lines(file).forEach(l -> ps.println("- "+l));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Cannot read file", e);
        }
        return CONTINUE;
    }

}
