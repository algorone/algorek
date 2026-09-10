package pl.com.algor.dss;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;

import eu.europa.esig.dss.model.DSSDocument;
import eu.europa.esig.dss.model.InMemoryDocument;
import static pl.com.algor.one.Server.OBJECT_STORE_URL;

public class ObjectStoreUtils {

    public static DSSDocument toDSSDocument(String guid) {
        try {
            var url = new URI(OBJECT_STORE_URL + guid).toURL();
            try (InputStream input = url.openStream()) {
                return new InMemoryDocument(input);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static boolean toObjectStore(String guid, DSSDocument document){
        try {
            var url = new URI(OBJECT_STORE_URL + guid).toURL();
            var con = (HttpURLConnection)url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/pdf");
            con.setDoOutput(true);
            try(var is = document.openStream(); var os = con.getOutputStream()){
                var transfered = is.transferTo(os);
                System.out.println("Transfered: " + transfered);
            }
            int responseCode = con.getResponseCode();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
        return true;
    }

}
