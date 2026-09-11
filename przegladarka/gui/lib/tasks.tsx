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

import { createContext, useContext, useReducer } from 'react';


const TasksContext = createContext<Array<any>>([]);

const TasksDispatchContext = createContext<any>(null);

export function TasksProvider({ children }:any) {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    [])

  return (
  <TasksContext.Provider value={tasks}>
    <TasksDispatchContext.Provider value={dispatch}>
      {children}
    </TasksDispatchContext.Provider>
  </TasksContext.Provider>
)
}

export function useTask() {
  return useContext(TasksContext);
}

export function useTaskDispatch() {
  return useContext(TasksDispatchContext);
}

function tasksReducer(tasks:any, action:{ action: string, guid: string}):any {
  switch (action.action) {
    case 'add': {
      return [...tasks, {
        guid: action.guid,
        done: false
      }];
    }
    case 'done': {
      return tasks.map((t: { guid: any }) => {
        if (t.guid === action.guid) {
          return  {
            guid: action.guid,
            done: true
          }
        } else {
          return t;
        }
      });
    }
    case 'delete': {
      return tasks.filter((t : { guid: any }) => t.guid !== action.guid)
    }

    case 'clear': {
      return []
    }
    default: {
      throw Error('Unknown action: ' + action.action)
    }
  }
}

