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
'use client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { query } from "@/lib/db";
import { FileTerminal, Goal, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { queryParse } from "@/lib/query.parser";
import { usePagina } from "@/lib/pagina";
import { Checkbox } from "@/components/ui/checkbox";

export function SearchBox(props: any) {

  const [term, setTerm] = useState("")

  const [zawiera, setZawiera] = useState<string>()
  const [niezawiera, setNiezawiera] = useState<string>()
  const [dataOd, setDataOd] = useState<any>()
  const [dataDo, setDataDo] = useState<any>()
  const [pagina, setPagina] = usePagina()
  const [moje, setMoje] = useState<any>()


  function search(filter: any) {
    if (props.search !== undefined) {
      props.search(filter)
    }
    setPagina({ ...pagina, offset: 0 })
  }

  function searchForm(formData: any) {
    const query = formData.get("query");
    search(query)
  }

  function searchBox(formData: any) {
    const filter = {
      zawiera: formData.get("zawiera"),
      od: formData.get("od"), do: formData.get("do"), moje: formData.get("moje")
    }

    if (filter.od != "") {
      filter.od = ` od:${(new Date(filter.od)).toLocaleDateString()}`
    }
    if (filter.do != "") {
      filter.do = ` do:${(new Date(filter.do)).toLocaleDateString()}`
    }
    if (filter.moje != null) {
      filter.moje = 'moje: '
    } else {
      filter.moje = ''
    }

    const query = `${filter?.moje}${filter?.zawiera}${filter.od}${filter.do}`.trim()
    setTerm(query)
    search(query)
  }

  function parse() {
    function parsePlDate(dateString: string) {
      const parts = dateString.split('.')
      if (parts.length == 3)
        return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0')
      else return null
    }
    const qo = queryParse(term.trim())
    var zawieraTerm = ' '
    var niezawieraTerm = ' '
    var dataOdTerm = null
    var dataDoTerm = null
    var mojeTerm = false
    console.log("Query : " + JSON.stringify(qo))
    qo.forEach((elem: any) => {
      if (typeof elem === 'string' || elem instanceof String)
        zawieraTerm += elem + ' '
      else if (typeof elem.neg === 'string')
        niezawieraTerm += elem.neg + ' '
      else if (typeof elem.od === 'string')
        dataOdTerm = parsePlDate(elem.od)
      else if (typeof elem.do === 'string')
        dataDoTerm = parsePlDate(elem.do)
      else if (elem?.moje) {
        mojeTerm = true
      }

    });
    setZawiera(zawieraTerm.trim())
    setNiezawiera(niezawieraTerm.trim())
    setDataOd(dataOdTerm)
    setDataDo(dataDoTerm)
    setMoje(mojeTerm)
  }




  return (
    <form style={{ width: '100%' }} action={searchForm}>
      <div className="relative">

        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={props.zrodlo} className="pl-8" name="query" value={term} onChange={(e: any) => setTerm(e.target.value)} />
        {(term !== '') &&
          <X onClick={() => { setTerm(''); setMoje(false); search(null) }}
            className="absolute right-8 top-0 h-10 w-10 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2" />}
        <Popover>
          <PopoverTrigger asChild onClick={parse} >

            <SlidersHorizontal className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2" />

          </PopoverTrigger>
          <PopoverContent className="w-200">
            <form className="grid gap-4" action={searchBox}>
              <div className="grid gap-2">
                <div className="grid grid-cols-6 items-center gap-4">
                  <Label htmlFor="zawiera">Zawiera:</Label>
                  <Input
                    value={zawiera} onChange={(e: any) => setZawiera(e.value)}
                    id="zawiera"
                    name="zawiera"
                    className="col-span-5 h-8"
                  />
                </div>
                {/* <div className="grid grid-cols-6 items-center gap-4">
              <Label htmlFor="niezawiera">Nie zawiera:</Label>
              <Input
                value={niezawiera} onChange={(e:any)=>setNiezawiera(e.value)}
                id="niezawiera"
                name="niezawiera"
                className="col-span-5 h-8"
              />
            </div> */}
                <div className="grid grid-cols-6 items-center gap-4">
                  <Label htmlFor="od">Od:</Label>
                  <Input
                    value={dataOd} onChange={(e: any) => setDataOd(e.value)}
                    id="od"
                    name="od"
                    type="date"
                    className="col-span-2 h-8"
                  />
                  <Label htmlFor="od">do:</Label>
                  <Input
                    value={dataDo} onChange={(e: any) => setDataDo(e.value)}
                    id="do"
                    name="do"
                    type="date"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-6 items-center gap-4">

                 <div></div>
                  <div className="col-span-4"  >
                    <Checkbox
                      checked={moje}
                      onClick={() => setMoje(!moje)}
                      id="moje"
                      name="moje" />

                    <Label htmlFor="moje"> Tylko dokumenty utworzone przeze mnie</Label>
                  </div>



                  <PopoverClose asChild>
                    <Button variant="ghost" type="submit">Szukaj</Button>
                  </PopoverClose>

                </div>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    </form>
  )
}
