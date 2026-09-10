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
