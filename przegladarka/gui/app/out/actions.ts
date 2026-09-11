"use server"

import { parseQueryForSearch } from "@/lib/utils"
import { cookies } from "next/headers"
import { get_uid } from "../main/actions"
import { query, sprwdz_dostep } from "@/lib/db"
import { AI_BUS, ZATWIERDZENIE_BUS } from "@/lib/bus"

//TODO przeniesc do globanego configa
const config = {
  STORE_URL: (process.env.DOCUMENT_STORE_URL) ? process.env.DOCUMENT_STORE_URL:""
}

async function tested_query(sql: string, tests: any[]) {

  let ret = sql
  for (let i = 0; i < tests.length; i++) {
    if (tests[i] !== null)
      ret = ret.replaceAll("--$" + (i + 1) + "--", "")
    else
      ret = ret.replaceAll("--$" + (i + 1) + "-IS-NULL--", "")
  }
  return await query(ret, tests)
}

export async function kolory_zwrotek(guids: any) {
  // const sql = "SELECT guid, ta_tag2 FROM tagi_ta WHERE ta_tag='kolor-zwrotki' AND guid IN (SELECT unnest($1::text[]))"
  const sql = `
WITH guids AS ( SELECT unnest($1::text[]) guid )
SELECT ta_tag2, json_agg(g.guid) guids, nazwy_zwrotek(ta_tag2) nazwa FROM guids g 
 LEFT JOIN tagi_ta t ON ( g.guid=t.guid AND t.ta_tag='kolor-zwrotki')
GROUP by ta_tag2;
  `
  const rs = await query(sql, [guids])
  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return dane
}

export async function przetworzone(term: string = '', limit: number = 50, offset: number = 0, order: string = 'pr_created') {
  let sql = `
SELECT p.guid, uu.nazwa pr_uid, TO_CHAR(p.pr_created,'DD.MM.YYYY HH12:MM') pr_created, 
  uc.nazwa uid_wprowadzenia, TO_CHAR(p.data_wprowadzenia,'DD.MM.YYYY HH12:MM') data_wprowadzenia,
  uz.nazwa uid_zatwierdzenia, TO_CHAR(p.data_zatwierdzenia,'DD.MM.YYYY HH12:MM') data_zatwierdzenia,
  uw.nazwa uid_wyslania, TO_CHAR(p.data_wyslania,'DD.MM.YYYY HH12:MM') data_wyslania,
  p.oznaczenie, p.numer_dokumentu, p.nrewid, p.stan
FROM przetworzone_pr p
 INNER JOIN uprawnienia up ON ( p.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
 LEFT JOIN uzytkownicy uc ON (p.uid_wprowadzenia = uc.uid )
 LEFT JOIN uzytkownicy uz ON (p.uid_zatwierdzenia = uz.uid )
 LEFT JOIN uzytkownicy uw ON (p.uid_wyslania = uw.uid )
 LEFT JOIN uzytkownicy uu ON (p.pr_uid = uu.uid )
WHERE 1 = 1
--$2-IS-NULL-- AND  length($2::text) IS NULL
--$2-- AND (oznaczenie LIKE $2::text)
  `
  let sql_count = `
SELECT count(*) c FROM przetworzone_pr p 
  INNER JOIN uprawnienia up ON ( p.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
WHERE 1 = 1
--$2-IS-NULL-- AND length($2::text) IS NULL
--$2-- AND ( oznaczenie LIKE $2::text )
`
  const uid = await get_uid()
  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)
  if (moje) {
    sql = sql.replace('(ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1)', 'up.uid = $1')
    sql_count = sql_count.replace('(ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1)', 'up.uid = $1')
  }

  const rs_count = await tested_query(sql_count, [uid, zawiera])

  const count = rs_count.rows[0].c;
  const rs = await tested_query(sql + ' ORDER BY ' + order + ' OFFSET $3 LIMIT $4 ', [uid, zawiera, offset, limit])
  const dane = rs.rows.map(rec => {
    return { ...rec }
  })

  return { count, limit, offset, dane }
}

async function do_przetworzonych(guids: any) {
  const sql = `
INSERT INTO public.przetworzone_pr(
	 guid, pr_uid, pr_created, uid_wprowadzenia, data_wprowadzenia, uid_zatwierdzenia, data_zatwierdzenia, uid_wyslania, data_wyslania, oznaczenie, nrewid, numer_dokumentu, stan, hashtag)
(
SELECT  d.guid, $2::integer,  now(), 
u.uid uid_wprowadzenia, d.do_created data_wprowadzenia,
b.uid uid_zatwierdzenia, b.created data_zatwierdzenia,
b.wysylka_uid uid_wyslania, b.data_wysylki data_wyslania, 
o.ta_tag2 oznaczenie, e.ta_tag2 nrewid, m.ta_tag2 numer_dokumentu,
b.stan stan, b.hashtag
FROM bramka_br b
  INNER JOIN dokumenty_do d ON (b.guid = d.guid)
  LEFT JOIN uprawnienia u ON (b.guid = u.guid)
  LEFT JOIN tagi_ta o ON (b.guid = o.guid AND o.ta_tag = 'oznaczenie')
  LEFT JOIN tagi_ta m ON (b.guid = m.guid AND m.ta_tag = 'znak_kancelarii')
  LEFT JOIN tagi_ta e on (b.guid = e.guid AND e.ta_tag= 'nrewid')
WHERE  b.guid IN (SELECT unnest($1::text[]))
)
  `
  const uid = await get_uid()
  const ins = await query(sql, [guids, uid])
}

export async function zakoncz_wysylki(guids: any) {
  await do_przetworzonych(guids)
  const del = await query(`DELETE FROM bramka_br WHERE guid IN (SELECT unnest($1::text[]))`, [guids])
}

export async function usunZKolejki(guid: any) {
  const rs = await query("DELETE FROM kolejka_ko WHERE guid = $1", [guid])
}

export async function usunZKolejkiDoPrzetworzonych(guid: any) {
  const isnert = `
INSERT INTO public.przetworzone_pr(
  guid, pr_uid, pr_created, uid_wprowadzenia, data_wprowadzenia, oznaczenie, nrewid
)
SELECT  d.guid, $2::integer pr_uid,  now() pr_created, 
u.uid uid_wprowadzenia, d.do_created data_wprowadzenia,
o.ta_tag2 oznaczenie, e.ta_tag2 nrewid
FROM kolejka_ko b
  INNER JOIN dokumenty_do d ON (b.guid = d.guid)
  LEFT JOIN uprawnienia u ON (b.guid = u.guid)
  LEFT JOIN tagi_ta o ON (b.guid = o.guid AND o.ta_tag = 'oznaczenie')
  LEFT JOIN tagi_ta e on (b.guid = e.guid AND e.ta_tag= 'nrewid')
WHERE  b.guid = $1  
  `
  const uid = await get_uid()
  await query(isnert, [guid, uid])
  const rs = await query("DELETE FROM kolejka_ko WHERE guid = $1", [guid])
}

export async function wysylki4guids(guids: any): Promise<any> {
  const sql = `
SELECT
  b.guid, created, b.podpis, stan, b.uid, u.nazwa, wu.nazwa wyslal,
    json_object_agg(
  	 ta_tag, ta_tag2
    ) tagi
FROM bramka_br b
LEFT JOIN tagi_ta t ON (b.guid = t.guid AND ta_tag in ('nip', 'pesel', 'zwrotka', 'znak_kancelarii', 'nrewid', 'oznaczenie','strona','ade','adresowanie','ekstrakt'))
LEFT JOIN uzytkownicy u ON (b.uid = u.uid)
LEFT JOIN uzytkownicy wu ON (b.wysylka_uid = wu.uid)
WHERE  b.guid IN (SELECT unnest($1::text[]))
GROUP BY b.guid, created, b.podpis, stan, b.uid, u.nazwa, wu.nazwa
`
  const rs = await query(sql, [guids])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return dane
}


export async function wysylki(term: string = '', limit: number = 50, offset: number = 0, obsluzone: boolean = false, odlozone: boolean = false): Promise<any> {
  // const stany = `AND ( stan is null OR stan IN ( ${(obsluzone) ? ",'obsłużone'" : ""} ))`
  const stany = (obsluzone) ? " AND stan = 'obsłużone' " : " AND ( stan IS NULL OR stan = 'wysłane' ) "

  let sql = `
SELECT
  b.guid, b.hashtag, created, b.podpis, stan, b.uid, u.nazwa, wu.nazwa wyslal,
    json_object_agg(
  	 ta_tag, ta_tag2
    ) tagi
FROM bramka_br b
INNER JOIN uprawnienia up ON ( b.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
LEFT JOIN tagi_ta t ON (b.guid = t.guid AND coalesce(b.hashtag, '') = coalesce(t.ta_tag3,'') AND ta_tag in ('nip', 'pesel', 'zwrotka', 'znak_kancelarii', 'nrewid', 'oznaczenie','strona','ade','adresowanie','ekstrakt'))
LEFT JOIN uzytkownicy u ON (b.uid = u.uid)
LEFT JOIN uzytkownicy wu ON (b.wysylka_uid = wu.uid)
WHERE 1 = 1 
----$2-- AND ( b.guid LIKE $2::text
--$2-- AND (  b.guid IN (SELECT guid FROM tagi_ta t WHERE t.guid= b.guid AND ta_tag = 'oznaczenie' AND ta_tag2 LIKE $2::text ))
--$2-IS-NULL-- AND length($2::text) IS NULL  
` + stany + " GROUP BY b.guid, b.hashtag, created, b.podpis, stan, b.uid, u.nazwa, wu.nazwa "

  let sql_count = `
SELECT count(*) c FROM bramka_br b
INNER JOIN uprawnienia up ON ( b.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
WHERE 1=1
----$2-- AND ( b.guid LIKE $2::text
--$2-- AND (  b.guid IN (SELECT guid FROM tagi_ta t WHERE t.guid= b.guid AND ta_tag = 'oznaczenie' AND ta_tag2 LIKE $2::text ))
--$2-IS-NULL-- AND length($2::text) IS NULL   
`+ stany


  const uid = await get_uid()
  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)

  if (moje) {
    sql = sql.replace('(ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1)', 'up.uid = $1')
    sql_count = sql_count.replace('(ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1)', 'up.uid = $1')
  }
  const rs_count = await tested_query(sql_count, [uid, zawiera])
  const count = rs_count.rows[0].c;

  const rs = await tested_query(sql + `  ORDER BY 
 json_object_agg(
  	 ta_tag, ta_tag2
    ) ->>'oznaczenie'
    OFFSET $3 LIMIT $4`,
    [uid, zawiera, offset, limit])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }
}
export async function kolejka(term: string = '', limit: number = 50, offset: number = 0): Promise<any> {
  let sql = `
WITH 
oznaczenie as (
	select ta_id, guid, ta_tag2 as znak from tagi_ta where ta_tag = 'oznaczenie'
),
kolejka as (
SELECT k.guid guid, k.guid as pozycja, 
  o.znak as naglowek, 
  ko_created as istotna_data,
  '' as tresc,
  '' as stopka,
  '' as flagi,
  o.znak fulltext
 
FROM kolejka_ko k 
	left join oznaczenie o on (k.guid = o.guid ) 
)
SELECT * FROM kolejka k 
INNER JOIN uprawnienia up ON ( k.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
WHERE k.guid NOT IN (SELECT guid FROM tagi_ta WHERE ta_tag='aranzacja')
 AND ( $2::text IS NULL OR fulltext ILIKE  $2::text)
 AND ( $3::text IS NULL OR fulltext NOT ILIKE $3::text)
 AND ( $4::date IS NULL OR istotna_data >= $4::date)
 AND ( $5::date IS NULL OR istotna_data <= $5::date)
  `

  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)

  if (moje) {
    sql = sql.replace('(ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1)', 'up.uid = $1')
  }

  const sql_count = sql.replace('SELECT * FROM', 'SELECT count(*) c FROM')

  const uid = await get_uid()

  const rs_count = await query(sql_count, [uid, zawiera, nieZawiera, dataOd, dataDo])
  const count = rs_count.rows[0].c

  const rs = await query(sql + ' ORDER BY naglowek OFFSET $6 LIMIT $7 ', [uid, zawiera, nieZawiera, dataOd, dataDo, offset, limit])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }

}

export async function kolejka_aranzacje(term: string = '', limit: number = 50, offset: number = 0): Promise<any> {
  let sql = `
WITH 
oznaczenie as (
	select ta_id, guid, ta_tag2 as znak from tagi_ta where ta_tag = 'oznaczenie'
),
kolejka as (
SELECT k.guid guid, k.guid as pozycja, 
  o.znak as naglowek, 
  ko_created as istotna_data,
  '' as tresc,
  '' as stopka,
  '' as flagi,
  o.znak fulltext
 
FROM kolejka_ko k 
	left join oznaczenie o on (k.guid = o.guid ) 
)
SELECT * FROM kolejka k 
INNER JOIN uprawnienia up ON ( k.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
WHERE k.guid IN (SELECT guid FROM tagi_ta WHERE ta_tag='aranzacja')
 AND ( $2::text IS NULL OR fulltext ILIKE  $2::text)
 AND ( $3::text IS NULL OR fulltext NOT ILIKE $3::text)
 AND ( $4::date IS NULL OR istotna_data >= $4::date)
 AND ( $5::date IS NULL OR istotna_data <= $5::date)
  `

  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)

  if (moje) {
    sql = sql.replace('(ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1)', 'up.uid = $1')
  }

  const sql_count = sql.replace('SELECT * FROM', 'SELECT count(*) c FROM')

  const uid = await get_uid()

  const rs_count = await query(sql_count, [uid, zawiera, nieZawiera, dataOd, dataDo])
  const count = rs_count.rows[0].c

  const rs = await query(sql + ' ORDER BY naglowek OFFSET $6 LIMIT $7 ', [uid, zawiera, nieZawiera, dataOd, dataDo, offset, limit])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }

}

export async function zlecenie_bramka(id: any) {
  const uid = await get_uid()
  try {
      const response = await fetch(process.env.KANCELARIA_GW_URL + '/bramka/zlecenie/' + id + "?uid=" + uid)
      if (!response.ok){
        throw new Error(`Response status: ${response.status}`);
      }
      return response.text()
  } catch(error) {
    console.log(error)
  }
  return null
}

export async function bramka_stan(guids: any, stan: any) {
  const uid = await get_uid()
  const rs = await query(
    `UPDATE bramka_br SET stan = $1 
     WHERE guid IN (SELECT unnest($2::text[])) 
    --  AND (uid = $3 OR wysylka_uid = $3) `,
    [stan, guids])
}
export async function bramka(guid: any, podpis?: any) {
  const uid = await get_uid()
  const rs = await query("INSERT INTO bramka_br(guid,uid,podpis) VALUES ($1, $2, $3) ", [guid, uid, podpis])
  await ZATWIERDZENIE_BUS(guid, 'zatwierdzono', uid)
}


export async function dodaj_zalaczniki(formData: FormData) {
  const guid = formData.get("guid") as String
  const pliki: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === 'pliki' && value instanceof File) {
      pliki.push(value);
    }
  }
  const ATTACHMENT_STORE_URL = config.STORE_URL + "attachments/" + guid
  const uid = await get_uid()
  const  dostep  =  await sprwdz_dostep(guid, uid)
  if (!dostep) {
    console.log('Brak dostępu: ' + guid + " # " + uid)
    return "ko";
  }
  for (let i = 0; i < pliki.length; i++) {
    const plik = pliki[i];
    const nazwa = plik.name
    const response = await fetch(ATTACHMENT_STORE_URL + "?name=" + nazwa, {
      method: 'POST',
      body: plik
    })
  }
  return "ok";
}

export async function usun_zalacznik(guid:any, idx:number){
  const ATTACHMENT_STORE_URL = config.STORE_URL + "attachments/" + guid
  const uid = await get_uid()
  const  dostep  =  await sprwdz_dostep(guid, uid)
  if (!dostep) {
    console.log('Brak dostępu: ' + guid + " # " + uid)
    return "ko";
  }
  const response = await fetch(ATTACHMENT_STORE_URL + "?item="+idx, {
      method: 'DELETE'
    })
}
