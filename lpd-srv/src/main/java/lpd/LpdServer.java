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
package lpd;

/**
 * Pierwotny kod wygenerowany przez AI na podstawie nadzorowanego technicznego
 * czatu,z pózniejszymi zmianami #AL-270
 *
 * @author mdrzazga
 */
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

public class LpdServer {

   
    private static final String ENV_TIMEOUT = "LPD_TIMEOUT";
    private static final int DEFAULT_TIMEOUT_MS = 1000;
   
    
    private static final String ENV_STRICT = "LPD_USE_STRICT_SIZE_CHECK";
    private static final boolean DEFAULT_USE_STRICT_SIZE_CHECK = false; 

    private static final String ENV_PORT = "LPD_PORT";
    private static final int DEFAULT_LPD_PORT = 515;

    private static final String ENV_SPOOL_DIR = "LPD_SPOOL_DIR";
    private static final String DEFAULT_SPOOL_DIR = "var/spool/lpd";

    private static final String ENV_BUS = "DRUKARKA_BUS_URL";
    private static final String DEFAULT_EVENT_BUS_URL = "http://127.0.0.1:8023/2";

    public static final int LPD_PORT;
    public static final Path SPOOL_BASE_DIR;
    public static final String DRUKARKA_BUS_URL;
    public static final int TIMEOUT_MS;
    public static final boolean USE_STRICT_SIZE_CHECK;

    static {
        String envPort = System.getenv(ENV_PORT);
        int parsedPort = DEFAULT_LPD_PORT;

        if (envPort == null || envPort.isBlank()) {
            System.out.println("[Konfiguracja] Brak zmiennej " + ENV_PORT + ". Używam domyślnego portu: " + DEFAULT_LPD_PORT);
        } else {
            try {
                int tempPort = Integer.parseInt(envPort.trim());
                if (tempPort >= 1 && tempPort <= 65535) {
                    parsedPort = tempPort;
                    System.out.println("[Konfiguracja] Wczytano port ze zmiennej " + ENV_PORT + ": " + parsedPort);
                } else {
                    System.err.println("[Konfiguracja][Wstrzymanie] Wartość " + ENV_PORT + " (" + tempPort + ") poza zakresem 1-65535. Używam domyślnego portu: " + DEFAULT_LPD_PORT);
                }
            } catch (NumberFormatException e) {
                System.err.println("[Konfiguracja][Wstrzymanie] Wartość " + ENV_PORT + " (" + envPort + ") nie jest poprawną liczbą. Używam domyślnego portu: " + DEFAULT_LPD_PORT);
            }
        }
        LPD_PORT = parsedPort;
        
        String envTimeout = System.getenv(ENV_TIMEOUT);
        var defaultTimeout= DEFAULT_TIMEOUT_MS;
        if (envTimeout == null || envTimeout.isBlank()) {
            System.out.println("[Konfiguracja] Brak zmiennej " + ENV_TIMEOUT + ". Używam domyślnej wartości: " + DEFAULT_TIMEOUT_MS);
        } else {
            try {
                int tempVal = Integer.parseInt(envTimeout.trim());
                defaultTimeout = tempVal;
            } catch (NumberFormatException e) {
                System.err.println("[Konfiguracja][Wstrzymanie] Wartość " + ENV_TIMEOUT 
                        + "nie jest poprawną liczbą. Używam domyślnego portu: " + DEFAULT_TIMEOUT_MS);
            }
        }
        TIMEOUT_MS = defaultTimeout;
        
        String envStrictSize = System.getenv(ENV_STRICT);
        
        if (Boolean.valueOf(envStrictSize)){
             System.out.println("[Konfiguracja] " + ENV_STRICT + " ustwiona: " + envStrictSize);
             USE_STRICT_SIZE_CHECK = Boolean.valueOf(envStrictSize);
        } else {
            System.out.println("[Konfiguracja] Brak zmiennej " + ENV_STRICT + ". Używam domyślnej wartoci: " + DEFAULT_USE_STRICT_SIZE_CHECK);
            USE_STRICT_SIZE_CHECK = DEFAULT_USE_STRICT_SIZE_CHECK;
        }
        

        String envPath = System.getenv(ENV_SPOOL_DIR);
        if (envPath == null || envPath.isBlank()) {
            SPOOL_BASE_DIR = Paths.get(DEFAULT_SPOOL_DIR);
            System.out.println("[Konfiguracja] Brak zmiennej " + ENV_SPOOL_DIR + ". Używam domyślnej ścieżki: " + SPOOL_BASE_DIR.toAbsolutePath());
        } else {
            SPOOL_BASE_DIR = Paths.get(envPath);
            System.out.println("[Konfiguracja] Wczytano ścieżkę ze zmiennej " + ENV_SPOOL_DIR + ": " + SPOOL_BASE_DIR.toAbsolutePath());
        }

        try {
            Files.createDirectories(SPOOL_BASE_DIR);
            System.out.println("[Konfiguracja] Katalog spoola jest gotowy i zweryfikowany.");
        } catch (IOException e) {
            System.err.println("[BŁĄD KRITYCZNY] Nie można utworzyć katalogu spoola: " + e.getMessage());
            System.exit(1);
        }
        String envBus = System.getenv(ENV_BUS);
        if (envBus == null || envBus.isBlank()) {
            DRUKARKA_BUS_URL = DEFAULT_EVENT_BUS_URL;
            System.out.println("[Konfiguracja] Brak zmiennej " + ENV_BUS + ". Używam domyślnej: " + DRUKARKA_BUS_URL);
        } else {
            DRUKARKA_BUS_URL = envBus;
            System.out.println("[Konfiguracja] Używam wawrtości ze zmiennej " + ENV_BUS + ":" + DRUKARKA_BUS_URL);
        }
    }

    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(LPD_PORT)) {
            System.out.println("Minimalistyczny Niepełny Serwer LPD uruchomiony na porcie " + LPD_PORT);

            while (true) {
                Socket clientSocket = serverSocket.accept();
                Thread.startVirtualThread(() -> {
                    try {
                        handleLpdClient(clientSocket);
                    } catch (Exception e) {
                        System.err.println("Błąd obsługi klienta: " + e.getMessage());
                        e.printStackTrace();
                    } finally {
                        try {
                            clientSocket.close();
                        } catch (IOException ignored) {
                        }
                    }
                });
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleLpdClient(Socket socket) throws IOException {
        InputStream in = socket.getInputStream();
        OutputStream out = socket.getOutputStream();

        String mainCommand = readLineByteByByte(in);
        if (mainCommand == null || mainCommand.isEmpty()) {
            return;
        }

        if (mainCommand.charAt(0) != 0x02) {
            System.out.println("Nieznana komenda początkowa: " + (int) mainCommand.charAt(0));
            return;
        }

        String queueName = mainCommand.substring(1).trim();
        System.out.println("Połączenie do kolejki: [" + queueName + "]");

        File storageDir = new File(SPOOL_BASE_DIR +"/"+ queueName);
        storageDir.mkdirs();

        out.write(0);
        out.flush();
        File controlFile = null;

        while (true) {
            String subCommand = readLineByteByByte(in);
            if (subCommand == null || subCommand.isEmpty()) {
                break;
            }
            byte subCode = (byte) subCommand.charAt(0);
            String params = subCommand.substring(1).trim();
            int firstSpace = params.indexOf(' ');
            if (firstSpace == -1) {
                continue;
            }

            if (subCode == 0x02) {
                long declaredSize = Long.parseLong(params.substring(0, firstSpace));
                String fileName = params.substring(firstSpace + 1).trim();
                File targetFile = new File(storageDir, fileName);
                System.out.println("Odbieranie pliku kontrolnego: " + fileName + " (" + declaredSize + "B)");
                out.write(0); 
                out.flush();
                saveControlFileSecure(socket, in, targetFile, declaredSize);
                controlFile = targetFile;
                out.write(0); 
                out.flush();

            } else if (subCode == 0x03) {
                long declaredSize = Long.parseLong(params.substring(0, firstSpace));
                String fileName = params.substring(firstSpace + 1).trim();
                File targetFile = new File(storageDir, fileName);

                System.out.println("Odbieranie pliku danych (wydruku): " + fileName);
                out.write(0);
                out.flush();
                if (USE_STRICT_SIZE_CHECK) {
                    saveStreamStrict(in, targetFile, declaredSize);
                } else {
                    saveStreamUntilTimeout(socket, in, targetFile);
                }

                out.write(0);
                out.flush();
            } else {
                break;
            }
        }
        System.out.println("Zakończono sesję LPD dla: " + queueName);
        String info= (controlFile != null) ? controlFile.toString() : "BRAK CONTROLFILE";
        postMsg("lpd,wydruk_dokumentu,"+info);
        System.out.println("Zakończono sesję LPD dla: " + info);

    }

    private static String readLineByteByByte(InputStream in) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        int b;
        while ((b = in.read()) != -1) {
            baos.write(b);
            if (b == '\n') {
                break;
            }
        }
        if (baos.size() == 0) {
            return null;
        }
        return baos.toString(StandardCharsets.US_ASCII);
    }

    private static void saveControlFileSecure(Socket socket, InputStream in, File targetFile, long declaredSize) throws IOException {

        socket.setSoTimeout(TIMEOUT_MS);

        try (FileOutputStream fos = new FileOutputStream(targetFile)) {
            long bytesRead = 0;
            int b;

            while (true) {
                try {
                    b = in.read();
                    if (b == -1) {
                        System.out.println("Strumień zamknięty podczas czytania pliku kontrolnego.");
                        break;
                    }
                    fos.write(b);
                    bytesRead++;

                    if (b == 0x00) {
                        System.out.println("Napotkano bajt 0x00 (LPD EOF) w pliku kontrolnym. Kończę odczyt.");
                        break;
                    }

                } catch (SocketTimeoutException e) {
                    System.out.println("Timeout podczas odczytu pliku kontrolnego. Uznaję plik za kompletny.");
                    break;
                }
            }
        } finally {
            socket.setSoTimeout(0);
        }
    }

    private static void saveStreamStrict(InputStream in, File targetFile, long size) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(targetFile)) {
            byte[] buffer = new byte[4096];
            long bytesLeft = size;

            while (bytesLeft > 0) {
                int maxToRead = (int) Math.min(buffer.length, bytesLeft);
                int read = in.read(buffer, 0, maxToRead);
                if (read == -1) {
                    throw new EOFException("Strumień zamknięty przed odebraniem całego pliku strict.");
                }
                fos.write(buffer, 0, read);
                bytesLeft -= read;
            }
        }
    }

    private static void saveStreamUntilTimeout(Socket socket, InputStream in, File targetFile) throws IOException {
        socket.setSoTimeout(TIMEOUT_MS);

        try (FileOutputStream fos = new FileOutputStream(targetFile)) {
            byte[] buffer = new byte[16384]; // 16KB bufor wydajnościowy

            while (true) {
                try {
                    int read = in.read(buffer);
                    if (read == -1) {
                        System.out.println("Strumień TCP zamknięty przez klienta.");
                        break;
                    }
                    fos.write(buffer, 0, read);
                } catch (SocketTimeoutException e) {
                    System.out.println("Wykryto koniec strumienia danych przez timeout bezczynności.");
                    break;
                }
            }
        } finally {
            socket.setSoTimeout(0);
        }
    }

    private static boolean postMsg(String payload) {
        try (HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build()) {

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(DRUKARKA_BUS_URL))
                    .timeout(Duration.ofSeconds(2)) 
                    .header("Content-Type", "text/plain; charset=UTF-8")
                    .PUT(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int statusCode = response.statusCode();
            if (statusCode >= 200 && statusCode < 300) {
                System.out.printf("[HTTP Raport][Sukces] Wysłano dane. Status: %d%n", statusCode);
                return true;
            } else {
                System.err.printf("[HTTP Raport][Błąd] Serwer zwrócił niepoprawny status: %d. Odpowiedź: %s%n",
                        statusCode, response.body());
                return false;
            }

        } catch (Exception e) {
            System.err.println("[HTTP Raport][Wyjątek] Nie udało się wysłać zadania: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
