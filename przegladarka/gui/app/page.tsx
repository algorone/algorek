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

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay"
import React from "react";
import { Button } from "@/components/ui/button";
import { Files, Folders, ListEnd, ListStart, ScaleIcon, Underline } from "lucide-react";
import Link from "next/link";

// TODO przywrocic Sigme
// import { SigmaStreamProvider } from "@/lib/use-sigma-stream"



export default async function AppPage() {
  // TODO przyworocić konfiguracje layaoyt z preferencji
  // const layout = cookies().get("react-resizable-panels:layout")
  // const collapsed = cookies().get("react-resizable-panels:collapsed")

  // const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  // const defaultCollapsed = (collapsed && collapsed?.value !== 'undefined') ? JSON.parse(collapsed.value) : undefined

  const defaultCollapsed = undefined
  const defaultLayout = undefined

  return (
    <>
      <div className="mx-auto max-w-4xl pt-10">
        <MainInfo />
        <div className="grid grid-cols-2 pt-10 gap-5">
          <Card><CardHeader><Button variant="ghost" asChild><Link href="/out"> Obsługa wychodzących <ListEnd className="" /> </Link></Button> </CardHeader></Card>

          <Card><CardHeader><Button variant="ghost" asChild><Link href="/in"> Obsługa wpływających <ListStart /></Link></Button></CardHeader></Card>
          <Card><CardHeader><Button variant="ghost" asChild><Link href="/rejestracja">Rejestrtacja pism<Files /></Link></Button></CardHeader></Card>
          <Card><CardHeader><Button variant="ghost" asChild><Link href="/ezd">Szafa EZD <Folders className=""/></Link></Button></CardHeader></Card>
        </div>
        <PartnerInfo/>
        
      </div>
    </>
  )
}

async function MainInfo() {
  return (
    <table width="100%"  cellPadding="0" border={0} summary="" className="t3ReportsRegion" id="R40652416735152382">
      <tbody><tr>
        <td valign="bottom" className=""
          style={{ "borderBottom": "1px solid #A4A471", "fontWeight": "bold", "fontSize": "large", "color": "#336699" }} >
          Algorek - robot kancelaryjny
        </td>
        <td align="right" className="t3ButtonHolder" style={{ "borderBottom": "1px solid #A4A471" }} >
          <table align="right" summary=""><tbody><tr><td>&nbsp;</td></tr></tbody></table>
        </td>
      </tr>
        <tr className="t3instructiontext">
          <td valign="top" className="t3Body" colSpan={2} >
            <ul>
              <li> Platforma <a style={{"textDecoration": "Underline"}} href="https://github.com/algorone" target="_blank">AlgorOne</a>, wersja 2.0  </li>
            </ul>

          
            <br />Instancja: {process.env.WLASCICIEL}
            <br />Opiekun robota: {process.env.OPIEKUN}
            <br />Licencja: {process.env.LICENCJA} <a style={{"textDecoration": "Underline"}} href={process.env.LICENCJA_LINK} target="licencja"> link </a>

          </td>
        </tr>
       
      </tbody></table>
  )
}

function PartnerInfo() {
  return (
<>
<br />2026 © {process.env.PARTNER}
<ul>
 {process.env.L0!=null &&<>
<li className="SUPPORT-L0">
 {process.env.L0} <a style={{"textDecoration": "Underline"}} href={process.env.L0_LINK} target="support">link</a></li>
</>} 
{process.env.L1!=null &&<>
<li className="SUPPORT-L1">
 {process.env.L1} <a style={{"textDecoration": "Underline"}} href={process.env.L1_LINK} target="support">link</a></li>
</>}
{process.env.L2!=null &&<>
<li className="SUPPORT-L2">
 {process.env.L2} <a style={{"textDecoration": "Underline"}} href={process.env.L2_LINK} target="support">link</a></li>
</>}
{process.env.L3!=null &&<>
<li className="SUPPORT-L3">
 {process.env.L3} <a style={{"textDecoration": "Underline"}} href={process.env.L3_LINK} target="support">link</a></li>
</>}
{process.env.L4!=null &&<>
<li className="SUPPORT-L4" >
 {process.env.L4} <a style={{"textDecoration": "Underline"}} href={process.env.L4_LINK} target="support">link</a></li>
</>}
</ul>
</>
  )
}


