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
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server';
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
    const headersList = await headers()
    const searchParams = request.nextUrl.searchParams
    const guid = searchParams.get('guid')
    //TODO dodaj security check na bazie 
    const rs = await query("SELECT obraz_znaku FROM skany WHERE guid = $1 and obraz_znaku IS NOT NULL", [guid])
    console.log("Rows.lenght"+ rs.rows.length)
    if (rs.rowCount == 1) {
        const dane = rs.rows[0].obraz_znaku
        // const buffer = Buffer.from(dane)
        const reps = new Response(dane)
        return reps
    }
    return new Response(null);

}

