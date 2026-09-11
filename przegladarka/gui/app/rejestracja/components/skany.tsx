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

import { SearchBox } from "@/app/main/components/search-box"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs } from "@/components/ui/tabs"
import { useList } from "@/lib/list"
import { useTask, useTaskDispatch } from "@/lib/tasks"
import { useView } from "@/lib/view"

import React, { useEffect, useState, useTransition } from "react"
import { usePagina } from "@/lib/pagina"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import Image from 'next/image'
import { useRefresh } from "@/lib/refresher"
import { Paginator } from "@/app/main/components/toolbar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DoorClosedLocked, Signature } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@radix-ui/react-progress"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { skany, upate_skany, zatwierdz_przypisanie } from "../actions"
import { cn } from "@/lib/utils"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"


const emptyList: any[] = [];

export function Skany(props: any) {
  const [zrodlo, setZrodlo] = React.useState('Skany')
  const tasks = useTask()
  const dispatch = useTaskDispatch()
  const [docs, setList] = useList()
  const [query, setQuery] = React.useState('')
  const [panding, setTransition] = useTransition()
  const [pagina, setPagina] = usePagina()
  const [refresh, setRefresh] = useRefresh()
  const [openDialog, setOpenDialog] = useState(false)
  const [openExternalDialog, setOpenExternalDialog] = useState(false)
  const [externalServiceUrl, setExternalServiceUrl] = useState("")
  const [externalServiceGuid, setExternalServiceGuid] = useState(null)
  const [akcjeDialog, setAkcjeDialog] = useState('')
  const [guid, setGuid] = React.useState(null)
  const [zmiana, setZmiana] = useState('')



  useEffect(() => {
    setTransition(async () => {
      const resp = await skany(pagina.limit, pagina.offset)
      const dane = resp.dane.map((d: any) => {
        d.key = d.guid + "0"
        return d
      })
      setPagina({ count: resp.count, limit: resp.limit, offset: resp.offset })
      setList(dane)
      dispatch({ action: 'clear' })
    })
  }, [refresh, query])

  function switchTask(guid: any) {
    const action = (tasks.map(t => t.guid).includes(guid)) ? 'delete' : 'add'
    dispatch({ action, guid })
  }

  function checkked(guid: string) {
    return (tasks.map(t => t.guid).includes(guid))
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

  function runAction(akcja: any, func: any) {
    return function () {

      setOpenDialog(true)
      setAkcjeDialog(akcja)
      const todo = tasks
      setTransition(async () => {
        const guids: any[] = []
        for (const task of todo) {
          await func(task.guid)
          guids.push(task.guid)
          dispatch({ guid: task.guid, action: 'done' })
        }
        setRefresh(Math.random())
        setOpenDialog(false)
        setGuid(null)
       
      })

    }

  }

  function zakoncz() {
    setOpenDialog(true)
    setAkcjeDialog('usun')
  }

  function closeDialog() {
    setOpenDialog(false)
  }

  async function closeExternalDialog(guid: any) {
    if (guid != null) {
      // setTransition(async () => {
      const guids: any[] = [guid]
      setOpenExternalDialog(false)
      setExternalServiceGuid(null)

      // )

    } else {
      setOpenExternalDialog(false)
    }

  }

  async function zatwierdz(guid:string){
    await zatwierdz_przypisanie(guid)
  }

  async function zmienZnak() {
    if (guid != null) {
      await upate_skany(guid, zmiana)
      setRefresh(Math.random())
    }
  }

  function zmienStrone(guid: any) {
    setOpenExternalDialog(true)
    setExternalServiceUrl(`/bramka/strona/${guid}?uid=-1`)
    setExternalServiceGuid(guid)
  }

  return (<>
    <Tabs defaultValue="all">
      <div className="flex items-center pr-4 py-2">
        <SidebarTrigger />

        <SearchBox zrodlo={zrodlo} search={(t: any) => setQuery(t)} />


      </div>
      <Separator />
      <div className="flex items-center gap-2 px-0 py-2 border-b">
        <Tooltip>
          <TooltipTrigger asChild>
            <Checkbox style={{ marginLeft: '.5rem' }} checked={checked()} onClick={switchChcked} ></Checkbox>
          </TooltipTrigger>
          <TooltipContent>Wybierz</TooltipContent>
        </Tooltip>
        {/* <ActionsToolbar zrodlo={zrodlo} multi={true} /> */}
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button variant="outline" disabled={(tasks.length == 0)} onClick={runAction('Zatwierdz', zatwierdz )}>Zatwierdź przypisania</Button>
        <Button variant="ghost" disabled={(tasks.length == 0)} onClick={() => zakoncz()} className="decoration-red-600 mx-12" style={{ color: "red" }}>Przenieś do przetworzonych</Button>
        <Paginator />
        <Separator orientation="vertical" className="mx-1 h-6" />


      </div>
      <div className="grid grid-cols-2">
        <span>
          {panding && <div className="h-screen w-auto border">
            <Skeleton className="h-[150px] w-full border-brounded-xl grid" >
              <h3 className="scroll-m-20 text-xl tracking-tight self-center justify-self-center">
                ładuje ...
              </h3>

            </Skeleton>

          </div>}

          {!panding && <ScrollArea className="h-screen w-auto border">

            {docs.map((d: any) =>
              <div key={d.key} className={cn("h-[150px] w-full border-b bg-neutral-100 hover:bg-accent px-2 grid grid-cols-[50px_350px_25vw]",
                d.guid === guid && "bg-muted")}>
                <div className="">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox style={{ marginLeft: '.5rem', marginTop: '4rem' }} checked={checkked(d.guid)} onClick={() => switchTask(d.guid)}></Checkbox>
                    </TooltipTrigger>
                    <TooltipContent>Wybierz</TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-flow-row" onClick={() => setGuid(d.guid)}>
                  <div style={{fontWeight: "bold"}}><span className="text-slate-600 text-[0.8rem]">Znak kancelarii.: </span>{d.znak_kancelarii}</div>
                  <div><span className="text-slate-600 text-[0.8rem]">Data przyjecia </span>{d.data_przyjecia}</div>
                  {/* <div><span className="text-slate-600 text-[0.8rem]">Data skanu </span>{d?.data_skanu}</div> */}
                  <a href={"/dokument?guid=" + d.guid} download={d.guid}>
                    <span className="text-slate-900 text-[0.8rem]">{d.guid}</span>
                  </a>
                  <Popover>
                    <PopoverTrigger asChild onClick={() => setZmiana((d.znak_kancelarii != null) ? d.znak_kancelarii : '')} >
                      <Button variant="outline" size="sm" className="h-7 text-[0.8rem]">Zmień przypisanie</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-300">

                      <Input value={zmiana} onChange={(e: any) => {
                        setZmiana(e.target.value?.toUpperCase())
                      }}
                        name="znak"
                        className="col-span-2 h-8"
                      />
                      <PopoverClose asChild>
                        <Button variant="ghost" onClick={zmienZnak}>Zmień</Button>
                      </PopoverClose>



                    </PopoverContent>
                  </Popover>

                </div>
                <div className="self-center px-8" onClick={() => setGuid(d.guid)}>
                  <Okienko dane={d}></Okienko>
                </div>

              </div>
            )}

          </ScrollArea>}
        </span>
        <span style={{ width: "50vw", position: "relative" }}>  {(guid != null) && <Image className="rounded-lg"
          src={'/okienko/' + guid + '/strona.png'}
          fill={true}
          objectFit="contain"
          alt="Podgląd pierwszej stony skanu"
        />}
        </span>
      </div>
    </Tabs>
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{(akcjeDialog === 'usun') && <span>Usuwanie wybranych pozycji z listy skanów</span>}
            {(akcjeDialog !== 'usun') && <>Zbiorcze akcje {akcjeDialog}</>}</DialogTitle>
          <DialogDescription>Wybrano {tasks.length} pozycji
          </DialogDescription>
          <Progress value={77 / 100} />


          {(akcjeDialog !== 'Wydruki' && akcjeDialog !== 'usun') &&
            <ul>
              {tasks.map(task => <>
                <li key={task.guid}> {task.guid} <Checkbox checked={task.done}></Checkbox></li>
              </>)}
            </ul>}


        </DialogHeader>
      </DialogContent>
    </Dialog>
  </>)
}



export function TagStrona({ dane }: { dane: any }) {

  function prepare(json_dane: any) {
    try {
      const strona = JSON.parse(json_dane)
      return strona
    } catch (e) {
      return null
    }
  }

  const strona = prepare(dane)

  return (<div>
    {strona && <div>
      <div style={{ width: "25vw", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{strona.kr_nazwa} {strona.kr_nazwisko} {strona.kr_imie}</div>
      <div style={{ width: "25vw", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{strona.kr_ulica} {strona?.kr_adres_nr}</div>
      <div style={{ width: "25vw", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{strona?.kr_kodpocztowy} {strona.kr_miejscowosc}</div>
    </div>}
  </div>)

}

function InfoTag({ name, children }: any) {
  return (<div><span className="text-slate-600 text-[0.8rem]">{name} </span>{children}</div>)
}

function Okienko({ dane }: { dane: any }) {
  return (<>

    <Image className="rounded-lg"
      src={'/rejestracja/znak?guid=' + dane.guid}
      height={150}
      width={220}
      alt="Okienko"
    />
  </>)

}