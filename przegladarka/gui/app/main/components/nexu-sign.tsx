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

import React, { useState, useTransition } from 'react'

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { getDataToSign, mojeKonto, sign } from '../actions'
import { useCerts } from '@/lib/certs'
import Cookies from 'js-cookie'
import { usePodpis } from '@/lib/podpis'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { Settings } from 'lucide-react'

export async function podpisz(certs: any, guid: any, podpis: string = "Dokument wydany i podpisany w formie elektronicznej") {

  const moj_podpis: any = Cookies.get('moj_podpis')
  async function utworzSkrotInt(guid: string) {
    const dataPodpisu = (new Date()).getTime()
    // setSingingDate(dataPodpisu)
    const dane = {
      guid,
      "signingCertificate": certs?.certificate,
      "certificateChain": certs?.certificateChain,
      "encryptionAlgorithm": certs?.encryptionAlgorithm,
      "singingDate": dataPodpisu,
      "strona": 1,
      "pozycjaX": 50,
      "pozycjaY": 770,
      "wizualizacja": podpis
    }
    const json = await getDataToSign(dane)
    return json
  }

  async function podpiszSkrotInt(dataToSign: any) {
    const dane = {
      "tokenId": certs.tokenId,
      "keyId": certs.keyId,
      "toBeSigned": {
        "bytes": dataToSign
      },
      "digestAlgorithm": "SHA256"
    }
    const response = await fetch('http://localhost:9795/rest/sign', {
      method: 'POST',
      body: JSON.stringify(dane)
    })

    if (response.ok) {
      const json = await response.json()
      return json.response
    }
    return null
  }

  async function osadzPodpisInt(guid: string, signatureValue: any) {
    const dane = {
      guid,
      "signatureValue": signatureValue
    }
    const response = await sign(dane)
    return response
  }

  const dataToSign = await utworzSkrotInt(guid)
  const signed = await podpiszSkrotInt(dataToSign.dataToSign)
  const resp = await osadzPodpisInt(guid, signed.signatureValue)
}

export function Nexu({ guid, sidebar = false }: { guid: any, sidebar?: boolean }) {

  const [certs, setCerts] = useCerts()
  const [podpis, setPodpis] = usePodpis()
  const [pending, setTransition] = useTransition()
  const [title, setTitle] = useState('TesT')

  function wybierzCertyfikat() {
    setTransition(async () => {
      try {
        const me = await mojeKonto()
        setPodpis(me[0].podpis)
        const resp = await fetch('http://localhost:9795/rest/certificates')
        if (resp.ok) {
          const json = await resp.json()
          if (json.success)
            setCerts(json.response)
          else
            alert("Nie udalo sie wybrać certyfkatu")
        } else {
          alert("Nie udało się połączyć z NexU")
        }
      } catch (error) {
        alert("Nie udało się połączyć z NexU")
      }
    })
  }

  function pokazCertyfikaty() {
    alert(JSON.stringify(certs))
  }

  function pokazPodpis() {
    alert(podpis)
  }



  function ustawUzytkownika(ids: number[], nazwa: string = 'TesT'): void {
    setTitle(nazwa)
    document.cookie = `moje_id=${JSON.stringify(ids)}`
  }

  return (
    <>

      {sidebar && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton size="lg" asChild>
            <a href="#">
              <div className=" flex aspect-square size-8 items-center justify-center rounded-lg">
                <Settings className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Ustawienia podpisu</span>
              </div>
            </a>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={wybierzCertyfikat}>Wybierz certyfikat</DropdownMenuItem>
          <DropdownMenuItem onClick={pokazCertyfikaty} disabled={!certs}>Pokaz certyfikaty - json</DropdownMenuItem>
          <DropdownMenuItem onClick={pokazPodpis}>Pokaz podpis</DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>}

      {!sidebar && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span>{title}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={wybierzCertyfikat}>Wybierz certyfikat</DropdownMenuItem>
          <DropdownMenuItem onClick={pokazCertyfikaty} disabled={!certs}>Pokaz certyfikaty - json</DropdownMenuItem>
          <DropdownMenuItem onClick={pokazPodpis}>Pokaz podpis</DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>}
    </>
  )
}