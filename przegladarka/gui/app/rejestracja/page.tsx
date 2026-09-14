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


import { cn } from "@/lib/utils"

import { TasksProvider, useTaskDispatch } from "@/lib/tasks"

import { useState } from "react"
import { ListProvider, useList } from "@/lib/list"
import { CertProvider } from "@/lib/certs"
import { ViewProvider } from "@/lib/view"
import { RefreshProvider, useRefresh } from "@/lib/refresher"
import { PodpisProvider } from "@/lib/podpis";
import { PaginaProvider, usePagina } from "@/lib/pagina";
import { ZnakRwaProvider } from "@/lib/znakRwa";
// import { SigmaStreamProvider } from "@/lib/use-sigma-stream"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEnd, Home, Combine, Inbox, ScanEye } from "lucide-react";

import { Main } from "./components/main";
import { Skany } from "./components/skany";
import { PurdeIn } from "./components/purde_in";
import { PurdeOut } from "./components/purde_out";
import { PrzetworzoneRej } from "./components/przetworzone_rej";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

function InnerPage(){

  const defaultCollapsed = undefined
  const defaultLayout = undefined
  const [page, setPage] = useState('main')
  const [refresh, setRefresh] = useRefresh()
  const [lista, setLista] = useList()
  const dispatch = useTaskDispatch()
  const [pagina, setPagina] = usePagina()

  return(
                        <SidebarProvider
                          style={
                            {
                              "--sidebar-width": "250px",
                            } as React.CSSProperties
                          }
                        >
                          <Sidebar collapsible="icon" >
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
                                  <MainLinks sidebar={true}/>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                  <SidebarMenuButton size="lg" asChild onClick={() => {
                                    setLista([])
                                    setPagina({ ...pagina, offset: 0 })
                                    setRefresh(Math.random())
                                    dispatch({ action: 'clear' })
                                    setPage('rejestracja')
                                  }}>
                                    <a href="#rejestracja">
                                      <div className=
                                        {cn((page === 'rejestracja') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                                        <Inbox className="size-4" />
                                      </div>
                                      <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-medium">Rejestracja</span>
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
                                    setPage('skany')
                                  }}>
                                    <a href="#skany">
                                      <div className=
                                        {cn((page === 'skany') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                                        <ScanEye className="size-4" />
                                      </div>
                                      <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-medium">Skany</span>
                                      </div>
                                    </a>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                  <SidebarMenuButton size="lg" asChild onClick={() => {
                                    setLista([])
                                    setPagina({ ...pagina, offset: 0 , limit: 20})
                                    setRefresh(Math.random())
                                    dispatch({ action: 'clear' })
                                    setPage('post')
                                  }}>
                                    <a href="#post-factum">
                                      <div className={cn((page === 'post') ? "bg-sidebar-primary text-sidebar-primary-foreground" : "", "flex aspect-square size-8 items-center justify-center rounded-lg")}>
                                        <Combine className="size-4" />
                                      </div>
                                      <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-medium">Post factum</span>
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


                              </SidebarMenu>
                            </SidebarContent>
                            <SidebarFooter>

                            </SidebarFooter>
                            <SidebarRail />
                          </Sidebar>
                          <SidebarInset>
                            {page === 'post' && <PurdeOut
                              defaultLayout={defaultLayout}
                              defaultCollapsed={defaultCollapsed}
                            />}

                            {page === 'skany' && <Skany
                              defaultLayout={defaultLayout}
                              defaultCollapsed={defaultCollapsed}
                              navCollapsedSize={4}
                            />}
                            {page === 'rejestracja' && <PurdeIn
                              defaultLayout={defaultLayout}
                              defaultCollapsed={defaultCollapsed}
                            />}

                            {page === 'przetworzone' && <PrzetworzoneRej
                              defaultLayout={defaultLayout}
                              defaultCollapsed={defaultCollapsed}
                            />}

                          

                          </SidebarInset>
                        </SidebarProvider>
  )
}
