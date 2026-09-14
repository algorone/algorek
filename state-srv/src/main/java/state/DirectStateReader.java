/*
 * Copyright (C) 2026 Algor Informatyzcja Przedsiębiorstw Sp. z o.o.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://gnu.org>.
 */
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
