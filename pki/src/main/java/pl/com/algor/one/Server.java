/*
 * Copyright (C) 2026 Algor Informatyzcja Przedsiębiorstw Sp. z o.o.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *S
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://gnu.org>.
 */
package pl.com.algor.one;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.util.Base64;

import pl.com.algor.dss.SignatureDocumentForm;
import pl.com.algor.dss.SigningService;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.concurrent.Executors;

public class Server {
    public static int HTTP_PORT = 8024;
    public static String  OBJECT_STORE_URL = "http://localhost:8022/";
    public static String KOLEJKA_BUS_URL = "http://localhost:8023/1/";
    private static ObjectMapper objectMapper = new ObjectMapper();
    private static SigningService service =  new SigningService();
    public static void main( String[] args ) 
    {
        loadenv();
        HttpServer server;
        try {
            server = HttpServer.create(new InetSocketAddress(HTTP_PORT), 0);
            server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
            server.createContext("/get-data-to-sign").setHandler(getDataToSign());
            server.createContext("/sign").setHandler(sign());
            server.start();
            System.err.println("Listen on :" + HTTP_PORT );
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    private static HttpHandler sign() {
        return (exchange)->{
            try( var is = exchange.getRequestBody();var resp = exchange.getResponseBody()){
                var signatureValueDto = objectMapper.readValue(is, SignatureValueDto.class);
                var result = service.signDocument(signatureValueDto.getGuid(), signatureValueDto.getSignatureValue());
                if(result)
                    sendStatus(signatureValueDto.getGuid(),Base64.getEncoder().encodeToString(signatureValueDto.getSignatureValue()));
                exchange.sendResponseHeaders(200, 0);
                try(var os = exchange.getResponseBody()){
                    os.write("OK".getBytes());
                }
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }
        };
    }

    private static HttpHandler getDataToSign() {
        return (exchange)->{     
                try(var is = exchange.getRequestBody(); var resp = exchange.getResponseBody()){
                    var nexuDto = objectMapper.readValue(is, NexuDto.class);
                    var arg = new SignatureDocumentForm(nexuDto);
                    var dataToSign= service.getDataToSign(arg);
                    var responseDto = new DataToSignDto();
                    responseDto.setDataToSign(dataToSign.getBytes()); 
                    exchange.sendResponseHeaders(200, 0);
                    var headers = exchange.getResponseHeaders();
                    headers.add("Content-Type","application/json");
                    try(var os = exchange.getResponseBody()){
                        objectMapper.writeValue(os, responseDto);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException(e);
                }
        };
    }

    private static void sendStatus(String guid, String info) throws URISyntaxException{
        HttpRequest request = HttpRequest.newBuilder(new URI(KOLEJKA_BUS_URL))
        .PUT(HttpRequest.BodyPublishers.ofString(guid+",podpisano,"+info))
        .build();
        try(var clinet = HttpClient.newHttpClient()){
            var resp = clinet.send(request, BodyHandlers.ofString());
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static void loadenv() {
        var httpPort = System.getenv("PKI_HTTP_PORT");
        if (httpPort != null)
            HTTP_PORT = Integer.parseInt(httpPort);
        var objectStoreUrl  = System.getenv("OBJECT_STORE_URL");
        if (objectStoreUrl !=null)
            OBJECT_STORE_URL = objectStoreUrl;    
    }

}
