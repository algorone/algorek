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

import React, { useRef, useState } from 'react'
import useAutoComplete from '@/lib/use-autocomplete'
import { szukajKorespondent } from '@/app/main/actions'
import { Command, CommandInput, CommandItem, CommandList } from './command'

const Options = [
    { value: "1", label: "John" , prop: "Kuku jene"},
    { value: "2", label: "Jack" , prop: {name: "Jack", alias: "The Ripper"}},
    { value: "3", label: "Jane" },
    { value: "4", label: "Mike" },
]

export default function TestAutocomplete() {

     const { bindInput, bindOptions,  bindOption, isBusy, suggestions, selectedIndex} = useAutoComplete({
        onChange: (value:any) => console.log(value),
        source: async (search:any) => {
            return (await szukajKorespondent(search)).map((r:any) => ({value: r.kr_id, label: r.kr_dane, ...r}))
        }
    })

       return (
        <div className="p-2 border" >
                            <input
                    placeholder='Search'
                    className="flex-grow px-1 outline-none"
                    {...bindInput}
                />
             <div className="flex items-center w-full"> 
       
                {isBusy && <div className="w-4 h-4 border-2 border-dashed rounded-full border-slate-500 animate-spin"></div>}
            </div>
            <ul {...bindOptions} className="w-full scroll-smooth absolute max-h-[260px] overflow-x-hidden overflow-y-auto bg-slate-100 z-10" >
                {
                    suggestions.map((_:any, index:any) => (
                        <li
                            className={`flex items-center h-[40px] p-1 hover:bg-slate-300 ` + (selectedIndex === index && "bg-slate-300")}
                            key={index}
                            {...bindOption}
                        >
                            <div className="flex items-center space-x-1">
                              
                                <div>{suggestions[index].label}</div>
                            </div>
                        </li>
                    ))
                }
            </ul> 
        </div>
    )
}
