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

import React, { useEffect, useTransition } from "react"
import { przetworzone_in } from "../actions"
import { usePagina } from "@/lib/pagina"
import { useRefresh } from "@/lib/refresher"
import { Paginator } from "@/app/main/components/toolbar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Przetworzone(props: any) {
  const [zrodlo, setZrodlo] = React.useState('Przetworzone')
  const [docs, setList] = useList()
  const [query, setQuery] = React.useState('')
  const [panding, setTransition] = useTransition()
  const [pagina, setPagina] = usePagina()
  const [refresh, setRefresh] = useRefresh()

  useEffect(() => {
    setTransition(async () => {
      const resp = await przetworzone_in(query, pagina.limit, pagina.offset)
      const dane = resp.dane
      setPagina({ count: resp.count, limit: resp.limit, offset: resp.offset })
      setList(dane)
    })
  }, [refresh, query])


  return (<>
    <Tabs defaultValue="all">
      <div className="flex items-center pr-4 py-2">
        <SidebarTrigger />

        <SearchBox zrodlo={zrodlo} search={(t: any) => setQuery(t)} />


        <div className="flex items-center gap-3 px-4 w-[300px]">
          <Paginator />
        </div>




      </div>
      <Separator />

      {panding && <div className="h-screen w-auto border">
        <Skeleton className="h-[150px] w-full border-brounded-xl grid" >
          <h3 className="scroll-m-20 text-xl tracking-tight self-center justify-self-center">
            ładuje ...
          </h3>

        </Skeleton>

      </div>}
      {!panding && <ScrollArea className="h-screen w-auto border">

        {docs.map((d: any) =>
          <div key={d.guid} className="h-[110px] w-full border-b bg-neutral-100 hover:bg-accent px-2 grid grid-cols-[50px_1fr_1fr_1fr_1fr] py-1">
            <div className="">

            </div>
            <div className="grid grid-flow-row">
              <InfoTag name="Znak: "> {d?.oznaczenie}</InfoTag>
              <InfoTag name="Wprowadził(a): ">{d?.uid_wprowadzenia}</InfoTag>
              <InfoTag name="Data wprowadzenia: ">{d?.data_wprowadzenia}</InfoTag>
              <a href={"/dokument?guid=" + d.guid} download={d.guid}>
                <span className="text-slate-900 text-[0.8rem]">{d.guid}</span>
              </a>

            </div>
            <div className="grid grid-flow-row">
              <InfoTag name="Na wydział.: ">{d.na_wydzial}</InfoTag>
              <InfoTag name="Dekretował(a): ">{d?.uid_na_wydzial}</InfoTag>
              <InfoTag name="Data dekretacji: ">{d?.na_wydzial_data}</InfoTag>
              <InfoTag name="Uwagi: ">{d?.na_wydzial_opis}</InfoTag>


            </div>
            <div className="grid grid-flow-row">
              <InfoTag name="Na pracowanika: ">{d?.na_pracownika}</InfoTag>
              <InfoTag name="Dekretował(a): ">{d?.uid_na_pracownika}</InfoTag>
              <InfoTag name="Data dekretacji: ">{d?.na_pracownika_data}</InfoTag>
              <InfoTag name="Uwagi: ">{d?.na_pracownika_opis}</InfoTag>
            </div>

            <div className="grid grid-flow-row">
              <InfoTag name="Nr kancelarii: ">{d.znak_pisma}</InfoTag>
              <InfoTag name="Stan: ">{d.stan}</InfoTag>
              <InfoTag name="Zakończył(a): ">{d?.pr_uid}</InfoTag>
              <InfoTag name="Data akcji: ">{d?.pr_created}</InfoTag>
            </div>

            {/* <div className="grid grid-flow-row">
              <InfoTag name="PESEL: ">{d?.pesel}</InfoTag>
              <div className="text-[0.8rem] whitespace-pre-line">{d?.ekstrakt}</div>
            </div> */}

          </div>
        )}

      </ScrollArea>}

    </Tabs>

  </>)
}


function InfoTag({ name, children }: any) {
  return (<div><span className="text-slate-600 text-[0.8rem]">{name} </span>{children}</div>)
}