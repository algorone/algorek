"use server"

import { parseQueryForSearch } from "@/lib/utils"
import { cookies } from "next/headers"
import { get_uid, mergeTagi } from "../main/actions"
import { query, sprwdz_dostep } from "@/lib/db"
import { AI_BUS, ZATWIERDZENIE_BUS } from "@/lib/bus"
import { reportWebVitals } from "next/dist/build/templates/pages"

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


export async function skany( limit: number = 50, offset: number = 0): Promise<any> {
  const sql = "SELECT guid, znak_kancelarii, TO_CHAR(data_przyjecia, 'YYYY-MM-DD') data_przyjecia FROM skany ORDER BY znak_kancelarii LIMIT $1 OFFSET $2"
  const sql_count = "SELECT count(*) c FROM skany"

    const uid = await get_uid()

  const rs_count = await query(sql_count)
  const count = rs_count.rows[0].c

  const rs = await query(sql , [ limit, offset ])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }
}


export async function zatwierdz_przypisanie( guid: string) {
  const sql = "DELETE FROM skany WHERE guid = $1 RETURNING znak_kancelarii"
// TODO wywolaj kolejke wsataw do dekretacji
  const uid = await get_uid()
  const rs = await query(sql , [ guid ])
  if ( rs.rows.length == 1){
    const znak_kancelarii = rs.rows[0].znak_kancelarii
    await mergeTagi(guid, 'znak_kancelarii', znak_kancelarii)
    await ZATWIERDZENIE_BUS(guid, 'do dekretacji', uid)
  }
  
}

export async function upate_skany( guid: string, znak_kancelarii: string) {
  const sql = "UPDATE skany SET znak_kancelarii = $2 WHERE guid = $1"
  const uid = await get_uid()
  const rs = await query(sql , [ guid, znak_kancelarii ])
}

export async function purde_in(term:string,  limit: number = 50, offset: number = 0): Promise<any> {
  const sql = `
SELECT purde.guid, purde.guid pozycja,
 znak_kancelarii stopka,
 data_przyjecia istotna_data,  
 '' as tresc,
  oznaczenie as naglowek,
  '' as flagi,
	na_wydzial, opis, zwrotka, purde.uid, typ 
FROM purde 
INNER JOIN uprawnienia up ON ( purde.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
WHERE typ='P'
--$2-IS-NULL-- AND  length($2::text) IS NULL
--$2-- AND (oznaczenie LIKE $2::text)
--$3-IS-NULL-- AND length($3::text) IS NULL
--$3-- AND purde.guid IN (SELECT guid FROM tagi_ta WHERE ta_tag IN (SELECT unnest($3::text[])) ) 
----$3-- AND array( SELECT t.ta_tag FROM tagi_ta t WHERE t.guid = purde.guid) @> array(SELECT unnest($3::text[]))
----$3-- AND array( SELECT t.ta_tag FROM tagi_ta t WHERE t.guid = purde.guid) @> $3::text[]
ORDER BY znak_kancelarii LIMIT $4 OFFSET $5
  `
  const sql_count = `
  SELECT count(*) c FROM purde 
  INNER JOIN uprawnienia up ON ( purde.guid = up.guid AND (ARRAY[up.uid,up.gid] || up.inne)::integer[] && ids($1) ) 
  WHERE typ='P'
--$2-IS-NULL-- AND  length($2::text) IS NULL
--$2-- AND (oznaczenie LIKE $2::text)
--$3-IS-NULL-- AND length($3::text) IS NULL
--$3-- AND purde.guid IN (SELECT guid FROM tagi_ta WHERE ta_tag IN (SELECT unnest($3::text[])) )
----$3-- AND array( SELECT t.ta_tag FROM tagi_ta t WHERE t.guid = purde.guid) @> array(SELECT unnest($3::text[]))
----$3-- AND array( SELECT t.ta_tag FROM tagi_ta t WHERE t.guid = purde.guid) @> $3::text[]
  `
  const [zawieraRaw, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)
  let tags = null
  let zawiera:String|null= (zawieraRaw)?""+zawieraRaw:null
  if(zawiera != null && zawiera.includes('#')){
    const tags_re=/#[a-zA-Z0-9]*/g
    const tagi = zawiera.match(tags_re)
    tags=tagi?.map((t: any) => t.replace('#',''))
    console.log("Tags:"+tags)
    const zawieraNew= tagi?.reduce((z, t)=>z.replaceAll(t,''), zawiera)
    if (zawieraNew==='%%')
      zawiera = null
    else
      zawiera= (zawieraNew)?zawieraNew:'%'
  }
  const uid = await get_uid()

  const rs_count = await  tested_query(sql_count,[uid,zawiera, tags])
  const count = rs_count.rows[0].c

  const rs = await tested_query(sql , [uid, zawiera,tags, limit, offset ])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }
}

export async function purde_out(term:string,  limit: number = 50, offset: number = 0): Promise<any> {
  const sql = `
SELECT guid, guid pozycja,
 znak_kancelarii stopka,
 data_przyjecia istotna_data,  
 '' as tresc,
  oznaczenie as nagowek,
  '' as flagi,
	na_wydzial, opis, zwrotka, uid, typ 
FROM purde 
WHERE typ='W'
ORDER BY znak_kancelarii LIMIT $1 OFFSET $2
  `
  const sql_count = "SELECT count(*) c FROM purde WHERE typ='W'"

    const uid = await get_uid()

  const rs_count = await query(sql_count)
  const count = rs_count.rows[0].c

  const rs = await query(sql , [ limit, offset ])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }
}

export async function zmien_dokument(guid:any, idx:number){
  const ATTACHMENT_STORE_URL = config.STORE_URL + "attachments/" + guid
  const uid = await get_uid()
  const  dostep  =  await sprwdz_dostep(guid, uid)
  if (!dostep) {
    console.log('Brak dostępu: ' + guid + " # " + uid)
    return "ko";
  }
  const response = await fetch(ATTACHMENT_STORE_URL + "?item="+idx)
  const dane = await response.blob()
  const zamien = await fetch(config.STORE_URL+ guid, {
    //  response = requests.patch(url= OBJECT_STORE_URL+guid, headers=headers, data=pdf_wejsciowy)
    method: 'PATCH',
    body: dane
  })
}

export async function purde_do_przetworzone(guid:any){
  const sql =`INSERT INTO przetworzone_pr(guid, zrodlo,znak_pisma, data_pisma,pr_uid)
  SELECT guid, 'purde' ,znak_kancelarii, data_przyjecia, uid FROM purde
  WHERE guid =$1  AND dostep(guid, ids($2))
  `
  const deleteSql = "DELETE FROM purde WHERE guid = $1 AND dostep(guid, ids($2))"
  const uid = await get_uid()
  const ins = await query(sql, [guid,  uid])
  const deleted = await query(deleteSql, [guid,  uid])
}

export async function purde_do_dekretacje(guid:any){
  const sql = `INSERT INTO dekretacje(guid, znak_pisma, data_pisma, na_wydzial,  na_wydzial_opis, uid_na_wydzial)
  SELECT guid, znak_kancelarii, data_przyjecia, na_wydzial, opis, $2 FROM purde
  WHERE guid =$1  AND dostep(guid, ids($2))
  `
  console.log("Do dekretacji idzie: " + guid)
  const deleteSql = "DELETE FROM purde WHERE guid = $1 AND dostep(guid, ids($2))"
  const uid = await get_uid()
  const ins = await query(sql, [guid,  uid])
  const deleted = await query(deleteSql, [guid,  uid])

}

export async function przetworzone_rej(term: string = '', limit: number = 50, offset: number = 0, order: string = 'pr_created') {
  let sql = `
SELECT p.guid, uu.nazwa pr_uid, TO_CHAR(p.pr_created,'DD.MM.YYYY HH12:MM') pr_created, 
  uc.nazwa uid_wprowadzenia, 
  uw.nazwa uid_na_wydzial,TO_CHAR(p.na_wydzial_data,'DD.MM.YYYY HH12:MM') na_wydzial_data, na_wydzial_opis, na_wydzial,
  up.nazwa uid_na_pracownika, TO_CHAR(p.na_pracownika_data,'DD.MM.YYYY HH12:MM') na_pracownika_data, na_pracownika_opis, na_pracownika,
  uw.nazwa uid_wyslania, TO_CHAR(p.data_wyslania,'DD.MM.YYYY HH12:MM') data_wyslania,
  p.oznaczenie, p.znak_pisma, p.stan
FROM przetworzone_pr p
 LEFT JOIN uzytkownicy uc ON (p.uid_oznaczenie = uc.uid )
 LEFT JOIN uzytkownicy uw ON (p.uid_na_wydzial = uw.uid )
 LEFT JOIN uzytkownicy up ON (p.uid_na_pracownika = up.uid )
 LEFT JOIN uzytkownicy uu ON (p.pr_uid = uu.uid )
WHERE dostep(p.guid, ids($1)) AND zrodlo = 'purde'
--$2-IS-NULL-- AND  length($2::text) IS NULL
--$2-- AND (oznaczenie LIKE $2::text)
  `
  let sql_count = `
SELECT count(*) c FROM przetworzone_pr p 
WHERE dostep(guid, ids($1)) AND zrodlo = 'in'
--$2-IS-NULL-- AND length($2::text) IS NULL
--$2-- AND ( oznaczenie LIKE $2::text )
`
  const uid = await get_uid()
  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)
    if(moje){
    sql = sql.replace('dostep(b.guid, ids($1)) ', 'tylko_moje(b.guid, $1)')
    sql_count = sql_count.replace('dostep(guid, ids($1))', 'tylko_moje(guid, $1)')
    console.log(sql)
  }

  const rs_count = await tested_query(sql_count, [uid, zawiera])

  const count = rs_count.rows[0].c;
  const rs = await tested_query(sql + ' ORDER BY ' + order + ' OFFSET $3 LIMIT $4 ', [uid, zawiera, offset, limit])
  const dane = rs.rows.map(rec => {
    return { ...rec }
  })

  return { count, limit, offset, dane }
}
