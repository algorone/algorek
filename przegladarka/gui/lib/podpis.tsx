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

const TasksContext = createContext<any>(null);

export function PodpisProvider({ children }:any) {
  const [podpis, setPodpis] = useState([])

  return (
  <TasksContext.Provider value={[podpis, setPodpis]}>
      {children}
  </TasksContext.Provider>
)
}

export function usePodpis():any {
  return useContext(TasksContext)
}


