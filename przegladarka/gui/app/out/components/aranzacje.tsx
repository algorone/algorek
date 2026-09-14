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

import * as React from "react"
import Dropzone from 'react-dropzone'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { DokumentList } from "../../main/components/dokument-list"

import { DokumentDisplay } from "../../main/components/dokument-display"
import { podpisz } from "../../main/components/nexu-sign"
import { Checkbox } from "@/components/ui/checkbox"
import { useTask, useTaskDispatch } from "@/lib/tasks"
import { useList } from "@/lib/list"
import { ActionsToolbar } from "../../main/components/toolbar"

import { useView, ViewCase } from "@/lib/view"
import { SearchBox } from "../../main/components/search-box"
import { useEffect } from "react"
import { usePagina } from "@/lib/pagina"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { bramka, dodaj_zalaczniki, kolejka, kolejka_aranzacje, usun_zalacznik, usunZKolejki, usunZKolejkiDoPrzetworzonych } from "../actions"
import { useCerts } from "@/lib/certs"
import { usePodpis } from "@/lib/podpis"
import { Playwrite_SK_Guides } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CircleX, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteTag } from "@/app/main/actions"


export function Aranzacje({
  defaultLayout = [30, 70],
  defaultCollapsed = true,
  navCollapsedSize = 45,
  guidProvider = null
}: { defaultLayout?: any, defaultCollapsed?: any, navCollapsedSize?: any, guidProvider?: any }) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [panding, setTransition] = React.useTransition()
  const [guid, setGuid] = React.useState(guidProvider)
  const [meta, setMeta] = React.useState(false)
  const [zrodlo, setZrodlo] = React.useState('Aranżacje')
  const [displayWidth, setDisplayWidth] = React.useState(0)
  const tasks = useTask()
  const dispatch = useTaskDispatch()
  const [docs, setList] = useList()
  const [display, setDisplay] = useView()
  const [query, setQuery] = React.useState(null)
  const [certs, setCerts] = useCerts()
  const [podpis, setPodpis] = usePodpis()


  useEffect(() => {
    setDisplayWidth(Math.round(defaultLayout[1] / 100 * window.innerWidth))
  }, [])

  function rowClick(event: any) {
    setDisplay('dokumenty')
    setGuid(event)

  }

  function checked(): import("@radix-ui/react-checkbox").CheckedState | undefined {
    if (tasks.length === 0)
      return false;
    return (tasks.length === docs.length) ? true : "indeterminate"
  }

  function switchChcked() {
    if (tasks.length === 0) {
      docs.forEach((doc: any) => {
        dispatch({ action: 'add', guid: doc.guid })
      });
    } else
      dispatch({ action: 'clear' })
  }

  function isUzytkownikDecydent() {
    return true
  }

  async function odrzuc(guid: any) {
    await usunZKolejkiDoPrzetworzonych(guid)
  }

  async function zatwierdz(guid: any) {
   await deleteTag(guid, 'aranzacja')
  }


  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
          setDisplayWidth(Math.round(sizes[1] / 100 * window.innerWidth))
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={defaultLayout[0]} minSize={20} className="bg-sidebar">
          <Tabs defaultValue="all">
            <div className="flex items-center pr-4 py-2">
              <SidebarTrigger />

              <SearchBox zrodlo={zrodlo} search={(t: any) => setQuery(t)} />


            </div>
            <Separator />
            <>
              <div className="flex items-center gap-2 px-0 py-2 border-b">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox style={{ marginLeft: '.5rem' }} checked={checked()} onClick={switchChcked}></Checkbox>
                  </TooltipTrigger>
                  <TooltipContent>Wybierz</TooltipContent>
                </Tooltip>
                <ActionsToolbar zrodlo={zrodlo} multi={true} odrzuc={odrzuc} isDecydent={isUzytkownikDecydent} zatwierdz={zatwierdz} />
                <Separator orientation="vertical" className="mx-1 h-6" />
              </div>

              <TabsContent value="all" className="m-0">
                <DokumentList onClick={rowClick} zrodlo={kolejka_aranzacje} guid={guid} query={query} />
              </TabsContent>
            </>

          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]}>

          <ViewCase warunek="dokumenty">
            {(guid != null) && <DokumentDisplay width={displayWidth} guidProvider={guid} bezZalacznikow={true}>
              <Zalaczniki guidProvider={guid} />
            </DokumentDisplay>}
          </ViewCase>


        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}

export function Zalaczniki({ guidProvider = null }: { guidProvider?: any }) {
  const dokumentUrl = "/dokument?guid=" + guidProvider.guid
  const [pliki, setPliki] = React.useState<string[]>([])
  const [panding, setTransition] = React.useTransition()
  const [zalaczniki, setZalaczniki] = React.useState<any>([])
  const [refresh, setReshresh] = React.useState(Math.random);
  useEffect(() => setTransition(async () => {
    setPliki([])
    if (guidProvider.guid != null) {
      const resp = await fetch(dokumentUrl + "&attachments")
      const body = (await resp.text()).trim()
      if (body !== '') {
        setZalaczniki(body.trim().split('\n'))
      } else {
        setZalaczniki([])
      }
    } else {
      setZalaczniki([])
    }

  }), [guidProvider.guid, refresh])

  function onPlikiChenge(e: any) {
    console.log("file" + e.target.files)
    const nazwy = []
    for (const file of e.target.files) {
      console.log(file.name)
      nazwy.push(file.name)
    }
    setPliki(nazwy)
  }

  async function doda_zalczniki_go(formData: FormData) {
    await dodaj_zalaczniki(formData)
    setReshresh(Math.random())
  }


  return (<>
    <form action={doda_zalczniki_go} className="grid grid-cols-[1fr_auto] gap-1" onReset={()=>setPliki([])}>

      <section className="relative flex h-24 flex-shrink-0 items-center justify-center row-span-2
    gap-2 overflow-hidden rounded-md bg-white px-4 text-sm font-medium 
    shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
        style={{ border: "blue", borderStyle: "dashed" }}
      >

        <div>
          <input type="hidden" name="guid" value={guidProvider.guid} />
          <input type="file" name="pliki" multiple onChange={onPlikiChenge} />
          <p>Upuść załacznki tutaj </p>
          {(pliki.length > 0) && pliki.map((f: any, idx: any) => <span key={idx}>{f}</span>)}
        </div>
      </section>
      <div className="m-2">
        <Button type="submit" variant="outline" className="" disabled={pliki.length<1}><Paperclip />
          Załącz wybrane pliki</Button>
        <Button type="reset" variant="outline" className=""><X /></Button>
      </div>
    </form>
    <div className={cn("")}>
      {zalaczniki.map((zal: any, idx: any) => <Badge variant="outline" key={idx}><span className="px-2">{zal}</span>
        <Button variant="destructive" size="xs" onClick={async () => {
          await usun_zalacznik(guidProvider.guid, idx)
          setReshresh(Math.random())
        }}><CircleX /></Button>
      </Badge>)}
    </div>
  
  </>)
}


