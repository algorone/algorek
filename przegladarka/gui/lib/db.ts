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
"use server"
import pg from 'pg'

const { Pool } = pg

// TODO use pure Pool() with standard PG envs
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ? process.env.DB_PORT : '5432', 10),
    database: process.env.DB_DATABASE,
}
)


export async function connect() {
    return pool.connect()
}

export async function query(queryStr: string, values?: any[]) {
    return pool.query(queryStr, values)
}

export async function sprwdz_dostep(guid: any, uid: number) {
    const sec_check = await query("SELECT dostep($1, ids($2)) dostep", [guid, uid])
    const dostep = sec_check.rows[0].dostep
    return (dostep)
}