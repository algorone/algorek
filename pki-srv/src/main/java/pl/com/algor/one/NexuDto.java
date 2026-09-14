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

import java.util.Arrays;
import java.util.Date;
import java.util.List;

public class NexuDto {

    List<byte[]> certificateChain;
    byte[] signingCertificate;
    
    String encryptionAlgorithm;
    String signatureAlgorithm;
    String guid;
    Date singingDate;
    String wizualizacja;
    int pozycjaX;
    int pozycjaY;
    int strona;
    int fontSize = 10;

    public void setSingingDate(Date singingDate) {
        this.singingDate = singingDate;
    }

    public Date getSingingDate() {
        return singingDate;
    }

    public String getGuid() {
        return guid;
    }

    public void setGuid(String guid) {
        this.guid = guid;
    }

    public List<byte[]> getCertificateChain() {
        return certificateChain;
    }

    public void setCertificateChain(List<byte[]> certificateChain) {
        this.certificateChain = certificateChain;
    }

    public byte[] getSigningCertificate() {
        return signingCertificate;
    }

    public void setSigningCertificate(byte[] signingCertificate) {
        this.signingCertificate = signingCertificate;
    }

    public String getEncryptionAlgorithm() {
        return encryptionAlgorithm;
    }

    public void setEncryptionAlgorithm(String encryptionAlgorithm) {
        this.encryptionAlgorithm = encryptionAlgorithm;
    }

    public String getSignatureAlgorithm() {
        return signatureAlgorithm;
    }

    public void setSignatureAlgorithm(String signatureAlgorithm) {
        this.signatureAlgorithm = signatureAlgorithm;
    }

        
    public String getWizualizacja() {
        return wizualizacja;
    }

    public void setWizualizacja(String wizualizacja) {
        this.wizualizacja = wizualizacja;
    }

    public int getPozycjaX() {
        return pozycjaX;
    }

    public void setPozycjaX(int pozycjaX) {
        this.pozycjaX = pozycjaX;
    }

    public int getPozycjaY() {
        return pozycjaY;
    }

    public void setPozycjaY(int pozycjaY) {
        this.pozycjaY = pozycjaY;
    }

    public int getStrona() {
        return strona;
    }

    public void setStrona(int strona) {
        this.strona = strona;
    }

    public int getFontSize(){
        return fontSize;
    }

    public void setFontSize(int fontSize){
        this.fontSize = fontSize;
    }

    @Override
    public String toString() {
        return "NexuDto [certificateChain=" + certificateChain + ", signingCertificate="
                + Arrays.toString(signingCertificate)
                + ", encryptionAlgorithm=" + encryptionAlgorithm + ", signatureAlgorithm=" + signatureAlgorithm
                + ", guid=" + guid + ", singingDate=" + singingDate + "]";
    }

}
