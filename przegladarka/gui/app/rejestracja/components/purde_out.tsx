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
import { Checkbox } from "@/components/ui/checkbox"
import { useTask, useTaskDispatch } from "@/lib/tasks"
import { useList } from "@/lib/list"
import { ActionsToolbar } from "../../main/components/toolbar"

import { useView, ViewCase } from "@/lib/view"
import { SearchBox } from "../../main/components/search-box"
import { useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePodpis } from "@/lib/podpis"
import { purde_do_przetworzone, purde_in, purde_out } from "../actions"
import { useRefresh } from "@/lib/refresher"
import { ZalacznikiZamiana } from "./purde_in"




export function PurdeOut({
  accounts = null,
  mails = null,
  defaultLayout = [30, 70],
  defaultCollapsed = true,
  navCollapsedSize = 45
}) {

  const [guid, setGuid] = React.useState(null)
  const [guid2, setGuid2] = React.useState(null)
  const [dekretacja, setDekretacja] = React.useState(null)
  const [zrodlo, setZrodlo] = React.useState('Purde')
  const [typListy, setTyplisty] = React.useState('dokumenty')
  const [displayWidth, setDisplayWidth] = React.useState(0)
  const tasks = useTask()
  const dispatch = useTaskDispatch()
  const [docs, setList] = useList()
  const [display, setDisplay] = useView()
  const [query, setQuery] = React.useState(null)
  const [podpis, setPodpis] = usePodpis()
  const [refresh, setRefresh] = useRefresh()


  function isUzytkownikDecydent() {
    // TODO dodac prawdziwa biznesowa logike
    // if (podpis == null || podpis === 'null')
    //   return false
    // return ("" + podpis + "")
    return true
  }

  async function zatwierdz(guid: any) {
    if (isUzytkownikDecydent()) {
      // await zatwierdz_dekretacje_na_pracownika_lub_zwrot(guid)
    }
  }

  useEffect(() => {
    setDisplayWidth(Math.round(defaultLayout[1] / 100 * window.innerWidth))
  }, [])

  useEffect(() => {
    setDisplay('dokumenty')
    setGuid(guid2)
  }, [refresh])

  function rowClick(event: any) {
    setDisplay('dokumenty')
    setGuid(event)
    setGuid2(event)

  }

  function dokumnetUpdate() {
    setGuid(null)
    setRefresh(Math.random())
  }


  function checked(): import("@radix-ui/react-checkbox").CheckedState | undefined {
    if (tasks.length === 0)
      return false;
    return (tasks.length === docs.length) ? true : "indeterminate"
  }

  function switchChcked() {
    if (tasks.length === 0) {
      docs.forEach((doc: any) => {
        dispatch({ action: 'add', guid: "" + doc.pozycja })
      });
    } else
      dispatch({ action: 'clear' })
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
                <ActionsToolbar zrodlo={zrodlo} multi={true} isDecydent={isUzytkownikDecydent} zatwierdz={zatwierdz} odrzuc={purde_do_przetworzone} />
                <Separator orientation="vertical" className="mx-1 h-6" />
              </div>

              <TabsContent value="all" className="m-0">
                <DokumentList onClick={rowClick} zrodlo={purde_out} guid={guid} query={query} />
              </TabsContent>
            </>}

          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]}>

          <ViewCase warunek="dokumenty">
            {(guid != null) && <DokumentDisplay width={displayWidth} guidProvider={guid2} >
              {/* <DekretacjaNaPracownika dekretacja={dekretacja} /> */}
              <div className="grid grid-cols-[1fr_auto] gap-1">
                <div style={{ border: "blue", borderStyle: "dashed", textAlign: "center" }}>
                  <ZalacznikiZamiana guidProvider={guid2} update={dokumnetUpdate} />
                </div>
              </div>
            </DokumentDisplay>}
          </ViewCase>


        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}


