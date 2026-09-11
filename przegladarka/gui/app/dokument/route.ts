import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server';
import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFHexString,
  PDFString,
  PDFStream,
  decodePDFRawStream,
  PDFRawStream,
} from 'pdf-lib';
import { get_uid } from '../main/actions';
import { query, sprwdz_dostep } from '@/lib/db';

//TODO przeniesc do globanego configa
const config = {
  STORE_URL: (process.env.DOCUMENT_STORE_URL) ? process.env.DOCUMENT_STORE_URL:""
}

const extractRawAttachments = (pdfDoc: PDFDocument) => {
  if (!pdfDoc.catalog.has(PDFName.of('Names'))) return [];
  const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);

  if (!Names.has(PDFName.of('EmbeddedFiles'))) return [];
  const EmbeddedFiles = Names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);

  if (!EmbeddedFiles.has(PDFName.of('Names'))) return [];
  const EFNames = EmbeddedFiles.lookup(PDFName.of('Names'), PDFArray);

  const rawAttachments = [];
  for (let idx = 0, len = EFNames.size(); idx < len; idx += 2) {
    const fileName = EFNames.lookup(idx) as PDFHexString | PDFString;
    const fileSpec = EFNames.lookup(idx + 1, PDFDict);
    rawAttachments.push({ fileName, fileSpec });
  }

  return rawAttachments;
};

const extractAttachments = (pdfDoc: PDFDocument) => {
  const rawAttachments = extractRawAttachments(pdfDoc);
  return rawAttachments.map(({ fileName, fileSpec }) => {
    const stream = fileSpec
      .lookup(PDFName.of('EF'), PDFDict)
      .lookup(PDFName.of('F'), PDFStream) as PDFRawStream;
    return {
      name: fileName.decodeText(),
      data: decodePDFRawStream(stream).decode(),
    };
  });
};

export async function GET(request: NextRequest) {
  const headersList = await headers()
  const referer = headersList.get('referer')
  const searchParams = request.nextUrl.searchParams
  const guid = searchParams.get('guid')
  const attachments = searchParams.get('attachments')
  const attachment = searchParams.get('attachment')

  const STORE_URL = config.STORE_URL + guid
  const ATTACHMENT_STORE_URL = config.STORE_URL + "attachments/" + guid

  const uid = await get_uid()
  const  dostep  =  await sprwdz_dostep(guid, uid)
  if (!dostep) {
    console.log('Brak dostępu: ' + guid + " # " + uid)
    return;
  }

  if (attachments != null) {
    return await fetch(ATTACHMENT_STORE_URL + "?list")
  }

  if (attachment != null) {
    return await fetch(ATTACHMENT_STORE_URL + "?item=" + attachment)
  }

  return await fetch(STORE_URL)
}


