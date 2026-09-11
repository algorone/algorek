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
import { get_uid, grupy, uzytkownicy } from "@/app/main/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRefresh } from "@/lib/refresher"
import { group } from "console"
import React, { useEffect, useState, useTransition } from "react"
import { dekretacja_set_na_pracownika, dekretacja_set_na_pracownika_opis, dekretacja_set_na_wydzial, dekretacja_set_na_wydzial_opis, dekretacja_set_oznaczenie } from "../actions"
import { Check, CircleX, Delete, MoreVertical, SoapDispenserDroplet, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DekretacjaNaWydzial({ dekretacja }: { dekretacja: any }) {
    const [panding, setTransition] = useTransition()
    const [wydzialy, setWydzialy] = useState<any>([])
    const [refresh, setRefresh] = useRefresh()
    const [kod, setKod] = useState<any>([])
    const [opisWydzial, setOpisWydzial] = useState<any>()
    const [opisPracownik, setOpisPracownik] = useState<any>()
    const [pracownik, setPracownik] = useState<any>()
    const [pracownicy, setPracownicy] = useState<any>([])
    const [uwagi, setUwagi] = useState<any>([])
    const [oznaczenie, setOznaczenie] = useState<any>()

    useEffect(() => {

        setTransition(async () => {
            const grups = await grupy()
            const users = await uzytkownicy()
            const kod = dekretacja?.na_wydzial
            if (kod != null && kod !== "") {
                // if (grups.find((g: any) => g.kod == kod) == null) {
                //     grups.push({ 'kod': kod, nazwa: '' })
                // }
                const kody = kod.split(',')
                setKod(kody)
            } else {
                setKod([])
            }
            setWydzialy(grups)
            setPracownicy(users)
            setPracownik(dekretacja?.na_pracownika)
            const opis = (dekretacja?.na_wydzial_opis != null) ? (dekretacja.na_wydzial_opis) : ""
            setOpisWydzial(opis)
            const opis2 = (dekretacja?.na_pracownika_opis != null) ? (dekretacja.na_pracownika_opis) : ""
            setOpisPracownik(opis2)
            setOznaczenie(dekretacja.oznaczenie)
            setUwagi((dekretacja.na_pracownika_opis != null) ? dekretacja.na_pracownika_opis : 'Brak uwag')

        }
        )

    }, [dekretacja])

    async function dodajWydzial(nowy: any) {

        const test = [...kod]
        if (!test.includes(nowy)) {
            const noweKody = [...kod, nowy]
            setKod(noweKody)
            await zmienWdzial(noweKody)
        }

    }

    async function usunWydzial(nowy: any) {
        const noweKody = [...kod].filter((k: any) => k !== nowy)
        setKod(noweKody)
        await zmienWdzial(noweKody)
    }

    async function zmienWdzial(noweKody: any) {
        await dekretacja_set_na_wydzial(dekretacja?.dk_id, noweKody.join(','));
        setRefresh(Math.random())
    }

    async function zmienOpisWydzial() {
        await dekretacja_set_na_wydzial_opis(dekretacja?.guid, opisWydzial)
        setRefresh(Math.random())
    }

    return <div className="flex items-center p-2 flex-wrap">
        {dekretacja?.na_wydzial_data == null && <>
            <div className="flex gap-2">
                <div><div className="px-1 py-2">Dekretacja:</div></div>
                <div>
                    <Select name="wydzial" onValueChange={dodajWydzial} value="">
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Wydział" />
                        </SelectTrigger>
                        <SelectContent>
                            {wydzialy.map((w: any) => <SelectItem key={w.gid} value={w.kod}>{w.kod} {w.nazwa}</SelectItem>)}
                        </SelectContent>

                    </Select>
                </div>
                <div className="flex gap-2">{kod.map((k: any) => <Badge variant="outline" key={k}><span className="px-2">{k}</span><Button variant="destructive" size="xs" onClick={() => usunWydzial(k)}><CircleX /></Button></Badge>)}</div>
                <div className="w-[600px] relative">
                    <Input placeholder="Uwagi do dekretacji" value={opisWydzial} onChange={(e: any) => setOpisWydzial(e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={zmienOpisWydzial} className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2">
                        <Check className="h-4 w-4" />

                    </Button>
                </div>
            </div>
        </>
        }

    </div>
}

export function DekretacjaNaPracownika({ dekretacja }: { dekretacja: any }) {
    const [panding, setTransition] = useTransition()
    const [wydzialy, setWydzialy] = useState<any>([])
    const [refresh, setRefresh] = useRefresh()
    const [kod, setKod] = useState<any>([])
    const [opisWydzial, setOpisWydzial] = useState<any>()
    const [opisPracownik, setOpisPracownik] = useState<any>()
    const [pracownik, setPracownik] = useState<any>()
    const [pracownicy, setPracownicy] = useState<any>([])
    const [uwagi, setUwagi] = useState<any>([])
    const [oznaczenie, setOznaczenie] = useState<any>()

    useEffect(() => {

        setTransition(async () => {
            const grups = await grupy()
            const users = await uzytkownicy()
            const kod = dekretacja?.na_wydzial
            setKod(kod)
            setPracownicy(users)
            setPracownik(dekretacja?.na_pracownika)
            const opis = (dekretacja?.na_wydzial_opis != null) ? (dekretacja.na_wydzial_opis) : ""
            setOpisWydzial(opis)
            const opis2 = (dekretacja?.na_pracownika_opis != null) ? (dekretacja.na_pracownika_opis) : ""
            setOpisPracownik(opis2)
            setOznaczenie(dekretacja.oznaczenie)
            setUwagi((dekretacja.na_pracownika_opis != null) ? dekretacja.na_pracownika_opis : 'Brak uwag')

        }
        )

    }, [dekretacja])

    function isUzytkownikDecydent() {
    // TODO dodac prawdziwa biznesowa logike
    // if (podpis == null || podpis === 'null')
    //   return false
    // return ("" + podpis + "")
    return true
  }


  function isZwrot():boolean{
    return (kod?.includes('<'))

  }

  async function przygotujZwrot(){

    await dekretacja_set_na_wydzial(dekretacja?.dk_id,'<- ' +  kod)
    await dekretacja_set_na_pracownika(dekretacja?.dk_id, null);
    setKod("<- " + kod)
    
    setRefresh(Math.random())
  } 

    async function zmienOpisPracownik() {
        await dekretacja_set_na_pracownika_opis(dekretacja?.dk_id, opisPracownik)
        setRefresh(Math.random())
    }

    async function zmienPracownika(nowy: any) {
        if(isZwrot()) return;
        await dekretacja_set_na_pracownika(dekretacja?.dk_id, nowy);
        setPracownik(nowy)
        setRefresh(Math.random())
    }


    return <div className="flex items-center p-2 flex-wrap">
        {dekretacja && <>
            <div className="flex gap-2">
                <div><div className="px-1 py-2">Dekretacja: </div></div>
                <div>
                    <Select name="wydzial" value={kod} onValueChange={przygotujZwrot}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Wybierz wydział" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={kod}>{kod} </SelectItem>
                            {isUzytkownikDecydent()&&(!isZwrot())&&<SelectItem value="ZWROT" >Zwrot</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select name="pracownik-na" value={pracownik} onValueChange={zmienPracownika} disabled={isZwrot()}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Wybierz pracownika" />
                        </SelectTrigger>
                        <SelectContent>
                            {pracownicy.map((p: any) => <SelectItem key={p.uid} value={p.login}>{p.nazwa} ({p.login})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[600px] relative">
                    <Input placeholder="Uwagi do dekretacji" value={opisPracownik} onChange={(e: any) => setOpisPracownik(e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={zmienOpisPracownik} className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2">
                        <Check className="h-4 w-4" />

                    </Button>
                </div>
            </div>
        </>}

    </div>
}

export function DekretacjaNaSprawe({ dekretacja }: { dekretacja: any }) {
    const [panding, setTransition] = useTransition()
    const [wydzialy, setWydzialy] = useState<any>([])
    const [refresh, setRefresh] = useRefresh()
    const [kod, setKod] = useState<any>([])
    const [opisWydzial, setOpisWydzial] = useState<any>()
    const [opisPracownik, setOpisPracownik] = useState<any>()
    const [pracownik, setPracownik] = useState<any>()
    const [pracownicy, setPracownicy] = useState<any>([])
    const [uwagi, setUwagi] = useState<any>([])
    const [oznaczenie, setOznaczenie] = useState<any>()

    useEffect(() => {

        setTransition(async () => {
            const grups = await grupy()
            const users = await uzytkownicy()
            const kod = dekretacja?.na_wydzial
            setKod(kod)
            setWydzialy(grups)
            setPracownicy(users)
            setPracownik(dekretacja?.na_pracownika)
            const opis = (dekretacja?.na_wydzial_opis != null) ? (dekretacja.na_wydzial_opis) : ""
            setOpisWydzial(opis)
            const opis2 = (dekretacja?.na_pracownika_opis != null) ? (dekretacja.na_pracownika_opis) : ""
            setOpisPracownik(opis2)
            setOznaczenie((dekretacja?.oznaczenie!=null)?dekretacja.oznaczenie: "")
            setUwagi((dekretacja.na_pracownika_opis != null) ? dekretacja.na_pracownika_opis : 'Brak uwag')

        }
        )

    }, [dekretacja])

    async function zmienOznaczenie() {
        await dekretacja_set_oznaczenie(dekretacja?.dk_id, oznaczenie)
        setRefresh(Math.random())
    }

    function isUzytkownikDecydent() {
    // TODO
    // return (pracownik==='tester')
    return false
  }

    async function zmienPracownika(nowy: any) {
        if (!isUzytkownikDecydent()) {
            return
        }
        await dekretacja_set_na_pracownika(dekretacja?.dk_id, nowy);
        setPracownik(nowy)
        setRefresh(Math.random())
    }

    return <div className="flex items-center p-2 flex-wrap">

        {dekretacja && <>
            <div className="flex gap-2">
                <div><div className="px-1 py-2">Dekretacja:</div></div>
                <div>
                    <Select name="wydzial" value={kod}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Wybierz wydział" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={kod}>{kod} </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select name="pracownik-na" value={pracownik} onValueChange={zmienPracownika}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Wybierz pracownika" />
                        </SelectTrigger>
                        <SelectContent>
                            {pracownicy.map((p: any) => <SelectItem key={p.uid} value={p.login}>{p.nazwa} ({p.login})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select name="pracownik-na" value={uwagi} >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Uwagi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={uwagi}>{uwagi}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[400px] relative">
                    <Input placeholder="Nr sprway lub inne oznacznie przypisane do pisma" value={oznaczenie} onChange={(e: any) => setOznaczenie(e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={zmienOznaczenie} className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2">
                        <Check className="h-4 w-4" />
                    </Button>
                
   
                </div>
            </div>
        </>}
    </div>
}
