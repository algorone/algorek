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
export const dynamic = "force-dynamic";


import { Main } from "./components/main"
import { cn } from "@/lib/utils"

import { TasksProvider, useTaskDispatch } from "@/lib/tasks"

import { useState } from "react"
import { ListProvider, useList } from "@/lib/list"
import { CertProvider } from "@/lib/certs"
import { useView, ViewProvider } from "@/lib/view"
import { RefreshProvider, useRefresh } from "@/lib/refresher"
import { PodpisProvider } from "@/lib/podpis";
import { PaginaProvider, usePagina } from "@/lib/pagina";
import { useZnakRwa, ZnakRwaProvider } from "@/lib/znakRwa";
// import { SigmaStreamProvider } from "@/lib/use-sigma-stream"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ListEnd, SendHorizonal, GalleryVerticalEnd, Home, Combine } from "lucide-react";
import { Wysylka } from "./components/wysylka";
import { Nexu } from "../main/components/nexu-sign";
import { Przetworzone } from "./components/przetworzone";
import { Aranzacje } from "./components/aranzacje";
import { mergeTagi } from "../main/actions";
import { MainLinks } from "../main/components/main-links";



export default function AppPage() {

  const defaultCollapsed = undefined
  const defaultLayout = undefined

  return (
    <>
      <div className="hidden flex-col md:flex">
        {/* <SigmaStreamProvider> */}
        <TasksProvider>
          <ListProvider>
            <PaginaProvider>
              <CertProvider>
                <ViewProvider>
                  <RefreshProvider>
                    <PodpisProvider>
                      <ZnakRwaProvider>

                        <InnerPage />
                      </ZnakRwaProvider>
                    </PodpisProvider>
                  </RefreshProvider>
                </ViewProvider>
              </CertProvider>
            </PaginaProvider>
          </ListProvider>
        </TasksProvider>
        {/* </SigmaStreamProvider> */}
      </div>
    </>
  )
}

function InnerPage() {

  const defaultCollapsed = undefined
  const defaultLayout = undefined
  const [page, setPage] = useState('main')
  const [refresh, setRefresh] = useRefresh()
  const [lista, setLista] = useList()
  const dispatch = useTaskDispatch()
  const [pagina, setPagina] = usePagina()
  const [display, setDisplay] = useView()
  const [guid, setGuid] = useZnakRwa()

  async function do_aranzacji(event: any) {
    const guid = event.guid
    await mergeTagi(guid, 'aranzacja', '')
    setPage('aranzacje')
    setDisplay('dokumenty')
    setGuid(event)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "250px",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        {/* <SidebarHeader>
                              <SidebarMenu>
                                <SidebarMenuItem>
                                  <SidebarMenuButton size="lg" asChild>
                                  <Link href="/">
                                  <Home className="size-4"/></Link>
                                  </SidebarMenuButton>

                                </SidebarMenuItem>

                              </SidebarMenu>

                            </SidebarHeader> */}
        <SidebarContent className="flex flex-col gap-2 p-2">
          <SidebarMenu>

            <SidebarMenuItem>
              <MainLinks sidebar={true} />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild onClick={() => {
                setLista([])
                setPagina({ ...pagina, offset: 0 })
                setRefresh(Math.random())
                dispatch({ action: 'clear' })
                setPage('main')
              }}>
                <a href="#kolejka">
                  <div className=
                    {cn((page === 'main') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                    <ListEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Kolejka</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild onClick={() => {
                setLista([])
                setPagina({ ...pagina, offset: 0 })
                setRefresh(Math.random())
                dispatch({ action: 'clear' })
                setPage('wysylka')
              }}>
                <a href="#wysylka">
                  <div className={cn((page === 'wysylka') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                    <SendHorizonal className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Do wysyłki</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild onClick={() => {
                setLista([])
                setPagina({ ...pagina, offset: 0 })
                setRefresh(Math.random())
                dispatch({ action: 'clear' })
                setGuid(null)
                setPage('aranzacje')
              }}>
                <a href="#aranzacje">
                  <div className=
                    {cn((page === 'aranzacje') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                    <Combine className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Aranżacje</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild onClick={() => {
                setLista([])
                setPagina({ ...pagina, offset: 0 })
                setRefresh(Math.random())
                dispatch({ action: 'clear' })
                setPage('przetworzone')
              }}>
                <a href="#przetworzone">
                  <div className={cn((page === 'przetworzone') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Przetworzone</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Nexu guid={null} sidebar={true} />
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>

        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {page === 'main' && <Main doAranzacji={do_aranzacji}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />}

        {page === 'wysylka' && <Wysylka />}
        {page === 'aranzacje' && <Aranzacje guidProvider={guid} />}
        {page === 'przetworzone' && <Przetworzone />}

      </SidebarInset>
    </SidebarProvider>
  )
}
