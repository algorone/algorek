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
