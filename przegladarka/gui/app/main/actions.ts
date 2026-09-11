"use server"

import { query } from "@/lib/db"
import { parseQueryForSearch } from "@/lib/utils"
import { cookies } from 'next/headers'

import { getuid } from "process"

export async function testDB() {

  const rs = await query("SELECT 'Hi there! '||now() as msg")
  return rs.rows[0].msg
}






export async function obsluzone(): Promise<any[]> {
  const rs = await query("SELECT * FROM dokumenty_do ORDER BY do_created DESC limit 300")
  return rs.rows.map(rec => {
    return { id: rec.guid, guid: rec.guid, istotna_data: rec.do_created, oznaczenie: '', opis: ''}
  })
}

export async function tagi(guid: string): Promise<any[]> {
  const rs = await query("SELECT * FROM tagi_ta WHERE guid = $1", [guid])
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function historia(guid: string): Promise<any[]> {
  const rs = await query("SELECT * FROM historia_hi WHERE guid = $1", [guid])
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function pozycjaPodpisu(guid: any){
  const rs = await query("SELECT pozycja_podpisu($1) pozycja", [guid])
  return rs.rows[0].pozycja
}

export async function getDataToSign(dane: any) {
  const pozycja = await pozycjaPodpisu(dane.guid)
  const dane2 = { ... dane, 
      "strona": pozycja.strona,
      "pozycjaX": pozycja.pozycjaX,
      "pozycjaY": pozycja.pozycjaY,
      "fontSize": pozycja.fontSize
  }
  const response = await fetch(process.env.PKI_URL + 'get-data-to-sign', {
    method: 'POST',
    body: JSON.stringify(dane2)
  })
  if (response.ok)
    return await response.json()
  return null
}

export async function sign(dane: any) {
  const response = await fetch(process.env.PKI_URL + 'sign', {
    method: 'POST',
    body: JSON.stringify(dane)
  })
  if (response.ok)
    return await response.text()
  return null
}

// TODO owinac w try pobrac z ENV - powinno wskzywac na proxowana Sigme
export async function getWToku(guid: any) {
  // const response = await fetch('http://127.0.0.1:8025/w_toku/' + guid)
  // if (response.ok) {
  //   const lines = (await response.text()).trim().split('\n')
  //   return lines
  // }
  return null
}
// TODO owinac w try pobrac z ENV - musi wskzywac na proxowana Sigme
export async function setWToku(guid: any, akcje: any) {
  // const response = await fetch('/w_toku/' + guid, 
  // { method: 'PATCH',
  //   body: akcje
  // })
  // if (response.ok)
  //   return "await response.text()"
  return null
}

export async function mergeTagi(guid: string, ta_tag: any, ta_tag2: any) {
  const merge = `
MERGE INTO tagi_ta t
USING (SELECT $1 as guid, $2 aS ta_tag, $3 as ta_tag2) as s
ON (t.guid = s.guid and t.ta_tag = s.ta_tag)
WHEN MATCHED THEN
	UPDATE SET ta_tag2 = s.ta_tag2
WHEN NOT MATCHED THEN
	INSERT (guid, ta_tag, ta_tag2) VALUES (s.guid, s.ta_tag, s.ta_tag2)
  `
  const rs = await query(merge, [guid, ta_tag, ta_tag2])
  return "OK"
}

export async function deleteTag(guid: string, ta_tag: any){
  const rs = await query("DELETE FROM tagi_ta WHERE guid = $1 AND ta_tag = $2 ", [guid, ta_tag])
  return "ok"
}

export async function zapiszTagi(guid: any, tagi: any){
  for ( var i = 0 ; i < tagi.length; i++){
    const ta_tag = tagi[i].tag
    const ta_tag2 = tagi[i].value
    const action = tagi[i]?.action
    if(action==='delete')
      await deleteTag(guid, ta_tag)
    else
      await mergeTagi(guid, ta_tag, ta_tag2) 
  }
}


export async function szukajKorespondent(term:string){
  const sql=`
WITH dane as (
SELECT kr_id, 
	 trim(concat(kr_nazwa, ' ', kr_nazwisko, ' ', kr_imie, ' ',kr_ulica, ' ', kr_adres_nr, ' ', kr_kodpocztowy, ' ', kr_miejscowosc)) kr_dane,
	 lower(trim(concat(kr_nazwa, kr_nazwisko, kr_imie,kr_miejscowosc, kr_ulica, kr_adres_nr))) nazwaidx, 
	 k.*
FROM korespondent_kr k ) 
SELECT * FROM dane
	WHERE nazwaidx LIKE $1
LIMIT 10  
  `
  if (term.length < 3)
    return []
  const terms = (term.replaceAll(' ','%') + '%').toLowerCase()
  const rs = await query(sql, [terms])
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function dodajZipEdoreczenie(formData: FormData) {
  const zip = formData.get("zip") as File;
  const rodzaj = formData.get('rodzaj') as string
  const response = await fetch('http://localhost:8022', {
    method: 'PUT',
    body: zip
  })
  if (response.ok) {
    const guid = await response.text()
    //EDORECZENIE_BUS_URL = EVENT_BUS_URL + '13'
    const resp = await fetch('http://localhost:8023/13', {
      method: 'PUT',
      body: guid + ',rejestruj edoreczenie,'+rodzaj
    })

  }
  return null
}

export async function dodajEml(formData: FormData) {
  const eml = formData.get("eml") as File;
  const rodzaj = formData.get('rodzaj') as string
  const response = await fetch('http://localhost:8022', {
    method: 'PUT',
    body: eml
  })
  if (response.ok) {
    const guid = await response.text()
    //EMAIL_BUS_URL = EVENT_BUS_URL + '7'
    const resp = await fetch('http://localhost:8023/7', {
      method: 'PUT',
      body: guid + ',rejestruj email,'+rodzaj
    })

  }
  return null
}

export async function utworzSprawe(formData: FormData){
  const guid = formData.get('guid') as string
  const klasyfikacja = formData.get('klasyfikacja') as string
  const klasyfikacja_rok = formData.get('klasyfikacja_rok') as string 
  const tytul = formData.get('tytul') as string
  await mergeTagi(guid, 'klasyfikacja', klasyfikacja)
  await mergeTagi(guid, 'klasyfikacja_rok', klasyfikacja_rok)
  await mergeTagi(guid, 'tytul', tytul)

  const uid = await get_uid()

      //EZD_BUS_URL = EVENT_BUS_URL + '9'
      const resp = await fetch('http://localhost:8023/9', {
        method: 'PUT',
        body: guid + ',utworz,'+uid
      })

}

export async function przypiszDoSprawy(formData: FormData){
  const guid = formData.get('guid') as string
  const sprawa = formData.get('sprawa') as string
  const opisDoSprawy = formData.get('opis') as string

  await mergeTagi(guid, 'sprawa', sprawa)
  await mergeTagi(guid, 'opisDoSprawy', opisDoSprawy)

  const uid = await get_uid()

  //EZD_BUS_URL = EVENT_BUS_URL + '9'
  const resp = await fetch('http://localhost:8023/9', {
    method: 'PUT',
    body: guid + ',przypisz,'+uid
  })

}

export async function rejestrujWychodzaca(formData: FormData){
  const guid = formData.get('guid') as string
  const nazwa = formData.get('nazwa') as string
  const imie = formData.get('imie') as string
  const nazwisko = formData.get('nazwisko') as string
  const ade = formData.get('ade') as string
  const ulica = formData.get('ulica') as string
  const adresNr = formData.get('nr') as string
  const kod = formData.get('kod') as string
  const miasto = formData.get('miejscowosc') as string
  const tytul = formData.get('tytul') as string
  const adresat = { nazwa, nazwisko, imie, ade, ulica, adresNr, kod, miasto }
  const pelnaNazwa = `${nazwa} ${nazwisko} ${imie}`.trim()
  const adres = `${ulica} ${adresNr} , ${kod} ${miasto} ${(ade !='')?ade:''}`.trim()
  await mergeTagi(guid, 'adresat', JSON.stringify(adresat))
  await mergeTagi(guid, 'nazwa', pelnaNazwa)
  await mergeTagi(guid, 'adres', adres)
  await mergeTagi(guid, 'tytuł', tytul)

  await setWToku(guid, 
    [
    "kancelaria: rejestruj wychodzaca",
    "ezd: rejestruj wychodzaca"
    ].join('\n'))

    const uid = await get_uid()
  
    //KANCELARIA_BUS_URL = EVENT_BUS_URL + '10'
  const resp = await fetch('http://localhost:8023/10', {
      method: 'PUT',
      body: guid + ',rejestruj wychodzaca kancelaria,' + uid
    })

}

export async function rejestrujPozostala(formData: FormData){
  const guid = formData.get('guid') as string
  const nazwa = formData.get('nazwa') as string
  const tytul = formData.get('tytul') as string
  await mergeTagi(guid, 'nazwa', nazwa)
  await mergeTagi(guid, 'tytuł', tytul)

  const uid = await get_uid()

  await setWToku(guid, 
    [
    "rejestruj pozostala"
    ].join('\n'))

  //EZD_BUS_URL = EVENT_BUS_URL + '9'
  const resp = await fetch('http://localhost:8023/9', {
    method: 'PUT',
    body: guid + ',rejestruj pozostala,'+uid
  })
}

export async function zamknijSprawe(formData: FormData){
  const guid = formData.get('guid') as string

  await setWToku(guid, 
    [
    "ezd: zamknij sprawe"
    ].join('\n'))

    const uid = await get_uid()

  //EZD_BUS_URL = EVENT_BUS_URL + '9'
  const resp = await fetch('http://localhost:8023/9', {
    method: 'PUT',
    body: guid + ',zamknij sprawe,'+uid
  })
}

export async function dekretujNaWydzial(formData: FormData){
  const wydzial = formData.get('wydzial') as string
  const pisma = formData.get('pisma') as string
  const uid = await get_uid()

      //KANCELARIA_BUS_URL = EVENT_BUS_URL + '10'
  const resp = await fetch('http://localhost:8023/10', {
        method: 'PUT',
        body: wydzial + ',przygotuj dekretacje,'+uid+','+pisma
      })
}

export async function dekretujNaPracownika(formData: FormData){
  const pracownik = formData.get('pracownik') as string
  const guid = formData.get('guid') as string
  const uid = await get_uid()

  //EZD_BUS_URL = EVENT_BUS_URL + '9'
  const resp = await fetch('http://localhost:8023/9', {
    method: 'PUT',
    body: guid + ',dekretuj pracownik,'+pracownik+','+uid
  })
}

export async function grupy(){
  const sql ='SELECT * FROM grupy ORDER BY kod'
  const rs = await query(sql)
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function uzytkownicy(){
  const sql ='SELECT * FROM uzytkownicy ORDER BY nazwa'
  const rs = await query(sql)
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function mojeKonto(){
  const uid = await get_uid()
  const sql ='SELECT * FROM uzytkownicy WHERE uid = $1 '
  const rs = await query(sql,[uid])
  return rs.rows.map(rec => {
    return { ...rec }
  })
}

export async function zlecenie(nazwa: any ,guids:any):Promise<any>{
  const uid = await get_uid()
  const rs = await query("INSERT INTO zlecenia(uid,nazwa,guids) VALUES ($1, $2, $3) RETURNING id", [uid,nazwa, guids])
  return rs.rows[0].id
}

export async function get_uid() {
  const cookieStore = await cookies()
  if (cookieStore.has('IdToken')) {
    const idToken: any = cookieStore.get('IdToken')
    return parseInt(JSON.parse(atob(idToken['value'].split('.')[1])).uid)
  }
  if (cookieStore.has('moje_id')) {
    const moje_id: any = cookieStore.get('moje_id')
    const uid = JSON.parse(moje_id['value'])[0]
    return uid
  }
  return -1

}


export async function dokumentInfo(guid:any){
  const SQL= `
WITH 
dostepy AS (
	SELECT u.guid, u.uid, u.gid, u.inne, g.zarzadcy FROM uprawnienia u
		LEFT JOIN grupy g ON u.gid = g.gid
), zalaczniki AS (
    SELECT z.guid, z.ta_tag2 zalaczniki FROM tagi_ta z WHERE z.ta_tag='zalaczniki'
), dekretacja_info AS (
  SELECT guid, json_agg(row_to_json(d.*)) dekretacja FROM dekretacje d GROUP BY d.guid 
)
SELECT d.guid, 
	   u.uid, u.gid, u.inne, u.zarzadcy,
	   z.zalaczniki,
     dk.dekretacja
  FROM dokumenty_do d 
  LEFT JOIN dostepy u ON (d.guid= u.guid)
  LEFT JOIN zalaczniki z ON (d.guid = z.guid)
  LEFT JOIN dekretacja_info dk ON (d.guid = dk.guid)
WHERE d.guid = $1  
  `
  const rs = await query(SQL,[guid])
  if(rs.rows.length >0 ){
    return { ... rs.rows[0] }
  }

  return null
  // return rs.rows.map(rec => {
  //   return { ...rec }
  // })
}


