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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Date;

import org.junit.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Unit test for simple App.
 */
public class AppTest 
{
    /**
     * Rigorous Test :-)
     */
    @Test
    public void shouldAnswerWithTrue()
    {
        var testeDate = new Date();
        NexuDto nexuDto = new NexuDto();
        nexuDto.setCertificateChain(new ArrayList<>());
        nexuDto.getCertificateChain().add(new byte[]{1,2,3});
        nexuDto.getCertificateChain().add(new byte[]{4,5,6});
        nexuDto.setSigningCertificate(new byte[]{4,5,6});
        nexuDto.setSingingDate(testeDate);
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String json = objectMapper.writeValueAsString(nexuDto);
            System.out.print("My json is " + json);
            var back = objectMapper.readValue(json, NexuDto.class);
            assertEquals(nexuDto.getSigningCertificate()[0], back.getCertificateChain().get(1)[0]);
            assertEquals(nexuDto.getSingingDate(), back.getSingingDate());
        } catch (Exception e) {
            throw new RuntimeException(e);

        }
        assertTrue( true );
    }
}
