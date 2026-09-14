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
'use client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { AtSign, Upload } from "lucide-react";
import { dodajEml, dodajZipEdoreczenie } from "../actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function EdoreczenieUploader( {rodzaj = 'przychodzaca'}:{rodzaj: string}) {

    return <Popover>
        <PopoverTrigger>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Upload className="h-4 w-4" ></Upload>
                </TooltipTrigger>

                <TooltipContent>Dodaj zip eDoreczenia {rodzaj}</TooltipContent>
            </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="w-400">
            <form className="grid gap-2" action={dodajZipEdoreczenie}>
                <Label htmlFor="plikArchiwumEdoreczenie">Plik archiwum eDoreczenia </Label>
                <Input type="file" id="plikArchiwumEdoreczenie" name="zip" />
                <Input type="hidden" name="rodzaj" value={rodzaj}/>
                <PopoverClose asChild>
                    <Button type="submit">Wgraj archaiwum ({rodzaj})</Button>
                </PopoverClose>

            </form>
        </PopoverContent>
    </Popover>
}
export function EmlUploader( {rodzaj = 'przychodzaca'}:{rodzaj: string}) {

    return <Popover>
        <PopoverTrigger>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AtSign className="h-4 w-4" />
                </TooltipTrigger>

                <TooltipContent>Dodaj plik email (eml) {rodzaj}</TooltipContent>
            </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="w-400">
            <form className="grid gap-2" action={dodajEml}>
                <Label htmlFor="plikEml">Plik email (eml) </Label>
                <Input type="file" id="plikEml" name="eml" />
                <Input type="hidden" name="rodzaj" value={rodzaj}/>
                <PopoverClose asChild>
                    <Button type="submit">Wgraj email (eml, {rodzaj})</Button>
                </PopoverClose>

            </form>
        </PopoverContent>
    </Popover>
}