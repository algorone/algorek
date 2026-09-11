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

import { createContext, useContext, useState, Dispatch } from 'react';

const ViewContext = createContext<any>(null);

export function ViewProvider({ children }:any) {
  const [view, setView] = useState('')

  return (
  <ViewContext.Provider value={[view,setView]}>
      {children}
  </ViewContext.Provider>
)
}

export function useView(initial=null):any {
  if (initial!== null) {
    const [view,setView] = useContext(ViewContext)
    setView(initial)
    return [view,setView]
  } 
  return useContext(ViewContext)
}

export function ViewCase(prop:any){
  const [state,setState] = useView()
  if (state === prop.warunek)
    return <>{prop.children}</>
  else return <></>  
}

