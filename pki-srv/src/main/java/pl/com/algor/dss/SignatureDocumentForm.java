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
package pl.com.algor.dss;

import java.util.Date;
import java.util.List;


import eu.europa.esig.dss.enumerations.DigestAlgorithm;
import eu.europa.esig.dss.enumerations.EncryptionAlgorithm;
import eu.europa.esig.dss.enumerations.SignatureForm;
import eu.europa.esig.dss.enumerations.SignatureLevel;
import eu.europa.esig.dss.enumerations.SignaturePackaging;
import eu.europa.esig.dss.model.DSSDocument;
import pl.com.algor.one.NexuDto;

public class SignatureDocumentForm {

    private NexuDto nexuDto;
    DSSDocument toSignDocument;
    byte[] signatureValue;

    
    public void setSignatureValue(byte[] signatureValue) {
        this.signatureValue = signatureValue;
    }

    public DSSDocument getToSignDocument() {
        return toSignDocument;
    }

    public void setToSignDocument(DSSDocument toSignDocument) {
        this.toSignDocument = toSignDocument;
    }

    public SignatureDocumentForm(NexuDto nexuDto) {
        this.nexuDto = nexuDto;
    }

    public SignatureForm getSignatureForm() {
        return SignatureForm.PAdES;
    }

    public boolean isSignWithExpiredCertificate() {
        return false;
    }

    public String getDocumentGuid() {
        return nexuDto.getGuid();
    }

    public EncryptionAlgorithm getEncryptionAlgorithm() {
        return EncryptionAlgorithm.forName(nexuDto.getEncryptionAlgorithm());
    }

    public byte[] getSignatureValue() {
        
        return signatureValue;
    }

    public DigestAlgorithm getDigestAlgorithm() {
        return DigestAlgorithm.SHA256;
    }

    public SignaturePackaging getSignaturePackaging() {
        return SignaturePackaging.ENVELOPED;
    }

    public SignatureLevel getSignatureLevel() {
        return SignatureLevel.PAdES_BASELINE_B;
    }

    public Date getSigningDate() {
        return nexuDto.getSingingDate();
    }

    public byte[] getCertificate() {
        return nexuDto.getSigningCertificate();
    }

    public List<byte[]> getCertificateChain() {
        return nexuDto.getCertificateChain();
    }

    public NexuDto getNexuDto(){
        return nexuDto;
    }

}
