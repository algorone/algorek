package state;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.Scanner;
import java.util.concurrent.Executors;
import java.util.concurrent.Flow.Subscriber;
import java.util.concurrent.Flow.Subscription;
import java.util.concurrent.SubmissionPublisher;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

public class Server {

    private static Logger logger = Logger.getLogger(Server.class.getName());


    public static int HTTP_PORT = 8025;
    public static Path DATA_DIR = Path.of("/data/algorone/var/state-srv");

    private static SubmissionPublisher<String> flow;

    public static void main(String[] args) throws Exception {
        loadenv();
        flow = new SubmissionPublisher<>();
        var server = HttpServer.create(new InetSocketAddress(HTTP_PORT), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.createContext("/news").setHandler(Server::news);
        server.createContext("/").setHandler(exchange -> {
            var info = exchange.getRequestURI().toString();
            try {
                switch (exchange.getRequestMethod()) {
                    case "GET":
                        get(exchange);
                        break;
                    case "PUT":
                        put(exchange);
                        break;
                    case "DELETE":
                        delete(exchange);
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
                logger.log(Level.SEVERE,info,e);
                var body = (e.getMessage()).getBytes();
                exchange.sendResponseHeaders(500, body.length);
                try (var os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }

        });
        server.start();
        System.err.println("Listen on :" + HTTP_PORT + " data dir: " + DATA_DIR.toAbsolutePath());
    }

    private static void news(HttpExchange exchange) throws IOException{
        var responseHeaders = exchange.getResponseHeaders();
        responseHeaders.add("Content-Type", "text/event-stream");
        responseHeaders.add("Connection", "keep-alive");
        responseHeaders.add("Transfer-Encoding", "chunked");
        responseHeaders.add("X-Powered-By", "Native Application Server");
        responseHeaders.add("Access-Control-Allow-Origin", "*");

        exchange.sendResponseHeaders(200, 0);
        OutputStream writer = exchange.getResponseBody();
        flow.subscribe(new Subscriber<String>() {
            Subscription subscription;
            @Override
            public void onComplete() {
                try {
                    writer.close();
                } catch (IOException e) {
                    logger.log(Level.WARNING,"onComplete",e);

                }
            }
            @Override
            public void onError(Throwable throwable) { }
            @Override
            public void onNext(String msg) {  
                try {
                    writer.write(msg.getBytes("utf-8"));
                    writer.flush();
                    subscription.request(1);
                } catch (IOException e) {
                    logger.log(Level.WARNING,"onNext",e);
                }  
            }
            @Override
            public void onSubscribe(Subscription subscription) {  
                this.subscription=subscription;
                subscription.request(1);   
                try {
                    writer.write("SUBSCRIBED\n\n".getBytes("utf-8"));
                    writer.flush();     
                } catch (IOException e) {
                    logger.log(Level.SEVERE,"onSubscribe",e);
                }
                
            }
        });
    }

    private static void post(HttpExchange exchange) throws IOException {
        var path = exchange.getRequestURI().getRawPath();
        try (var reader = new Scanner(exchange.getRequestBody());){
            while (reader.hasNextLine()) {
                notify("INFO", path+":"+reader.nextLine());
            }
        }
        ok(exchange, "ok");
    }

    private static void patch(HttpExchange exchange) throws IOException {
        var path = exchange.getRequestURI().getRawPath();
        var query = exchange.getRequestURI().getQuery();
        var remove = ("remove".equals(query));
        var filePath = Path.of(DATA_DIR.toString(), path);
        if (path != null && !path.isEmpty() && !path.equalsIgnoreCase("/")) {
            if (path.endsWith("/")) {
                ok(exchange, "ko");
                return;
            }
            var file = filePath.toFile();
            var current = new LinkedHashSet<String>();
            if (file.exists())
                current.addAll(Files.readAllLines(filePath));
            try (var is = exchange.getRequestBody();
                    var reader = new Scanner(is);
                    var out = new PrintWriter(file)) {
                while (reader.hasNextLine()) {
                    var line = reader.nextLine();
                    if (remove)
                        current.remove(line);
                    else
                        current.add(line);
                }
                current.forEach(out::println);
            }
            notify("UPDATED", path);
        }
        ok(exchange, "ok");
    }

    private static void delete(HttpExchange exchange) throws Exception {
        var path = exchange.getRequestURI().getRawPath();
        var deleted = false;
        var filePath = Path.of(DATA_DIR.toString(), path);
        if (path != null && !path.isEmpty() && !path.equalsIgnoreCase("/")) {
            var file = filePath.toFile();
            if (file.exists()) {
                deleted = file.delete();
                if (deleted)
                    notify("DELETED", path);
            }
        }
        ok(exchange, (deleted) ? "ok" : "ko");
    }

    private static void notify(String event, String msg) {
        try {
            flow.submit("event:"+event+"\ndata:"+msg+"\n\n");
        } catch (Exception e) {
            logger.log(Level.SEVERE,"msg: "+ msg ,e);
        }

    }

    private static void put(HttpExchange exchange) throws IOException {
        var path = exchange.getRequestURI().getRawPath();
        var file = Path.of(DATA_DIR.toString(), path);
        if (path != null && !path.isEmpty() && !path.equalsIgnoreCase("/")) {
            if (path.endsWith("/"))
                file.toFile().mkdirs();
            else {
                try (var is = exchange.getRequestBody();
                        var reader = new Scanner(is);
                        var out = new PrintWriter(file.toFile());) {
                    while (reader.hasNextLine()) {
                        out.println(reader.nextLine());
                    }
                }
            }
            notify("UPDATED", path);
        }
        ok(exchange, "ok");

    }

    private static void get(HttpExchange exchange) throws Exception {
        var path = exchange.getRequestURI().getRawPath();
        exchange.sendResponseHeaders(200, 0);
        try (var os = exchange.getResponseBody()) {
            if (path != null && !path.isEmpty() && !path.equalsIgnoreCase("/")) {

                System.out.println("path: " + path);
                System.out.println("connected path : " + Path.of(DATA_DIR.toString(), path));
                DirectStateReader.readState(os, DATA_DIR, Path.of(DATA_DIR.toString(), path));

            } else
                DirectStateReader.readState(os, DATA_DIR);
        }
    }

    private static int ok(HttpExchange exchange, String msg) throws IOException {
        var body = (msg != null) ? msg.getBytes() : new byte[0];
        exchange.sendResponseHeaders(200, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
        return 200;
    }

    private static void loadenv() {
        var httpPort = System.getenv("SIGMA_HTTP_PORT");
        if (httpPort != null)
            HTTP_PORT = Integer.parseInt(httpPort);
        var dataDir = System.getenv("SIGMA_DATA_DIR");
        if (dataDir != null)
            DATA_DIR = Path.of(dataDir);

    }
}
