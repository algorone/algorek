"use server"

import { parseQueryForSearch } from "@/lib/utils"
import { cookies } from "next/headers"
import { get_uid } from "../main/actions"
import { query } from "@/lib/db"
import { AI_BUS, ZATWIERDZENIE_BUS } from "@/lib/bus"

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

export async function dekretacje(guid: any){
  const sql =`SELECT * FROM dekretacje WHERE guid = $1`
  const uid = await get_uid()
  const rs =await query(sql,[guid])
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function dekretacja_id(id: any){
  const sql =`SELECT * FROM dekretacje WHERE dk_id = $1`
  const uid = await get_uid()
  const rs =await query(sql,[id])
  if(rs.rows.length == 1)
    return { ...rs.rows[0] }
  return null
}

export async function dekretacja_set_na_wydzial(id:string, kod: string ){
  const sql = "UPDATE dekretacje SET na_wydzial = $2 WHERE dk_id = $1"
  await query(sql,[id,  kod])
}

export async function dekretacja_set_na_wydzial_opis(id:string, opis: string ){
  const sql = "UPDATE dekretacje SET na_wydzial_opis = $2 WHERE dk_id = $1"
  await query(sql,[id,  opis])
}

export async function dekretacja_set_na_pracownika(id:string, pracownik: any ){
  const sql = "UPDATE dekretacje SET na_pracownika = $2 WHERE dk_id = $1"
  await query(sql,[id, pracownik])
}

export async function dekretacja_set_na_pracownika_opis(id:string, opis: string ){
  const sql = "UPDATE dekretacje SET na_pracownika_opis = $2 WHERE dk_id = $1"
  await query(sql,[id, opis])
}

export async function dekretacja_set_oznaczenie(id:string, oznaczenie: string ){
  const sql = "UPDATE dekretacje SET oznaczenie = $2 WHERE dk_id = $1"
  await query(sql,[id,  oznaczenie])
}

export async function zatwierdz_dekretacje_na_wydzial(id:string){
  const sql = `
WITH dane AS(
SELECT unnest(string_to_array(na_wydzial,',')) nowy_na_wydzial, $2::integer nowy_uid, now() nowa_data, * FROM dekretacje 
	WHERE dk_id = $1
)
MERGE INTO dekretacje d
USING dane n
ON d.guid = n.guid AND starts_with(d.na_wydzial,n.nowy_na_wydzial)
WHEN MATCHED THEN
  UPDATE SET na_wydzial= n.nowy_na_wydzial, uid_na_wydzial = n.nowy_uid, na_wydzial_data = n.nowa_data
WHEN NOT MATCHED THEN
  INSERT (guid, znak_pisma, data_pisma, na_wydzial, uid_na_wydzial, na_wydzial_data, na_wydzial_opis)
  VALUES (n.guid, n.znak_pisma, n.data_pisma, n.nowy_na_wydzial, n.nowy_uid, n.nowa_data, n.na_wydzial_opis)
`
  const uid = await get_uid()
  await query(sql,[id,  uid])
}

export async function zatwierdz_dekretacje_na_pracownika_lub_zwrot(id:string){
  const sql = `
WITH na_pracownika AS (
	UPDATE dekretacje SET na_pracownika_data = now(), uid_na_pracownika = $2 
	WHERE dk_id = $1 AND dostep(guid, ids($2)) AND na_pracownika IS NOT NULL AND na_wydzial NOT LIKE '<=%' 
	RETURNING dk_id
), zwrotna AS (
	UPDATE dekretacje SET na_wydzial_data = null, na_wydzial_opis = na_pracownika_opis, na_pracownika_opis = null
	WHERE dk_id = $1 AND dostep(guid, ids($2)) AND na_wydzial LIKE '<-%' 
	RETURNING dk_id
)
SELECT dk_id FROM na_pracownika
UNION
SELECT dk_id FROM zwrotna  
  `
  const uid = await get_uid()
  await query(sql,[id,  uid])
}


export async function zatwierdz_oznaczenie(id:string){
  
  const uid = await get_uid()
  const response = await fetch(process.env.EZD_GW_URL+ '/dekretacje/oznaczenie/' + id + "?uid=" + uid)
  return response.text()
  // const sql = "UPDATE dekretacje SET oznaczenie_data = now(), uid_oznaczenie = $2 WHERE dk_id = $1 AND dostep(guid, ids($2)) "
  // const uid = await get_uid()
  // await query(sql,[id,  uid])
}

export async function dekretacje_na_wydzial(term: string = '', limit: number = 50, offset: number = 0): Promise<any> {
 let sql = `
SELECT guid, dk_id as pozycja, 
  '-> '||na_wydzial as naglowek, 
  data_pisma as istotna_data,
  '' as tresc,
  znak_pisma as stopka,
  '' as flagi,
  znak_pisma fulltext
FROM dekretacje
WHERE dostep(guid, ids($1)) AND na_wydzial_data IS NULL
  `
  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)
  if(moje){
    sql = sql.replace('dostep(guid, ids($1))', 'tylko_moje(guid, $1)')
  }

  const sql_count = `
SELECT count(*) c FROM dekretacje 
WHERE dostep(guid, ids($1)) AND na_wydzial_data IS NULL
  `

  const uid = await get_uid()

  const rs_count = await query(sql_count, [uid])
  const count = rs_count.rows[0].c

  const rs = await query(sql + ' ORDER BY stopka OFFSET $2 LIMIT $3 ', [uid, offset, limit])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }

}

export async function dekretacje_na_pracownika(term: string = '', limit: number = 50, offset: number = 0): Promise<any> {
 let sql = `
SELECT guid, dk_id as pozycja,
  CASE WHEN na_wydzial LIKE '<-%' THEN
    na_wydzial
  ELSE
    na_wydzial|| ' -> ' || COALESCE(na_pracownika,'')
  END as naglowek, 
  data_pisma as istotna_data,
  '' as tresc,
  znak_pisma as stopka,
  '' as flagi,
  znak_pisma fulltext
FROM dekretacje
WHERE dostep(guid, ids($1)) AND na_wydzial_data IS NOT NULL AND na_pracownika_data IS NULL
  `
  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)
  if(moje){
    sql = sql.replace('dostep(guid, ids($1))', 'tylko_moje(guid, $1)')
  }

  const sql_count = `
SELECT count(*) c FROM dekretacje 
WHERE dostep(guid, ids($1)) AND na_wydzial_data IS NOT NULL AND na_pracownika_data IS NULL
  `

  const uid = await get_uid()

  const rs_count = await query(sql_count, [uid])
  const count = rs_count.rows[0].c

  const rs = await query(sql + ' ORDER BY stopka OFFSET $2 LIMIT $3 ', [uid, offset, limit])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }

}

export async function dekretacje_do_oznaczenia(term: string = '', limit: number = 50, offset: number = 0): Promise<any> {
 let sql = `
SELECT guid, dk_id as pozycja, 
  COALESCE(oznaczenie, na_wydzial|| ' -> ' || na_pracownika) as naglowek, 
  data_pisma as istotna_data,
  '' as tresc,
  znak_pisma as stopka,
  '' as flagi,
  znak_pisma fulltext
FROM dekretacje
WHERE dostep(guid, ids($1)) AND na_wydzial_data IS NOT NULL AND na_pracownika_data IS NOT NULL
  `
  const [zawiera, nieZawiera, dataOd, dataDo, moje] = parseQueryForSearch(term)
  if(moje){
    sql = sql.replace('dostep(guid, ids($1))', 'tylko_moje(guid, $1)')
  }

  const sql_count = `
SELECT count(*) c FROM dekretacje 
WHERE dostep(guid, ids($1)) AND na_wydzial_data IS NOT NULL AND na_pracownika_data IS NOT NULL
  `

  const uid = await get_uid()

  const rs_count = await query(sql_count, [uid])
  const count = rs_count.rows[0].c

  const rs = await query(sql + ' ORDER BY stopka OFFSET $2 LIMIT $3 ', [uid, offset, limit])

  const dane = rs.rows.map(rec => {
    return { ...rec }
  })
  return { count, limit, offset, dane }
}

export async function przetworzone_in(term: string = '', limit: number = 50, offset: number = 0, order: string = 'pr_created') {
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
WHERE dostep(p.guid, ids($1)) AND zrodlo = 'in'
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

export async function do_przetworzonych_in(id: any) {
  const sql = `
INSERT INTO przetworzone_pr(guid, zrodlo, pr_uid, pr_created, znak_pisma, data_pisma, 
  na_wydzial, uid_na_wydzial, na_wydzial_opis, na_wydzial_data, 
  na_pracownika, uid_na_pracownika, na_pracownika_opis, na_pracownika_data, 
  oznaczenie, uid_oznaczenie, oznaczenie_data, stan)
SELECT  guid, 'in' zrodlo, $2 uid, now(), znak_pisma, data_pisma, 
  na_wydzial, uid_na_wydzial, na_wydzial_opis, na_wydzial_data, 
  na_pracownika, uid_na_pracownika, na_pracownika_opis, na_pracownika_data, 
  oznaczenie, uid_oznaczenie, oznaczenie_data, status stan
FROM dekretacje
WHERE dk_id = $1 AND dostep(guid, ids($2))
  `
  const deleteSql = "DELETE FROM dekretacje WHERE dk_id = $1 AND dostep(guid, ids($2))"
  const uid = await get_uid()
  const ins = await query(sql, [id,  uid])
  const deleted = await query(deleteSql, [id,  uid])
}





