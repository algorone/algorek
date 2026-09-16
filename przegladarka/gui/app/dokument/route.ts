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


