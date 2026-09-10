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
