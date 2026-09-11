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
import { bramka_stan, kolory_zwrotek, wysylki, wysylki4guids, zakoncz_wysylki, zlecenie_bramka } from "../actions"
import { usePagina } from "@/lib/pagina"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import Image from 'next/image'
import { useRefresh } from "@/lib/refresher"
import { Paginator } from "@/app/main/components/toolbar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Signature } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@radix-ui/react-progress"
import { zlecenie } from "@/app/main/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"

const emptyList: any[] = [];

export function Wysylka(props: any) {
  const [zrodlo, setZrodlo] = React.useState('Wysyłka')
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
  const [wydrukId, setWydrukId] = useState()
  const [wydrukiZwrotek, setWydrukiZwrotek] = useState(emptyList)
  const [pokazObsluzone, setPokazObsluzone] = useState(false)
  const [pokazOdlozone, setPokazOdlozone] = useState(false)


  useEffect(() => {
    setTransition(async () => {
      const resp = await wysylki(query, pagina.limit, pagina.offset, pokazObsluzone, pokazOdlozone)
      const dane = resp.dane.map((d: any) => {
        d.key = d.guid + "0"
        return d
      })
      setPagina({ count: resp.count, limit: resp.limit, offset: resp.offset })
      setList(dane)
      dispatch({ action: 'clear' })
    })
  }, [refresh, pokazObsluzone, pokazOdlozone, query])

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
        await zlecenie(akcja, guids)
        const zmienione = await wysylki4guids(guids)
        const do_zmainy = docs.map((dok: any) => {
          const zmieniony = zmienione.find((d: any) => d.guid === dok.guid)
          if (zmieniony !== undefined)
            zmieniony.key = zmieniony.guid + "0"
          return (zmieniony !== undefined) ? zmieniony : dok
        })
        setList(do_zmainy)
        if (akcja === 'Wyślij') {
          setOpenDialog(false)
        }
      })

    }

  }

  function wysylka_disabled(): boolean {
    if (tasks.length == 0) return true
    const wybrane = docs.filter((d: any) => (d.stan !== null && d?.stan !== 'odłożone') && tasks.find((t: any) => t.guid === d.guid))
    return (wybrane.length > 0)
  }

  function wydruki_disabled(): boolean {
    if (tasks.length == 0) return true
    const wybrane = docs.filter((d: any) => (d?.stan !== 'wysłane' && d?.stan !== 'obsłużone') && tasks.find((t: any) => t.guid === d.guid))
    return (wybrane.length > 0)
  }

  function obsluzone_disabled(): boolean {
    if (tasks.length == 0) return true
    const wybrane = docs.filter((d: any) => (d?.stan !== 'wysłane') && tasks.find((t: any) => t.guid === d.guid))
    return (wybrane.length > 0)
  }

  async function wyslij(guid: any) {
    await zlecenie_bramka(guid)

  }

  function wydruki_zbiorcze() {
    setOpenDialog(true)
    setAkcjeDialog('Wydruki')
    const guids = tasks.map((t: any) => t.guid)
    setTransition(async () => {
      const zlecenie_id = await zlecenie('wydruk', guids)
      const kolory = await kolory_zwrotek(guids)
      for (let i = 0; i < kolory.length; i++) {
        const sorted = [... kolory[i].guids]
        sorted.sort((a,b)=> guids.indexOf(a) - guids.indexOf(b))
        const wydruk_id = await zlecenie('wydruk', sorted)
        kolory[i] = { ...kolory[i], wydrukId: wydruk_id }
      }
      setWydrukiZwrotek(kolory)
      setWydrukId(zlecenie_id)
    })
  }
  function zakoncz() {
    setOpenDialog(true)
    setAkcjeDialog('usun')
  }

  function usun_wybrane() {
    const guids = tasks.map((t: any) => t.guid)
    setTransition(async () => {
      const ret = await zakoncz_wysylki(guids)
      dispatch({ action: 'clear' })
      setOpenDialog(false)
      setRefresh(Math.random())
    })

  }

  function ustaw_stan(stan: any) {
    const guids = tasks.map((t: any) => t.guid)
    setTransition(async () => {
      await bramka_stan(guids, stan)
      dispatch({ action: 'clear' })
      setRefresh(Math.random())
    })
  }


  function closeDialog() {
    setOpenDialog(false)
  }

  async function closeExternalDialog(guid: any) {
    if (guid != null) {
      // setTransition(async () => {
      const guids: any[] = [guid]
      const zmienione = await wysylki4guids(guids)
      if (zmienione.length == 1) {
        const zmieniony = zmienione[0]
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].guid == zmieniony.guid) {
            zmieniony.key = zmieniony.guid + ((docs[i].key.endsWith(0)) ? "1" : "0")
            // alert(docs[i].key + " <=> " + zmieniony.key)
            docs[i] = zmieniony
          }
        }
      }

      setOpenExternalDialog(false)
      setExternalServiceGuid(null)

      // )

    } else {
      setOpenExternalDialog(false)
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

        <div className="flex items-center gap-3 px-4">
          <Checkbox id="obsluzone" checked={pokazObsluzone} onClick={() => setPokazObsluzone(!pokazObsluzone)} />
          <Label htmlFor="obsluzone">pokaż obsłużone</Label>
        </div>


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
        <Button variant="outline" disabled={wysylka_disabled()} onClick={runAction('Wyślij', wyslij)}> Wyślij do kancelarii</Button>
        <Button variant="outline" disabled={wydruki_disabled()} onClick={() => wydruki_zbiorcze()}>Wydruki zbiorcze</Button>
        <Button variant="outline" disabled={obsluzone_disabled()} onClick={() => ustaw_stan('obsłużone')} >Ustaw jako obsłużone</Button>
        <Button variant="ghost" disabled={(tasks.length == 0)} onClick={() => zakoncz()} className="decoration-red-600 mx-12" style={{ color: "red" }}>Przenieś do przetworzonych</Button>
        <Paginator />
        <Separator orientation="vertical" className="mx-1 h-6" />


      </div>
      {panding && <div className="h-screen w-auto border">
        <Skeleton className="h-[150px] w-full border-brounded-xl grid" >
          <h3 className="scroll-m-20 text-xl tracking-tight self-center justify-self-center">
            ładuje ...
          </h3>

        </Skeleton>

      </div>}
      {!panding && <ScrollArea className="h-screen w-auto border">

        {docs.map((d: any) =>
          <div key={d.key} className="h-[150px] w-full border-b bg-neutral-100 hover:bg-accent px-2 grid grid-cols-[50px_1fr_25vw_1fr_1fr]">
            <div className="">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Checkbox style={{ marginLeft: '.5rem', marginTop: '4rem' }} checked={checkked(d.guid)} onClick={() => switchTask(d.guid)}></Checkbox>
                </TooltipTrigger>
                <TooltipContent>Wybierz</TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-flow-row">
              <div> {d.tagi.oznaczenie}</div>
              <div><span className="text-slate-600 text-[0.8rem]">Nr ewid.: </span>{d.tagi?.nrewid}</div>
              <div><span className="text-slate-600 text-[0.8rem]">PESEL: </span>{d.tagi?.pesel}</div>
              <div><span className="text-slate-600 text-[0.8rem]">NIP: </span>{d.tagi?.nip}</div>
              <div><span className="text-slate-600 text-[0.8rem]">Zatwierdził: </span>{d?.nazwa}
                {(d?.podpis === 'podpisano') && <a href={"/dss/validation/guid/" + d.guid} target="dss"><Signature className="h-4 w-4 inline-block" /></a>}</div>
              <a href={"/dokument?guid=" + d.guid} download={d.guid}>
                <span className="text-slate-900 text-[0.8rem]">{d.guid}</span>
              </a>

            </div>
            <div className="grid grid-flow-row">
              <InfoTag name="ADE: ">
                {d.tagi?.ade}
              </InfoTag>
              <InfoTag name="Strona:">
                <TagStrona dane={d.tagi?.strona} />
              </InfoTag>
              {d.stan !== 'wysłane' && d.stan !== 'obsłużone' &&
                <Button variant="outline" size="sm" className="h-7 text-[0.8rem]" onClick={() => zmienStrone(d.guid)}>Zmień dane strony</Button>}

            </div>
            <div className="grid grid-flow-row overflow-auto">
              <InfoTag name="Nr dokumentu: ">{d.tagi.znak_kancelarii}</InfoTag>
              <InfoTag name="Zwrotka: ">{d.tagi.zwrotka}</InfoTag>
              <InfoTag name="Utworzył w kancelarii: ">{d.wyslal}</InfoTag>
              <InfoTag name="Status: ">{d.stan}</InfoTag>

            </div>
            <div className="self-center">
                <Okienko dane={d}></Okienko>
            </div>

          </div>
        )}

      </ScrollArea>}

    </Tabs>
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{(akcjeDialog === 'usun') && <span>Usuwanie wybranych pozycji z listy wysyłek</span>}
            {(akcjeDialog !== 'usun') && <>Zbiorcze akcje {akcjeDialog}</>}</DialogTitle>
          <DialogDescription>Wybrano {tasks.length} pozycji
          </DialogDescription>
          <Progress value={77 / 100} />

          {(akcjeDialog === 'usun') && <>
            <div className="grid grid-flow-col">

              <Button variant="destructive" onClick={usun_wybrane}>
                Przenieś wybrane pozycje do przetworzonych
              </Button>

              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Anuluj
              </Button>

            </div>
          </>}

          {(akcjeDialog !== 'Wydruki' && akcjeDialog !== 'usun') &&
            <ul>
              {tasks.map(task => <>
                <li key={task.guid}> {task.guid} <Checkbox checked={task.done}></Checkbox></li>
              </>)}
            </ul>}
          {akcjeDialog === 'Wydruki' && <>
            <div className="grid grid-flow-col">
              {wydrukiZwrotek.map((w: any) =>
                <Button asChild variant="outline">
                  <a href={"/wydruki/zwrotki/" + w?.wydrukId + "/" + (w.ta_tag2 ? w?.ta_tag2 : 'zwrotka') + ".html"} target="zwrotki"> Zwrotki {w?.nazwa} ({w?.guids?.length})</a>
                </Button>
              )}
              <Button asChild variant="outline">
                <a href={"/wydruki/zbiorczy/" + wydrukId + "/zbiorczy.pdf"} download={"Wydruk_zbiorczy_" + wydrukId + ".pdf"}> Zbiorczy wydruk dokumentów (pdf)</a>
              </Button>
              <Button asChild variant="outline">
                <a href={"/wydruki/zwrotki/"  + wydrukId + "/koperta.html"} target="zwrotki"> Kopery</a>
              </Button>
            </div>
          </>}


        </DialogHeader>
      </DialogContent>
    </Dialog>
    {/* TODO przywroc komunikacje z innym systemai przez eventy w przegldarce */}
    {/* <ExternalDialog
      externalServiceUrl={externalServiceUrl}
      externalServiceGuid={externalServiceGuid}
      openExternalDialog={openExternalDialog}
      closeExternalDialog={closeExternalDialog}
    /> */}

  </>)
}

export function ExternalDialog({ externalServiceUrl, openExternalDialog, closeExternalDialog, externalServiceGuid }: any) {

  useEffect(() => {
    const handler = (event: any) => {
      console.log("Akcja dla: " + externalServiceGuid + " -----> " + event.data)
      if (event.data.endsWith(externalServiceGuid))
        closeExternalDialog(externalServiceGuid)
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [closeExternalDialog, externalServiceGuid])

  return (
    <Dialog open={openExternalDialog} onOpenChange={closeExternalDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wyszukiwanie strony w bazie kancelarii</DialogTitle>
        </DialogHeader>
        <iframe src={externalServiceUrl} className="w-full h-[800px]"></iframe>
      </DialogContent>
    </Dialog>

  )
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
      <div style={{width: "25vw", textOverflow: "ellipsis", whiteSpace:"nowrap", overflow: "hidden"}}>{strona.kr_nazwa} {strona.kr_nazwisko} {strona.kr_imie}</div>
      <div style={{width: "25vw", textOverflow: "ellipsis", whiteSpace:"nowrap", overflow: "hidden"}}>{strona.kr_ulica} {strona?.kr_adres_nr}</div>
      <div style={{width: "25vw", textOverflow: "ellipsis", whiteSpace:"nowrap", overflow: "hidden"}}>{strona?.kr_kodpocztowy} {strona.kr_miejscowosc}</div>
    </div>}
  </div>)

}

function InfoTag({ name, children }: any) {
  return (<div><span className="text-slate-600 text-[0.8rem]">{name} </span>{children}</div>)
}

function Okienko({ dane }: { dane: any }){
  return(<>
{/* TODO przywrócic okieno */}
              {/* {(dane.tagi?.adresowanie==null)&&
              <Image className="rounded-lg"
                src={'/okienko/' + dane.guid + '/fragment.png'}
                height={150}
                width={220}
                alt="Okienko"
              />}
              {(dane.tagi?.adresowanie && dane.tagi.adresowanie.startsWith('pozycja:')) &&
             <Image className="rounded-lg"
                src={'/okienko/' + dane.guid + '/fragment.png?' + dane.tagi.adresowanie.substring(8)}
                height={150}
                width={220}
                alt="Okienko"
              />} */}
              {(dane.tagi?.adresowanie=='z etykiety')&&<div className="w-150">
                <InfoTag name="Adresat z etykiety:">
                  </InfoTag>
                  <div className=" text-[0.9rem]" style={{whiteSpace:"pre-wrap"}}> {dane.tagi?.ekstrakt}</div>
                   
              
                </div>}
  </>)

}