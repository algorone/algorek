package bus;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Path;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Executors;

public class Server {

    public static int HTTP_PORT = 8080;
    public static Path DATA_DIR = Path.of(".", "events-bus-data");
    static int PUBS = 32;
    static int SUBS = 32;
    static Engine engine;

    public static void main(String[] args) throws IOException {
        loadenv();
        engine = new Engine(PUBS, SUBS, DATA_DIR);

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
        System.err.println("Listen on :" + HTTP_PORT + " data dir: " + DATA_DIR.toAbsolutePath() + " PUBS:  " + PUBS + " SUBS: "+ SUBS );
    }

    private static void put(HttpExchange exchange) throws IOException {
        var path = exchange.getRequestURI().getPath().replaceAll("/", "");
        var headers = exchange.getRequestHeaders();
        String  val = headers.get("Content-length").get(0);
        int length = Integer.parseInt(val);
        int busNo = Integer.parseInt(path);
        engine.put(busNo, exchange.getRequestBody(), length);
        ok(exchange, "ok");
    }



    private static int get(HttpExchange exchange) throws IOException {
        var path = exchange.getRequestURI().getPath().split("/");
        var subNo = Integer.parseInt(path[2]);
        var busNo = Integer.parseInt(path[1]);
        var next = engine.nextHeader(subNo, busNo);
        if(next == null)
            return ok(exchange, "No more data");
        var position = next.getLong();   
        var timestamp = next.getLong();
        var length = next.getLong();
        exchange.with("timestamp", List.of(new Date(timestamp).toString()));
        exchange.sendResponseHeaders(200, length);
        engine.writeTo(exchange.getResponseBody(), busNo, subNo, position + 16, length);
        exchange.close();
        return 200;
         
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
        var httpPort = System.getenv("BUS_HTTP_PORT");
        if (httpPort != null)
            HTTP_PORT = Integer.parseInt(httpPort);
        var dataDir = System.getenv("BUS_DATA_DIR");
        if (dataDir != null)
            DATA_DIR = Path.of(dataDir);
        var subs = System.getenv("BUS_SUBS");
        if (subs != null)
            SUBS = Integer.parseInt(subs);
        var pubs = System.getenv("BUS_PUBS");
        if (pubs != null)
            PUBS = Integer.parseInt(pubs);
    }

}
