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

import eu.europa.esig.dss.alert.LogOnStatusAlert;
import eu.europa.esig.dss.asic.cades.ASiCWithCAdESSignatureParameters;
import eu.europa.esig.dss.asic.cades.ASiCWithCAdESTimestampParameters;
import eu.europa.esig.dss.asic.cades.signature.ASiCWithCAdESService;
import eu.europa.esig.dss.asic.xades.ASiCWithXAdESSignatureParameters;
import eu.europa.esig.dss.asic.xades.signature.ASiCWithXAdESService;
import eu.europa.esig.dss.cades.CAdESSignatureParameters;
import eu.europa.esig.dss.cades.signature.CAdESService;
import eu.europa.esig.dss.cades.signature.CAdESTimestampParameters;
import eu.europa.esig.dss.enumerations.ASiCContainerType;
import eu.europa.esig.dss.enumerations.JWSSerializationType;
import eu.europa.esig.dss.enumerations.SigDMechanism;
import eu.europa.esig.dss.enumerations.SignatureAlgorithm;
import eu.europa.esig.dss.enumerations.SignatureForm;
import eu.europa.esig.dss.jades.JAdESSignatureParameters;
import eu.europa.esig.dss.jades.JAdESTimestampParameters;
import eu.europa.esig.dss.jades.signature.JAdESService;
import eu.europa.esig.dss.model.DSSDocument;
import eu.europa.esig.dss.model.SignatureValue;
import eu.europa.esig.dss.model.TimestampParameters;
import eu.europa.esig.dss.model.ToBeSigned;
import eu.europa.esig.dss.model.x509.CertificateToken;
import eu.europa.esig.dss.pades.PAdESSignatureParameters;
import eu.europa.esig.dss.pades.PAdESTimestampParameters;
import eu.europa.esig.dss.pades.SignatureFieldParameters;
import eu.europa.esig.dss.pades.SignatureImageParameters;
import eu.europa.esig.dss.pades.SignatureImageTextParameters;
import eu.europa.esig.dss.pades.signature.PAdESService;
import eu.europa.esig.dss.signature.AbstractSignatureParameters;
import eu.europa.esig.dss.signature.DocumentSignatureService;
import eu.europa.esig.dss.signature.MultipleDocumentsSignatureService;
import eu.europa.esig.dss.spi.DSSUtils;
import eu.europa.esig.dss.spi.validation.CertificateVerifier;
import eu.europa.esig.dss.spi.validation.CertificateVerifierBuilder;
import eu.europa.esig.dss.spi.x509.tsp.KeyEntityTSPSource;
import eu.europa.esig.dss.spi.x509.tsp.TSPSource;
import eu.europa.esig.dss.utils.Utils;

import eu.europa.esig.dss.xades.XAdESSignatureParameters;
import eu.europa.esig.dss.xades.XAdESTimestampParameters;
import eu.europa.esig.dss.xades.signature.XAdESService;
import pl.com.algor.one.AlgoroneFont;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.Color;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;


public class SigningService {

	private static final Logger LOG = LoggerFactory.getLogger(SigningService.class);

	private CertificateVerifier certificateVerifier;
	
	private TSPSource tspSource;

	private Map<String, SignatureDocumentForm> cache =  new HashMap<>();

	public boolean isMockTSPSourceUsed() {
		return tspSource instanceof KeyEntityTSPSource;
	}


	@SuppressWarnings({ "rawtypes", "unchecked" })
	public ToBeSigned getDataToSign(SignatureDocumentForm form) {
		LOG.info("Start getDataToSign with one document");
		DocumentSignatureService service = getSignatureService(null, form.getSignatureForm(), form.isSignWithExpiredCertificate());

		AbstractSignatureParameters parameters = fillParameters(form);
		
		try {
			DSSDocument toSignDocument = ObjectStoreUtils.toDSSDocument(form.getDocumentGuid());
			ToBeSigned toBeSigned = service.getDataToSign(toSignDocument, parameters);
			form.setToSignDocument(toSignDocument);
			cache.put(form.getDocumentGuid(), form);
			LOG.info("End getDataToSign with one document");
			return toBeSigned;
		} catch (Exception e) {
			throw new SignatureOperationException(e.getMessage(), e);
		}
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public boolean signDocument(String guid, byte[] sigData) {
		LOG.info("Start signDocument with one document");


		try {
			SignatureDocumentForm form = cache.get(guid);
			DocumentSignatureService service = getSignatureService(null, form.getSignatureForm(), form.isSignWithExpiredCertificate());
			AbstractSignatureParameters parameters = fillParameters(form);

			form.setSignatureValue(sigData);
			DSSDocument toSignDocument = form.getToSignDocument();
			SignatureAlgorithm sigAlgorithm = SignatureAlgorithm.getAlgorithm(form.getEncryptionAlgorithm(), form.getDigestAlgorithm());
			SignatureValue signatureValue = new SignatureValue(sigAlgorithm, form.getSignatureValue());
			DSSDocument signedDocument = service.signDocument(toSignDocument, parameters, signatureValue);	
			LOG.info("Dokument prepared");
			ObjectStoreUtils.toObjectStore(form.getDocumentGuid(), signedDocument);
			LOG.info("End signDocument with one document");
			cache.remove(guid);
			return true;
			
		} catch (Exception e) {
			LOG.error("Error in signDocument with one document", e);
			throw new SignatureOperationException(e.getMessage(), e);
		}
	}


	@SuppressWarnings({ "rawtypes" })
	private AbstractSignatureParameters fillParameters(SignatureDocumentForm form) {
		AbstractSignatureParameters parameters = getSignatureParameters(null, form.getSignatureForm());
		parameters.setSignaturePackaging(form.getSignaturePackaging());

		fillParameters(parameters, form);

		var nextDto = form.getNexuDto();
		LOG.warn("Mamny nextDto + " + nextDto);

		final SignatureImageParameters imageParams = new SignatureImageParameters();

        final SignatureFieldParameters fieldParams = new SignatureFieldParameters();
        fieldParams.setPage(nextDto.getStrona());
        fieldParams.setOriginX(nextDto.getPozycjaX());
        fieldParams.setOriginY(nextDto.getPozycjaY());
        imageParams.setFieldParameters(fieldParams);

        final SignatureImageTextParameters textParams = new SignatureImageTextParameters();
        textParams.setText(nextDto.getWizualizacja());
        textParams.setTextColor(Color.BLACK);
	textParams.setFont(AlgoroneFont.getFont(nextDto.getFontSize()));
        imageParams.setTextParameters(textParams);
        ((PAdESSignatureParameters)parameters).setImageParameters(imageParams);
		return parameters;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void fillParameters(AbstractSignatureParameters parameters, SignatureDocumentForm form) {
		parameters.setSignatureLevel(form.getSignatureLevel());
		parameters.setDigestAlgorithm(form.getDigestAlgorithm());
		parameters.bLevel().setSigningDate(form.getSigningDate());

		CertificateToken signingCertificate = DSSUtils.loadCertificate(form.getCertificate());
		parameters.setSigningCertificate(signingCertificate);

		List<byte[]> certificateChainBytes = form.getCertificateChain();
		if (Utils.isCollectionNotEmpty(certificateChainBytes)) {
			List<CertificateToken> certificateChain = new LinkedList<>();
			for (byte[] certificate : certificateChainBytes) {
				certificateChain.add(DSSUtils.loadCertificate(certificate));
			}
			parameters.setCertificateChain(certificateChain);
		}

		fillTimestampParameters(parameters, form);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void fillTimestampParameters(AbstractSignatureParameters parameters, SignatureDocumentForm form) {
		SignatureForm signatureForm = form.getSignatureForm();

		ASiCContainerType containerType = null;


		TimestampParameters timestampParameters = getTimestampParameters(containerType, signatureForm);
		timestampParameters.setDigestAlgorithm(form.getDigestAlgorithm());

		parameters.setContentTimestampParameters(timestampParameters);
		parameters.setSignatureTimestampParameters(timestampParameters);
		parameters.setArchiveTimestampParameters(timestampParameters);
	}



	@SuppressWarnings("rawtypes")
	private DocumentSignatureService getSignatureService(SignatureForm signatureForm) {
		return getSignatureService(null, signatureForm, false);
	}

	@SuppressWarnings("rawtypes")
	private DocumentSignatureService getSignatureService(ASiCContainerType containerType, SignatureForm signatureForm) {
		return getSignatureService(containerType, signatureForm, false);
	}

	@SuppressWarnings("rawtypes")
	private DocumentSignatureService getSignatureService(SignatureForm signatureForm, boolean signWithExpiredCertificate) {
		return getSignatureService(null, signatureForm, signWithExpiredCertificate);
	}

	@SuppressWarnings("rawtypes")
	private DocumentSignatureService getSignatureService(ASiCContainerType containerType, SignatureForm signatureForm, boolean signWithExpiredCertificate) {
		CertificateVerifier cv = new CertificateVerifierBuilder(certificateVerifier).buildCompleteCopy();
		if (signWithExpiredCertificate) {
			cv.setAlertOnExpiredCertificate(new LogOnStatusAlert());
		}
		DocumentSignatureService service = null;
		if (containerType != null) {
			service = (DocumentSignatureService) getASiCSignatureService(signatureForm, cv);
		} else {
			switch (signatureForm) {
				case CAdES:
					service = new CAdESService(cv);
					break;
				case PAdES:
					service = new PAdESService(cv);
					break;
				case XAdES:
					service = new XAdESService(cv);
					break;
				case JAdES:
					service = new JAdESService(cv);
					break;
				default:
					throw new IllegalArgumentException(String.format("Unknown signature form : %s", signatureForm));
			}
		}
		service.setTspSource(tspSource);
		return service;
	}

	@SuppressWarnings({ "rawtypes" })
	private AbstractSignatureParameters getSignatureParameters(ASiCContainerType containerType, SignatureForm signatureForm) {
		AbstractSignatureParameters parameters = null;
		if (containerType != null) {
			parameters = getASiCSignatureParameters(containerType, signatureForm);
		} else {
			switch (signatureForm) {
			case CAdES:
				parameters = new CAdESSignatureParameters();
				break;
			case PAdES:
				PAdESSignatureParameters padesParams = new PAdESSignatureParameters();
				padesParams.setContentSize(9472 * 2); // double reserved space for signature
				parameters = padesParams;
				break;
			case XAdES:
				parameters = new XAdESSignatureParameters();
				break;
			case JAdES:
				JAdESSignatureParameters jadesParameters = new JAdESSignatureParameters();
				jadesParameters.setJwsSerializationType(JWSSerializationType.JSON_SERIALIZATION); // to allow T+ levels + parallel signing
	            jadesParameters.setSigDMechanism(SigDMechanism.OBJECT_ID_BY_URI_HASH); // to use by default
				parameters = jadesParameters;
				break;
			default:
				throw new IllegalArgumentException(String.format("Unknown signature form : %s", signatureForm));
			}
		}
		return parameters;
	}
	

	private TimestampParameters getTimestampParameters(ASiCContainerType containerType, SignatureForm signatureForm) {
		TimestampParameters parameters = null;
		if (containerType == null) {
			switch (signatureForm) {
				case CAdES:
					parameters = new CAdESTimestampParameters();
					break;
				case XAdES:
					parameters = new XAdESTimestampParameters();
					break;
				case PAdES:
					parameters = new PAdESTimestampParameters();
					break;
				case JAdES:
					parameters = new JAdESTimestampParameters();
					break;
				default:
					throw new IllegalArgumentException(String.format("Not supported signature form for a time-stamp : %s", signatureForm));
			}

		} else {
			switch (signatureForm) {
				case CAdES:
					ASiCWithCAdESTimestampParameters asicParameters = new ASiCWithCAdESTimestampParameters();
					asicParameters.aSiC().setContainerType(containerType);
					parameters = asicParameters;
					break;
				case XAdES:
					parameters = new XAdESTimestampParameters();
					break;
				default:
					throw new IllegalArgumentException(String.format("Not supported signature form for an ASiC time-stamp : %s", signatureForm));
			}
		}
		return parameters;
	}

	@SuppressWarnings("rawtypes")
	private MultipleDocumentsSignatureService getASiCSignatureService(SignatureForm signatureForm, CertificateVerifier cv) {
		MultipleDocumentsSignatureService service = null;
		switch (signatureForm) {
			case CAdES:
				service = new ASiCWithCAdESService(cv);
				break;
			case XAdES:
				service = new ASiCWithXAdESService(cv);
				break;
			default:
				throw new IllegalArgumentException(String.format("Not supported signature form for an ASiC container : %s", signatureForm));
		}
		return service;
	}

	@SuppressWarnings({ "rawtypes" })
	private AbstractSignatureParameters getASiCSignatureParameters(ASiCContainerType containerType, SignatureForm signatureForm) {
		AbstractSignatureParameters parameters = null;
		switch (signatureForm) {
		case CAdES:
			ASiCWithCAdESSignatureParameters asicCadesParams = new ASiCWithCAdESSignatureParameters();
			asicCadesParams.aSiC().setContainerType(containerType);
			parameters = asicCadesParams;
			break;
		case XAdES:
			ASiCWithXAdESSignatureParameters asicXadesParams = new ASiCWithXAdESSignatureParameters();
			asicXadesParams.aSiC().setContainerType(containerType);
			parameters = asicXadesParams;
			break;
		default:
			throw new IllegalArgumentException(String.format("Not supported signature form for an ASiC container : %s", signatureForm));
		}
		return parameters;
	}

}
