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
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Files, Home, ListEnd, ListStart } from "lucide-react"
import Link from "next/link"

export function MainLinks({ sidebar = true }: { sidebar?: boolean }) {
  return (
    <>

      {sidebar && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton size="lg" asChild>
            <a href="#">
              <div className=" flex aspect-square size-8 items-center justify-center rounded-lg">
                <Home className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Nawigacja</span>
              </div>
            </a>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href="/out"><ListEnd className="size-4"/> Obsługa wychodzacych</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/in"><ListStart className="size-4" /> Obsługa wpływających </Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/rejestracja"><Files className="size-4"/>Rejestrtacja pism</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/"><Home className="size-4" />Strona główna</Link></DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>}
    </>
  )
    
}