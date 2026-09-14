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

const EVENT_BUS_URL = process.env.EVENT_BUS_URL
const SKANER_BUS_URL = EVENT_BUS_URL+'0'
const KOLEJKA_BUS_URL = EVENT_BUS_URL+'1'
const DRUKARKA_BUS_URL = EVENT_BUS_URL+'2'
const NLP_BUS_URL = EVENT_BUS_URL+'3'
const WYSYLKA_BUS_URL = EVENT_BUS_URL+'4'
const FAISS_BUS_URL = EVENT_BUS_URL + '5'
const PRZEKAZANIE_BUS_URL = EVENT_BUS_URL + '6'
const EMAIL_BUS_URL = EVENT_BUS_URL + '7'
const AUTOMATYZACJA_BUS_URL = EVENT_BUS_URL + '8'
const EZD_BUS_URL = EVENT_BUS_URL + '9'
const KANCELARIA_BUS_URL = EVENT_BUS_URL + '10'
const ZATWIERDZENIE_BUS_URL = EVENT_BUS_URL + '11'
const UPRAWNIENIA_BUS_URL = EVENT_BUS_URL + '12'
const EDORECZENIA_BUS_URL = EVENT_BUS_URL + '13'
const DRAFTY_BUS_URL = EVENT_BUS_URL + '14'
const AI_BUS_URL = EVENT_BUS_URL + '15'

async function send_to_bus(url: string, guid :string, akcja: string, uid:any){
      const resp = await fetch(url, {
        method: 'PUT',
        body: guid + ','+akcja+',' + uid
      })
}

export async function ZATWIERDZENIE_BUS(guid :string, akcja: string, uid:any){await send_to_bus(ZATWIERDZENIE_BUS_URL,guid,akcja, uid)}
export async function AI_BUS(guid :string, akcja: string, uid:any){await send_to_bus(AI_BUS_URL,guid,akcja, uid)}

