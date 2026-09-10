package pl.com.algor.one;

import java.awt.Font;
import java.util.Map;
import java.util.HashMap;
import java.io.FileInputStream;
import java.io.InputStream;

import eu.europa.esig.dss.pades.DSSFileFont;

public class AlgoroneFont {

    static Map<Integer,DSSFileFont> fonts = new HashMap<>();

     
    public static DSSFileFont getFont(int size){
        DSSFileFont font = fonts.get(size);
        if(font == null){
        try(InputStream is = new FileInputStream("/usr/share/fonts/truetype/liberation2/LiberationSans-Italic.ttf")){
            font = new DSSFileFont(is);
            font.setSize(size);
            fonts.put(size, font);
        }catch(Exception ex){
            ex.printStackTrace();
        }
        }
        return font;
    }
}
