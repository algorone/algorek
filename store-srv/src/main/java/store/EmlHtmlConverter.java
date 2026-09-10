package store;

import jakarta.mail.BodyPart;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.Part;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

public class EmlHtmlConverter {

    public static String convert(File emlFile) {

        try (InputStream is = new FileInputStream(emlFile)) {
            Session session = Session.getDefaultInstance(new Properties());
            MimeMessage message = new MimeMessage(session, is);

            // 1. Pobieranie nagłówków z obsługą wartości null
            String subject = message.getSubject() != null ? message.getSubject() : "(Brak tematu)";
            String from = "(Nieznany nadawca)";
            if (message.getFrom() != null && message.getFrom().length > 0) {
                // Rzutujemy tablicę Address[] na InternetAddress[] i używamy toUnicodeString
                from = jakarta.mail.internet.InternetAddress.toUnicodeString(message.getFrom());
            }

            String to = "(Brak odbiorców)";
            jakarta.mail.Address[] recipientsTo = message.getRecipients(Message.RecipientType.TO);
            if (recipientsTo != null && recipientsTo.length > 0) {
                // To konwertuje wszystkich odbiorców i rozdziela ich przecinkami, poprawnie
                // dekodując UTF-8
                to = jakarta.mail.internet.InternetAddress.toUnicodeString(recipientsTo);
            }

            // 2. Formatowanie daty wysłania
            String sentDateStr = "(Brak daty)";
            if (message.getSentDate() != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
                sentDateStr = sdf.format(message.getSentDate());
            }

            // 3. Pobieranie listy załączników
            List<String> attachmentsList = new ArrayList<>();
            findAttachments(message, attachmentsList);

            String rawHtml = getHtmlText(message);
            if (rawHtml == null) {
                System.err.println("Brak treści HTML w tym pliku EML.");
                return null;
            }

            // 2. Mapuj Content-ID (CID) na dane w formacie Base64
            Map<String, String> cidToBase64Map = new HashMap<>();
            findAndConvertImages(message, cidToBase64Map);

            // 3. Podmień odnośniki cid: w kodzie HTML za pomocą Jsoup
            Document doc = Jsoup.parse(rawHtml);
            Elements images = doc.select("img[src^=cid:]");

            for (Element img : images) {
                String src = img.attr("src");
                String cid = src.substring(4).trim();

                if (cidToBase64Map.containsKey(cid)) {
                    // Podmiana atrybutu src na "data:image/...;base64,..."
                    img.attr("src", cidToBase64Map.get(cid));
                }
            }

            StringBuilder attachmentsHtml = new StringBuilder();
            if (!attachmentsList.isEmpty()) {
                attachmentsHtml
                        .append("<div style='margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ced4da;'>");
                attachmentsHtml.append(
                        "<strong>Załączniki:</strong> <ul style='margin: 5px 0 0 0; padding-left: 20px; font-size: 13px; color: #0366d6;'>");
                for (String attachment : attachmentsList) {
                    attachmentsHtml.append("<li>").append(escapeHtml(attachment)).append("</li>");
                }
                attachmentsHtml.append("</ul></div>");
            }

            // 8. Przygotowanie całego panelu nagłówka
            String headerDivHtml = """
                    <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; border: 1px solid #e1e4e8; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                        <h2 style="margin-top: 0; margin-bottom: 10px; color: #24292e; font-size: 18px;">%s</h2>
                        <div style="font-size: 13px; color: #586069; line-height: 1.5;">
                            <strong>Od:</strong> %s<br/>
                            <strong>Do:</strong> %s<br/>
                            <strong>Data:</strong> %s
                        </div>
                        %s
                    </div>
                    """
                    .formatted(escapeHtml(subject), escapeHtml(from), escapeHtml(to), sentDateStr,
                            attachmentsHtml.toString());

            // 9. Wstrzyknięcie panelu na początek <body>
            Element body = doc.body();
            if (body != null) {
                body.prepend(headerDivHtml);
            }

            return doc.outerHtml();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // Rekurencyjna metoda szukająca tekstu HTML
    private static String getHtmlText(Part part) throws Exception {
        if (part.isMimeType("text/html")) {
            return part.getContent().toString();
        }
        if (part.isMimeType("multipart/*")) {
            MimeMultipart multipart = (MimeMultipart) part.getContent();
            for (int i = 0; i < multipart.getCount(); i++) {
                String html = getHtmlText(multipart.getBodyPart(i));
                if (html != null)
                    return html;
            }
        }
        return null;
    }

    private static void findAndConvertImages(Part part, Map<String, String> cidMap) throws Exception {
        if (part.isMimeType("multipart/*")) {
            MimeMultipart multipart = (MimeMultipart) part.getContent();
            for (int i = 0; i < multipart.getCount(); i++) {
                findAndConvertImages(multipart.getBodyPart(i), cidMap);
            }
        } else if (part.isMimeType("image/*")) {
            if (part instanceof BodyPart) {
                BodyPart bodyPart = (BodyPart) part;
                String[] contentIdHeader = bodyPart.getHeader("Content-ID");

                if (contentIdHeader != null && contentIdHeader.length > 0) {
                    String cid = contentIdHeader[0].replaceAll("[<>]", "").trim();
                    try (InputStream imgStream = bodyPart.getInputStream()) {
                        byte[] bytes = imgStream.readAllBytes();
                        String base64Data = Base64.getEncoder().encodeToString(bytes);
                        String contentType = bodyPart.getContentType().split(";")[0].trim();
                        String dataUrl = "data:" + contentType + ";base64," + base64Data;
                        cidMap.put(cid, dataUrl);
                    }
                }
            }
        }
    }

    private static void findAttachments(Part part, List<String> attachmentsList) throws Exception {
        if (part.isMimeType("multipart/*")) {
            MimeMultipart multipart = (MimeMultipart) part.getContent();
            for (int i = 0; i < multipart.getCount(); i++) {
                    BodyPart bodyPart = multipart.getBodyPart(i);
                    if (Part.ATTACHMENT.equalsIgnoreCase(bodyPart.getDisposition())) {
                        String fileName = bodyPart.getFileName();
                        attachmentsList.add(fileName);
                    }
            }
        } 
    }

    private static String escapeHtml(String input) {
        if (input == null)
            return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
