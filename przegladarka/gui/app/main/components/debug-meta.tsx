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
import { useEffect, useState, useTransition } from "react"
import { tagi, historia} from "../actions"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// import { useSigmaStream } from "@/lib/use-sigma-stream"

const formatter = new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

export function DebugMeta({ guid }: { guid: any }) {
    const [tags, setTags] = useState<any>()
    const [hist, setHist] = useState<any>([])
    const [panding, setTransition] = useTransition()
    // const lastSigma = useSigmaStream(['abba',guid,'suares'])

    const historiaCols: ColumnDef<any>[] = [
        {
            accessorKey: "hi_id",
            header: "ID",
        },
        {
            id: "created",
            accessorFn: (d) => formatter.format(d.hi_created),
            header: "Data"
        },
        {
            accessorKey: "hi_typ",
            header: "Typ"
        },
        {
            accessorKey: "hi_wpis",
            header: "Opis"
        }
    ]

    useEffect(() => {
        setTransition(async () => {
            // var data = await tagi(info.guid)
            // setTags(data)
            var data = await historia(guid)
            setHist(data)
        })
        // TODO w try musi wskazywac na proxowana Sigme
        // const sse = new EventSource('/news')
        // sse.addEventListener('UPDATED',(e)=>{alert(e.data)})

    }, [guid])


    return (<>
        { (guid != null) &&<h2 className="pt-10 pl-10 pr-10" >Identyfikator dokumentu: {guid} 
            <a href={"/dss/validation/guid/"+guid} target="dss"
            className="inline-flex items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 justify-start">
                Link do walidacji podpisów</a></h2>}
        <div className="container pt-10  pl-10 pr-10" >
            Historia
            <DataTable columns={historiaCols} data={hist} />
        </div>

    </>)
}


