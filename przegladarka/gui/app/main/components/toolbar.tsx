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
import {
  MoreVertical,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Signature,
  Check,
  Combine} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"



import { Button } from "@/components/ui/button"
import { useList } from "@/lib/list"
import { useCerts } from "@/lib/certs"

import { useTask, useTaskDispatch } from "@/lib/tasks"
import { useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { zlecenie } from "../actions"
import { useRefresh } from "@/lib/refresher"
import { usePodpis } from "@/lib/podpis"
import { Separator } from "@/components/ui/separator"
import { usePagina } from "@/lib/pagina"

export type Akcje = 'podpisz' | 'zatwierdz' |'odrzuc' | 'aranzuj'

export const tytulyAkcji: Record<Akcje, string> = {
 podpisz: 'Podpisz', zatwierdz: 'Zatwierdź', odrzuc: 'Odrzuć', aranzuj: 'Aranżuj'
}

export const mapaAkcji: { [key: string]: { [key: string]: boolean } } = {
  Kolejki:   { podpisz: true,  zatwierdz: true,  odrzuc: true,  aranzuj: false },
  Komorka:   { podpisz: false, zatwierdz: true,  odrzuc: true,  aranzuj: false },
  Pracownik: { podpisz: false, zatwierdz: true,  odrzuc: true,  aranzuj: false },
  Oznaczenie:{ podpisz: false, zatwierdz: true,  odrzuc: true,  aranzuj: false },
  Obsłużone: { podpisz: false, zatwierdz: false, odrzuc: false, aranzuj: false },
  Dokument:  { podpisz: true,  zatwierdz: true,  odrzuc: true,  aranzuj: false },
  Aranżacje: { podpisz: false, zatwierdz: true,  odrzuc: true,  aranzuj: false },
  Purde: { podpisz: false, zatwierdz: true,  odrzuc: true,  aranzuj: false },
}

export function ActionsToolbar({ guid = null, zrodlo, multi = false, odrzuc= null, isDecydent=null, zatwierdz=null, podpisz =null, aranzuj =null}: { guid?: any, zrodlo: any, multi?: boolean, isDecydent?: any, zatwierdz?:any, podpisz?:any, odrzuc?:any, aranzuj?:any}) {

  const [docs, setList] = useList() 
  const tasks = useTask()
  const dispatch = useTaskDispatch()
  const [openDialog, setOpenDialog] = useState(false)
  const [curtenAction, setCurrentAction] = useState<Akcje>()
  const [panding, setTransition] = useTransition()
  const [prog, setProg] = useState<number>(0)
  const [podpis, setPodpis] = usePodpis()
  const [refresh, setRefresh] = useRefresh()


  function isActive(test: Akcje) {
    if (zrodlo) {
      return mapaAkcji[zrodlo][test]
    }
    return mapaAkcji['Dokument'][test]
  }

  function isDisabled(test: Akcje) {
    if (multi) {
      return !(tasks && tasks.length > 0)
    } else
      return (!guid)
  }

  function isMulti() {
    return (multi && tasks && tasks.length > 0)
  }
  //akcje
  async function test(guid: any) {
    return new Promise((resolve) => setTimeout(resolve, 1000))
  }


  function runAction(akcja: Akcje, func: any) {
    return function () {
      if (isMulti()) {
        setOpenDialog(true)
        setCurrentAction(akcja)
        const todo = tasks
        setTransition(async () => {
          const guids: any[] = []
          for (const task of todo) {
            await func(task.guid)
            guids.push(task.guid)
            dispatch({ guid: task.guid, action: 'done' })
          }
          await zlecenie(akcja, guids)
          setOpenDialog(false)
          setRefresh(Math.random())
        })
      } else {
        setProg(25)
        setOpenDialog(true)
        setCurrentAction(akcja)
        setProg(50)
        setTransition(async () => {
          setProg(75)
          await func(guid)
          setProg(100)
          setOpenDialog(false)
        })

      }
    }

  }


  function closeDialog(open: boolean): void {
    setOpenDialog(open)
    if (multi)
      dispatch({ action: 'clear' })
  }

  return (
    <>
      {isActive('podpisz') && <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isDisabled("podpisz") || !isDecydent()} onClick={runAction("podpisz", podpisz)}>
            <Signature className="h-4 w-4" />
            <span className="sr-only">Podpisz</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Podpisz: {podpis}</TooltipContent>
      </Tooltip>}
      {isActive('zatwierdz') && <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isDisabled("zatwierdz") || !isDecydent()} onClick={runAction("zatwierdz", zatwierdz)}>
            <Check className="h-4 w-4" />
            <span className="sr-only">Zatwierdź</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zatwierdź</TooltipContent>
      </Tooltip>}
      {isActive('odrzuc') && <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isDisabled("odrzuc")} onClick={runAction("odrzuc", odrzuc)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Odrzuć</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Odrzuć</TooltipContent>
      </Tooltip>}
      {isActive('aranzuj') && <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isDisabled("aranzuj")} onClick={runAction("aranzuj", aranzuj)}>
            <Combine className="h-4 w-4" />
            <span className="sr-only">Aranżuj</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Aranżuj</TooltipContent>
      </Tooltip>}
      {(guid == null && zrodlo != null) &&
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          {(zrodlo == 'Sprawa') || <Paginator />}
        </>
      }

      <Dialog open={openDialog} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{curtenAction && tytulyAkcji[curtenAction]}</DialogTitle>
            <DialogDescription>{curtenAction && tytulyAkcji[curtenAction]} {multi && tasks && <> {tasks.length} zadań</>}
            </DialogDescription>
            {multi && <div>
              <ul>
                {tasks.map(task => <>
                  <li key={task.guid}> {task.guid} <Checkbox checked={task.done}></Checkbox></li>
                </>)}
              </ul>
            </div>}
            {!multi && guid && <>
              {guid}
              <Progress value={prog} />
            </>}
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </>
  )
}

export function Paginator() {
  const [pagina, setPagina] = usePagina()
  const [refresh, setRefresh] = useRefresh()
  const dispatch = useTaskDispatch()
 

  function wyswitl() {
    if (pagina.count == 0)
      return 'Brak danych'
    const start = (pagina.offset + 1)
    var stop = (pagina.offset + pagina.limit)
    if (stop > pagina.count) stop = pagina.count
    return '' + start + '–' + stop + ' z ' + pagina.count
  }

  function nastepna() {
    const newOffset = pagina.offset + pagina.limit
    setPagina({ ...pagina, offset: newOffset })
    setRefresh(Math.random())
    dispatch({ action: 'clear' })
  }

  function poprzednia() {
    const newOffset = pagina.offset - pagina.limit
    setPagina({ ...pagina, offset: (newOffset >= 0) ? newOffset : 0 })
    setRefresh(Math.random())
    dispatch({ action: 'clear' })
  }

  return (<>
    <span style={{ fontSize: "small", marginLeft: "auto" }}>{wyswitl()}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="w-4 h-10"
          onClick={poprzednia}
          disabled={pagina.offset == 0}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Poprzednię</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Poprzednie</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="w-4 h-10"
          onClick={nastepna}
          disabled={pagina.offset + pagina.limit >= pagina.count}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Następne</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Następne</TooltipContent>
    </Tooltip>
  </>)

}

export function ActionsMenu(guid: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!guid}>
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuItem><ReplyAll className="h-4 w-4" /> Zwróć </DropdownMenuItem>
        <DropdownMenuItem onClick={() => startSkaner()}><ScanText className="h-4 w-4" /> Skanuj</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}