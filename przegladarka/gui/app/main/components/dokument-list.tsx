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
import { useEffect, useTransition } from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTask, useTaskDispatch } from '@/lib/tasks'
import { useList } from "@/lib/list"
import { format } from "date-fns"
import { Signature } from "lucide-react"
import { useRefresh } from "@/lib/refresher"
import { usePagina } from "@/lib/pagina"




export function DokumentList(props: any) {
  const clickHandler = props?.onClick
  const zrodlo = props?.zrodlo
  const guid = props?.guid
  const query = props?.query
  const [panding, setTransition] = useTransition()
  const [refresh, setRefresh] = useRefresh()

  const tasks = useTask()
  const dispatch = useTaskDispatch()
  const [lista, setLista] = useList()
  const [pagina, setPagina] = usePagina()

  useEffect(() => {
    var dane: any[] = []

    var resp: {dane: any[], count: any, limit: any, offset: any} = {dane: [], count: null, limit: null, offset: null}
    dispatch({ action: 'clear' })
    setTransition(async () => {
      resp = await zrodlo(query, pagina.limit, pagina.offset)
      console.log(JSON.stringify(resp))
      dane = resp.dane
      setPagina({count : resp.count, limit: resp.limit, offset: resp.offset })
      setLista(dane)
    })

  }, [zrodlo,query,refresh])


  function switchTask(guid: any) {
    const action = (tasks.map(t => t.guid).includes(guid)) ? 'delete' : 'add'
    dispatch({ action, guid })
  }

  function checkked(guid: string) {
    return (tasks.map(t => t.guid).includes(guid))
  }

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-0 p-0 pt-0 bg-list">
        {lista.map((p: { guid: string, pozycja: number, naglowek: string, istotna_data: any, tresc: string, stopka: string, flagi: any }) => 
          <div
            key={p.pozycja}
            style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr' }}
            className={cn(
              "p-0 text-left text-sm border-b transition-all hover:bg-accent",
              p.pozycja === guid?.pozycja && "bg-muted"
            )}>
            <div style={{ height: '100%' }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Checkbox style={{ marginLeft: '.5rem', marginTop: '2rem' }} checked={checkked(""+p.pozycja)} onClick={() => switchTask(""+p.pozycja)}></Checkbox>
                </TooltipTrigger>
                <TooltipContent>Wybierz</TooltipContent>
              </Tooltip>
            </div>

            <div
              onClick={() => clickHandler(p)}
              className={cn("flex flex-col  gap-2 transition-all p-2 text-left text-sm ")}>

              <div className="flex items-center">

                <div className="flex items-center gap-2">
                  <div className="font-semibold">{p.naglowek} </div>
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    p.guid === guid
                      ? "text-foreground"
                      : "text-muted-foreground"

                  )}
                >
                  {format(p.istotna_data, 'dd.MM.yyyy')}
                </div>
              </div>
              <div className="text-xs font-medium">{p.tresc}</div>
              <div className="flex items-center">
                <div className="flex items-center line-clamp-2 text-xs text-muted-foreground">
                  {p.guid.substring(0, 300)}
                </div>
                <div className="ml-auto text-xs">
                 {p.stopka}
                </div>
                {(p?.flagi)&&<>
                  <Signature className="h-4 w-4 ml-auto text-xs"/>
                </>}
              </div>
            </div>

          </div>
        )}
      </div>
    </ScrollArea>
  )
}
