package store;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.UUID;
import java.util.List;
import java.util.Properties;
import java.util.ArrayList;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import java.util.zip.ZipEntry;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.BodyPart;
import jakarta.mail.Part;

public class Repository {
    File dataDir;

    Repository(Path dataDir) {
        this.dataDir = dataDir.toFile();
    }

    File create() throws IOException {
        var ret = UUID.randomUUID();
        var newFile = getFile(ret.toString());
        newFile.createNewFile();
        return newFile;
    }

    long write(File file, InputStream is) throws IOException {
        try (var fos = new FileOutputStream(file); var bis = new BufferedInputStream(is)) {
            return bis.transferTo(fos);
        }
    }

    long read(File file, OutputStream os) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            return fis.transferTo(os);
        }
    }

    boolean setReadOnly(File file) throws IOException {
        var lockFileName = file.getName() + ".lock";
        var lockFile = new File(file.getParentFile(), lockFileName);
        return lockFile.createNewFile();
    }

    boolean isReadOnly(File file) {
        var lockFileName = file.getName() + ".lock";
        var lockFile = new File(file.getParentFile(), lockFileName);
        return lockFile.exists();
    }

    boolean history(File file) throws IOException {
        var meta = Files.readAttributes(file.toPath(), BasicFileAttributes.class);
        var histFile = new File(file.getParentFile(), file.getName() + "." + meta.lastModifiedTime().toString());
        return file.renameTo(histFile);
    }

    boolean remove(File file) {
        var guid = file.getName();
        var parent = file.getParentFile();
        System.err.println("guid: " + guid + " parrent: " + parent);
        var toDelte = parent.listFiles((d, f) -> f.startsWith(guid));
        for (var f : toDelte) {
            System.err.print("removing " + f + " ");
            var resp = f.delete();
            System.err.println((resp) ? "OK" : "ko");
        }
        return true;
    }

    File getFile(String guid) {
        return new File(dataDir, guid);
    }

    File getAttachmentsFile(String guid) {
        return new File(dataDir, guid + ".attachments");
    }

    File getEmlFile(String guid) {
        return new File(dataDir, guid + ".eml");
    }

    boolean addZipEntry(File zipFile, File file, String name) {
        try {
            ZipEntry entry;
            if (!zipFile.exists()) {
                zipFile.createNewFile();
                try (var zos = new ZipOutputStream(new FileOutputStream(zipFile, true));
                        var fis = new FileInputStream(file)) {
                    entry = new ZipEntry(name);
                    zos.putNextEntry(entry);
                    fis.transferTo(zos);
                    zos.closeEntry();
                }
                return true;
            } else {
                var tempFile = new File(dataDir, zipFile.getName() + ".tmp");
                try (var zis = new ZipInputStream(new FileInputStream(zipFile));
                        var zos = new ZipOutputStream(new FileOutputStream(tempFile));
                        var fis = new FileInputStream(file)) {
                    while ((entry = zis.getNextEntry()) != null) {
                        zos.putNextEntry(new ZipEntry(entry.getName()));
                        zis.transferTo(zos);
                    }
                    entry = new ZipEntry(name);
                    zos.putNextEntry(entry);
                    fis.transferTo(zos);
                    zos.closeEntry();
                }
                zipFile.delete();
                tempFile.renameTo(zipFile);
                return true;
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    boolean removeZipEntry(File zipFile, int idx) {
        if (!zipFile.exists()) {
            return false;
        }
        try {
            var entries = listZipFile(zipFile);
            if (idx < 0 || idx >= entries.size()) {
                return false;
            }

            var tempFile = new File(dataDir, zipFile.getName() + ".tmp");
            try (var zis = new ZipInputStream(new FileInputStream(zipFile));
                    var zos = new ZipOutputStream(new FileOutputStream(tempFile))) {

                int currentEntryIndex = 0;
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (currentEntryIndex != idx) {
                        zos.putNextEntry(new ZipEntry(entry.getName()));
                        zis.transferTo(zos);
                        zos.closeEntry();
                    }
                    currentEntryIndex++;
                }
            }

            zipFile.delete();
            tempFile.renameTo(zipFile);

            if (entries.size() == 1) {
                zipFile.delete();
            }

            return true;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    List<String> listZipFile(File zipFile) {
        if (!zipFile.exists()) {
            return List.of();
        }
        try (var zis = new ZipInputStream(new FileInputStream(zipFile))) {
            var entries = new ArrayList<String>();
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                entries.add(entry.getName());
            }
            return entries;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    long readZipEntry(File zipEntry, int idx, OutputStream os) throws IOException {
        try (var zis = new ZipInputStream(new FileInputStream(zipEntry))) {
            int currentEntryIndex = 0;
            while (zis.getNextEntry() != null) {
                if (currentEntryIndex == idx) {
                    return zis.transferTo(os);
                }
                currentEntryIndex++;
            }
        }
        return -1;
    }

    List<String> listEmlFile(File emlFile) throws Exception {
        if (!emlFile.exists()) {
            return List.of();
        }

        try (FileInputStream fis = new FileInputStream(emlFile)) {
            Session session = Session.getDefaultInstance(new Properties());
            MimeMessage message = new MimeMessage(session, fis);
            var entries = new ArrayList<String>();
            if (message.isMimeType("multipart/*")) {
                MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();

                for (int i = 0; i < mimeMultipart.getCount(); i++) {
                    BodyPart bodyPart = mimeMultipart.getBodyPart(i);
                    if (Part.ATTACHMENT.equalsIgnoreCase(bodyPart.getDisposition())) {
                        String fileName = bodyPart.getFileName();
                        entries.add(fileName);
                    }
                }
                return entries;
            }
        }

        return List.of();
    }

    long readEmlEntry(File emlFile, int idx, OutputStream os) throws Exception {
        try (FileInputStream fis = new FileInputStream(emlFile)) {
            Session session = Session.getDefaultInstance(new Properties());
            MimeMessage message = new MimeMessage(session, fis);
            if (message.isMimeType("multipart/*")) {
                MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
                int curentIdx =0;
                for (int i = 0; i < mimeMultipart.getCount(); i++) {
                    BodyPart bodyPart = mimeMultipart.getBodyPart(i);
                    if (Part.ATTACHMENT.equalsIgnoreCase(bodyPart.getDisposition())) {
                        if (curentIdx== idx){
                            bodyPart.getInputStream().transferTo(os);
                            return bodyPart.getSize();
                        }
                        curentIdx++;
                    }
                }
                return 0;
            }
        }
        return -1;
    }
    
    String previewEmlFile(File emlFile) {
        return EmlHtmlConverter.convert(emlFile);
    }
}
