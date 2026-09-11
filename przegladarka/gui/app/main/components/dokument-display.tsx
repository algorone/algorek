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
"use client"


import {
  ChevronRight,
  ChevronLeft,
  Download,
  Paperclip,
  Info,
  Combine
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { Document, Page } from 'react-pdf';
import { ScrollArea } from "@/components/ui/scroll-area"
import { pdfjs } from 'react-pdf'
import { useEffect, useState, useTransition } from "react"
import { ActionsMenu } from "./toolbar"
import TagEditor, { TodoProvider } from "./tag-editor"
import { DebugMeta } from "./debug-meta"




// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs-dist/build/pdf.worker.min.mjs';


export function DokumentDisplay({ guidProvider, width, onSprawaClick = null, outOnly = false , children = null, bezZalacznikow= false}: { guidProvider: any, width: number, onSprawaClick?: any, outOnly?: boolean, children?:any, bezZalacznikow?: boolean }) {
  const today = new Date()
  const dokumentUrl = "/dokument?guid=" + guidProvider.guid
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>();
  const [url, setUrl] = useState( "/dokument?guid=" + guidProvider.guid)
  const [pending, setTransition] = useTransition()
  const [zalaczniki, setZalaczniki] = useState<any>([])
  const [meta, setMeta] = useState<any>(false)


  useEffect(() => { setTransition(async () => {
    if (guidProvider.guid != null && !bezZalacznikow) {
      const resp = await fetch(dokumentUrl+"&attachments")
      const body = (await resp.text()).trim()
      if(body!==''){
        setZalaczniki(body.trim().split('\n'))
      } else {
        setZalaczniki([])
      }
    }else{
      setZalaczniki([])
    }


  })
}, [guidProvider.guid])


  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setPageNumber(1)
    setNumPages(numPages);
  }

  function isPoprzednia(): boolean {
    return (pageNumber ?? 0) > 1
  }

  function isNastepna(): boolean {
    return ((numPages ?? 0) - (pageNumber ?? 0)) > 0
  }


  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          {/* <ActionsToolbar guid={guid} zrodlo={null} /> */}
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!guidProvider.guid} asChild>
                {(guidProvider.guid) ? <a href={dokumentUrl} download={guidProvider.guid}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Pobierz</span>
                </a> : <>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Pobierz</span>
                </>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pobierz plik</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => { setMeta(!meta) }}>
                <Info className="h-4 w-4" />
                {/* <Reply className="h-4 w-4" /> */}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Historia</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
         <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSprawaClick} disabled={!outOnly}>
                <Combine className="h-4 w-4" />
                {/* <Reply className="h-4 w-4" /> */}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aranżacja</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!isPoprzednia()} onClick={() => { setPageNumber((pageNumber ?? 0) - 1) }}>
                <ChevronLeft className="h-4 w-4" />
                {/* <Reply className="h-4 w-4" /> */}
                <span className="sr-only">Poprzednia</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Poprzednia strona</TooltipContent>
          </Tooltip>
          <div>{pageNumber}/{numPages}</div>


          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!isNastepna()} onClick={() => { setPageNumber((pageNumber ?? 0) + 1) }}>
                <ChevronRight className="h-4 w-4" />
                {/* <Forward className="h-4 w-4" /> */}
                <span className="sr-only">Następna</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Następna strona</TooltipContent>
          </Tooltip>
        </div>
        <TodoProvider>
          <TagEditor guid={guidProvider.guid} key={guidProvider.guid} />
        </TodoProvider>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <ActionsMenu guid={guidProvider.guid} />
      </div>
      <Separator />
      {children}
      <ScrollArea className="h-screen">

        <div hidden={meta}>
          {zalaczniki && (zalaczniki.length > 0) && <>

            <div className="flex items-center p-2 flex-wrap">
              <Paperclip className="h-4 w-4" />
              {zalaczniki.map((zal: any, idx: any) =><a className="pl-2" key={zal} href={dokumentUrl + '&attachment=' + idx} download={zal}>{zal}</a>)}
            </div>
            <Separator /></>}
          {pending||<Document file={dokumentUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} width={width - 20} renderAnnotationLayer={true} />
          </Document>}

        </div>
        {meta && <DebugMeta guid={guidProvider.guid} />}
      </ScrollArea>


    </div>
  )
}


