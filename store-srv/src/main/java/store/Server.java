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
package store;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.Executors;

public class Server {

    public static int HTTP_PORT = 8080;
    public static Path DATA_DIR = Path.of(".", "object-store-data");
    static Repository repo;

    public static void main(String[] args) throws IOException {
        if (args.length > 0 && "disposing".equals(args[0]))
            disposing();
        else
            storing();
        System.err.println("Listen on :" + HTTP_PORT + " data dir: " + DATA_DIR.toAbsolutePath());
    }

    public static void disposing() throws IOException {
        loadenv();
        repo = new Repository(DATA_DIR);

        var server = HttpServer.create(new InetSocketAddress(HTTP_PORT), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.createContext("/dispose/").setHandler(exchange -> {
            if (!"DELETE".equals(exchange.getRequestMethod())) {
                var body = "Server in disposing mode, supports only DELETE method".getBytes();
                exchange.sendResponseHeaders(500, body.length);
                try (var os = exchange.getResponseBody()) {
                    os.write(body);
                }
                return;
            }
            var guid = exchange.getRequestURI().getPath().replaceAll("/dispose/", "").replaceAll("/", "");
            var file = repo.getFile(guid);
            if (file.exists()) {
                try {
                    repo.remove(file);
                    ok(exchange, "REMOVED");
                } catch (Exception e) {
                    var body = (e.getMessage()).getBytes();
                    exchange.sendResponseHeaders(500, body.length);
                    try (var os = exchange.getResponseBody()) {
                        os.write(body);
                    }
                }
            } else {
                var body = (guid + " not found").getBytes();
                exchange.sendResponseHeaders(404, body.length);
                try (var os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }

        });
        server.start();
    }

    public static void storing() throws IOException {
        loadenv();
        repo = new Repository(DATA_DIR);

        var server = HttpServer.create(new InetSocketAddress(HTTP_PORT), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.createContext("/").setHandler(exchange -> {
            try {
                switch (exchange.getRequestMethod()) {
                    case "GET":
                        get(exchange);
                        break;
                    case "PUT":
                        put(exchange);
                        break;
                    case "POST":
                        post(exchange);
                        break;
                    case "PATCH":
                        patch(exchange);
                        break;
                    default:
                }

            } catch (Exception e) {
                var body = (e.getMessage()).getBytes();
                exchange.sendResponseHeaders(500, body.length);
                try (var os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }

        });

        // AL-247 entry point
        server.createContext("/attachments/").setHandler(exchange -> {
            try {
                switch (exchange.getRequestMethod()) {
                    case "GET":
                        getAttachment(exchange);
                        break;
                    case "POST":
                        postAttachment(exchange);
                        break;
                    case "DELETE":
                        deleteAttachment(exchange);
                        break;
                    default:
                }

            } catch (Exception e) {
                var body = (e.getMessage()).getBytes();
                exchange.sendResponseHeaders(500, body.length);
                try (var os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }

        });

        // AL-180 entry point
        server.createContext("/eml/").setHandler(exchange -> {
            try {
                switch (exchange.getRequestMethod()) {
                    case "GET":
                        getEml(exchange);
                        break;
                    case "POST":
                        postEml(exchange);
                        break;
                    case "DELETE":
                        deleteEml(exchange);
                        break;
                    default:
                }

            } catch (Exception e) {
                var body = (e.getMessage()).getBytes();
                exchange.sendResponseHeaders(500, body.length);
                try (var os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }

        });
        server.start();
    }

    private static void patch(HttpExchange exchange) throws IOException {
        var file = file(exchange);
        if (repo.isReadOnly(file))
            throw new RuntimeException("Cannot patch locked object");
        repo.write(file, exchange.getRequestBody());
        ok(exchange, "Updated");
    }

    private static void put(HttpExchange exchange) throws IOException {
        File file = repo.create();
        repo.write(file, exchange.getRequestBody());
        ok(exchange, file.getName());
    }

    private static void post(HttpExchange exchange) throws IOException {
        var file = file(exchange);
        if (repo.isReadOnly(file)) {
            var original = file(exchange);
            repo.history(file);
            file = original;
        }
        repo.write(file, exchange.getRequestBody());
        repo.setReadOnly(file);
        ok(exchange, "Updated");
    }

    private static void get(HttpExchange exchange) throws IOException {
        var file = file(exchange);
        exchange.sendResponseHeaders(200, 0);
        repo.read(file, exchange.getResponseBody());
        exchange.getResponseBody().close();
    }

    private static void getAttachment(HttpExchange exchange) throws IOException {
        var guid = exchange.getRequestURI().getPath().replaceAll("/attachments/", "").replaceAll("/", "");
        var query = exchange.getRequestURI().getQuery();
        var attachmentsFile = repo.getAttachmentsFile(guid);
        if (query != null && query.equalsIgnoreCase("list")) {
            var entries = repo.listZipFile(attachmentsFile);
            var response = String.join("\n", entries);
            var body = response.getBytes();
            exchange.sendResponseHeaders(200, body.length);
            try (var os = exchange.getResponseBody()) {
                os.write(body);
            }
        } else if (query != null && query.startsWith("item")) {
            var idxStr = query.substring(query.lastIndexOf("=") + 1);
            var idx = Integer.parseInt(idxStr);
            exchange.sendResponseHeaders(200, 0);
            repo.readZipEntry(attachmentsFile, idx, exchange.getResponseBody());
            exchange.getResponseBody().close();
        } else {
            exchange.sendResponseHeaders(200, 0);
            repo.read(attachmentsFile, exchange.getResponseBody());
            exchange.getResponseBody().close();
        }
    }

    private static void postAttachment(HttpExchange exchange) throws IOException {
        var guid = exchange.getRequestURI().getPath().replaceAll("/attachments/", "").replaceAll("/", "");
        var file = repo.create();
        var name = file.getName();
        var query = exchange.getRequestURI().getQuery();
        if (query != null && query.startsWith("name")) {
            name = query.substring(query.lastIndexOf("=") + 1);
        }
        name = (name != null) ? name : file.getName();
        var attachmentsFile = repo.getAttachmentsFile(guid);
        repo.write(file, exchange.getRequestBody());
        repo.addZipEntry(attachmentsFile, file, name);
        repo.remove(file);
        ok(exchange, "Added");
    }

    private static void deleteAttachment(HttpExchange exchange) throws IOException {
        var guid = exchange.getRequestURI().getPath().replaceAll("/attachments/", "").replaceAll("/", "");
        var attachmentsFile = repo.getAttachmentsFile(guid);
        var query = exchange.getRequestURI().getQuery();
        if (query != null && query.startsWith("item")) {
            var idxStr = query.substring(query.lastIndexOf("=") + 1);
            var idx = Integer.parseInt(idxStr);
            if (repo.removeZipEntry(attachmentsFile, idx))
                ok(exchange, "Removed attachment item");
            else
                ko(exchange, "Error");
        } else {
            if (repo.remove(attachmentsFile))
                ok(exchange, "Removed atachments");
            else
                ko(exchange, "Error");
        }
    }

    private static void postEml(HttpExchange exchange) throws Exception {
        var guid = exchange.getRequestURI().getPath().replaceAll("/eml/", "").replaceAll("/", "");
        var file = repo.getFile(guid);
        if (!file.exists()) {
            throw new RuntimeException("No such object");
        }
        file = repo.create();
        repo.write(file, exchange.getRequestBody());

        file.renameTo(repo.getEmlFile(guid));
        ok(exchange, "Added");
    }

    private static void getEml(HttpExchange exchange) throws Exception {
        var guid = exchange.getRequestURI().getPath().replaceAll("/eml/", "").replaceAll("/", "");
        var query = exchange.getRequestURI().getQuery();
        var emlFile = repo.getEmlFile(guid);
        if (query != null && query.equalsIgnoreCase("list")) {
            var entries = repo.listEmlFile(emlFile);
            var response = String.join("\n", entries);
            var body = response.getBytes();
            exchange.sendResponseHeaders(200, body.length);
            try (var os = exchange.getResponseBody()) {
                os.write(body);
            }
        } else if (query != null && query.startsWith("item")) {
            var idxStr = query.substring(query.lastIndexOf("=") + 1);
            var idx = Integer.parseInt(idxStr);
            exchange.sendResponseHeaders(200, 0);
            repo.readEmlEntry(emlFile, idx, exchange.getResponseBody());
            exchange.getResponseBody().close();
        } else if (query != null && query.startsWith("preview")) {
            var previewHtml = repo.previewEmlFile(emlFile);
            var body = previewHtml.getBytes();
            exchange.getResponseHeaders().add("Content-Type", "text/html; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            try (var os = exchange.getResponseBody()) {
                os.write(body);
            }
        } else {
            exchange.sendResponseHeaders(200, 0);
            repo.read(emlFile, exchange.getResponseBody());
            exchange.getResponseBody().close();
        }
    }

    private static void deleteEml(HttpExchange exchange) throws Exception {
        var guid = exchange.getRequestURI().getPath().replaceAll("/eml/", "").replaceAll("/", "");
        var file = repo.getEmlFile(guid);
        if (!file.exists()) {
            throw new RuntimeException("No such object");
        }
        file.delete();
        ok(exchange, "Deleted");
    }

    private static File file(HttpExchange exchange) {
        var guid = exchange.getRequestURI().getPath().replaceAll("/", "");
        var file = repo.getFile(guid);
        if (!file.exists()) {
            throw new RuntimeException("No such object");
        }
        return file;
    }

    private static void ok(HttpExchange exchange, String msg) throws IOException {
        var body = (msg != null) ? msg.getBytes() : new byte[0];
        exchange.sendResponseHeaders(200, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private static void ko(HttpExchange exchange, String msg) throws IOException {
        var body = (msg != null) ? msg.getBytes() : new byte[0];
        exchange.sendResponseHeaders(500, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private static void loadenv() {
        var httpPort = System.getenv("STORE_HTTP_PORT");
        if (httpPort != null)
            HTTP_PORT = Integer.parseInt(httpPort);
        var dataDir = System.getenv("STORE_DATA_DIR");
        if (dataDir != null)
            DATA_DIR = Path.of(dataDir);

    }

}
