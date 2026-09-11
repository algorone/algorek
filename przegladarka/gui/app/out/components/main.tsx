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
import { bramka, kolejka, usunZKolejki, usunZKolejkiDoPrzetworzonych } from "../actions"
import { useCerts } from "@/lib/certs"
import { usePodpis } from "@/lib/podpis"



export function Main({
  defaultLayout = [30, 70],
  defaultCollapsed = true,
  navCollapsedSize = 45,
  doAranzacji = null
}:{defaultLayout?:any, defaultCollapsed?:any,  navCollapsedSize?:any,  doAranzacji:any}) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [panding, setTransition] = React.useTransition()
  const [guid, setGuid] = React.useState(null)
  const [meta, setMeta] = React.useState(false)
  const [zrodlo, setZrodlo] = React.useState('Kolejki')
  const [typListy, setTyplisty] = React.useState('dokumenty')
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
    // TODO dodac prawdziwa biznesowa logike
    if (podpis == null || podpis === 'null')
      return false
    return ("" + podpis + "")

  }

  async function odrzuc(guid: any) {
    await usunZKolejkiDoPrzetworzonych(guid)
  }

  async function podpiszDokument(guid: any) {
    if (isUzytkownikDecydent()) {
      await podpisz(certs, guid, podpis)
      await bramka(guid, 'podpisano')
      await usunZKolejki(guid)
    }

  }

  async function zatwierdz(guid: any) {
    if (isUzytkownikDecydent()) {
      await bramka(guid, null)
      await usunZKolejki(guid)
    }
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
            {(typListy === 'dokumenty') && <>
              <div className="flex items-center gap-2 px-0 py-2 border-b">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox style={{ marginLeft: '.5rem' }} checked={checked()} onClick={switchChcked}></Checkbox>
                  </TooltipTrigger>
                  <TooltipContent>Wybierz</TooltipContent>
                </Tooltip>
                <ActionsToolbar zrodlo={zrodlo} multi={true} odrzuc={odrzuc} isDecydent={isUzytkownikDecydent} podpisz={podpiszDokument} zatwierdz={zatwierdz}/>
                <Separator orientation="vertical" className="mx-1 h-6" />
              </div>

              <TabsContent value="all" className="m-0">
                <DokumentList onClick={rowClick} zrodlo={kolejka} guid={guid} query={query} outOnly={false}/>
              </TabsContent>
            </>}

          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]}>

          <ViewCase warunek="dokumenty">
            {(guid != null) && <DokumentDisplay width={displayWidth} guidProvider={guid} onSprawaClick={()=>doAranzacji(guid)} outOnly={true}/>}
          </ViewCase>


        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}


