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

import React, { useRef, useContext, useSyncExternalStore, useState, createContext } from 'react'

// TODO owinac w try pobrac z ENV - muis wskazywac na proxowaną Sigme
// const sse = new EventSource('/news')
const sse = 'TODO_MIG_TO_15'
const SigmaStreamContext = createContext(sse) 

export function SigmaStreamProvider({ children }:any) {

  return <SigmaStreamContext.Provider value={sse}>
    {children}
    </SigmaStreamContext.Provider>
}

export function useSigmaStream( zainteresowanie : any){
    const [value, setValue] = useState('')
    const mySse = useContext(SigmaStreamContext)
    // TODO przywrocic Sigme
    // const ret = useSyncExternalStore(subscribe, getSnapshot)

    // function subscribe(onStoreChange: () => void):() => void{
    //     function callback(event:any){
    //         const data = event.data
    //         if(Array.isArray(zainteresowanie)){
    //           const found = zainteresowanie.find((elem)=> data.includes(elem))
    //           if(found != null){
    //             setValue(''+Date.now()+','+event.data)
    //             onStoreChange()
    //           }

    //         } else if(data.includes(zainteresowanie)){
    //           setValue(''+Date.now()+','+event.data)
    //           onStoreChange()
    //         }

    //     }
    //     mySse.addEventListener('UPDATED',callback)
    //     return ()=>{
    //       mySse.removeEventListener('UPDATED',callback)
    //     }
    // }
    
    function getSnapshot(){
        return value
    }

    return ''
}





