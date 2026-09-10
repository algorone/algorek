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
