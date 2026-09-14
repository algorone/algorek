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

