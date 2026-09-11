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
import { Plus, Tag, Trash2 } from "lucide-react"
import { createContext, useContext, useEffect, useReducer, useState, useTransition } from "react";


import { Drawer } from 'vaul';
import { getWToku, szukajKorespondent,  tagi } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import useAutoComplete from "@/lib/use-autocomplete";

function todoDispach(state: any, action: { tag: string, value: any }): any {
  if (action === undefined)
    return []
  const idx = state.map((i: any) => i.tag).indexOf(action?.tag)
  if (idx >= 0) {
    state[idx] = action
  } else
    state.push(action)
  return state
}

const TodoContext = createContext<any>(null);

export function TodoProvider({ children }: any) {
  const [todo, addTodo] = useReducer(todoDispach, [])

  return (
    <TodoContext.Provider value={[todo, addTodo]}>
      {children}
    </TodoContext.Provider>
  )
}
export function useTodo(): any {
  return useContext(TodoContext)
}


export default function TagEditor({ guid }: { guid: any }) {
  const [tags, setTags] = useState<any>()

  const [sigma, setSigma] = useState<any>()
  const [todo, addTodo] = useTodo()
  // const [todo, addTodo] = useReducer(todoDispach, [])
  const [dirty, setDirty] = useState<string>("")

  const [panding, setTransition] = useTransition()

  useEffect(() => {
    setTransition(async () => {
      addTodo(undefined)
      if (guid) {
        var data = await tagi(guid)
        setTags(data)
        // TODO przywrócic Sigme
        // var wToku = await getWToku(guid)
        // if (wToku !== null) {
        //   setSigma(wToku.filter((line: any) => line.startsWith('- ')))
        //   const sigmaTags = wToku.filter((l: string) => l.startsWith('- taguj-')).map((s: any) => s.slice(8, s.length - 1))
        //   const doneTags = data.map((t: any) => t.ta_tag)
        //   const todoTags = sigmaTags.filter((tag: any) => !doneTags.includes(tag))
        //   todoTags.forEach(td => addTodo({ 'tag': td.trim(), value: null }))
        // }
      }
    })
  }, [guid])


  function isTagInTodo(todo: any, tagName: any) {
    const todoTags = todo.map((t: any) => t.tag.trim());
    return todoTags.includes(tagName.trim())
  }

  function isTechniczny(tag: any) {
    // TODO defiicje technicznych tagow do sigmy
    return ['kolejka', 'oznaczenie', 'ekstrakt', 'zwrotka'].includes(tag)
  }

  return (

    <Drawer.Root direction="right" modal={true} dismissible={true} >
      <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
        <Tag className="h-4 w-4" />
      </Drawer.Trigger>
      <Drawer.Portal >
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content style={{overflowX:"hidden"}}
          className="right-2 top-2 bottom-2 fixed z-10 outline-none flex w-600"
        // The gap between the edge of the screen and the drawer is 8px in this case., usniete w-[310px]
        // style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
        >
          <div className="bg-zinc-50 h-full w-full grow p-5 flex flex-col rounded-[16px]">
            <div className="max-w-md mx-auto">
              <Drawer.Title className="font-medium mb-2 text-zinc-900">Metadane</Drawer.Title>
              <Drawer.Description className="text-zinc-600 mb-2">
                {guid}
              </Drawer.Description>
            </div>

            <Accordion type="multiple" className="w-500" defaultValue={['tagi', 'edytor']} style={{overflowY:"auto"}}>
              <AccordionItem value="sigma">
                <AccordionTrigger> Sigma - stan pożądany</AccordionTrigger>
                <AccordionContent>
                  {sigma && sigma.map((s: any) => <li key={s}>{s}</li>)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tagi">
                <AccordionTrigger>Tagi</AccordionTrigger>
                <AccordionContent key={dirty}>
                  <Table>
                    <TableBody>
                      {tags && tags.filter((t: any) => !isTechniczny(t.ta_tag) && !isTagInTodo(todo, t.ta_tag)).map((tag: any) =>
                        <TableRow key={tag.ta_id}>
                          <TableCell>{tag.ta_tag}</TableCell>
                          <TableCell className="w-400" style={{width:"400px"}}>{(tag.ta_tag === 'strona') ? <DisplayStrona dane={tag.ta_tag2}></DisplayStrona> : <>{tag.ta_tag2}</>}                             </TableCell>
                          {/* <TableCell><Button size="sm" variant="ghost" onClick={() => { addTodo({ 'tag': tag.ta_tag, 'value': tag.ta_tag2 }); setDirty(dirty + "1") }}><Edit className="h-4 w-4" /></Button></TableCell> */}
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="techniczne">
                <AccordionTrigger>Techniczne</AccordionTrigger>
                <AccordionContent key={dirty}>
                  <Table>
                    <TableBody>
                      {tags && tags.filter((t: any) => isTechniczny(t.ta_tag) && !isTagInTodo(todo, t.ta_tag)).map((tag: any) =>
                        <TableRow key={tag.ta_id}>
                          <TableCell>{tag.ta_tag}</TableCell>
                          <TableCell className="w-400"  style={{width:"400px"}}>{(tag.ta_tag === 'strona') ? <DisplayStrona dane={tag.ta_tag2}></DisplayStrona> : <>{tag.ta_tag2}</>}                             </TableCell>
                          {/* <TableCell><Button size="sm" variant="ghost" onClick={() => { addTodo({ 'tag': tag.ta_tag, 'value': tag.ta_tag2 }); setDirty(dirty + "1") }}><Edit className="h-4 w-4" /></Button></TableCell> */}
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <DrawerFooter key={dirty}>
              <DrawerClose>

                <Button variant="secondary" onClick={() => addTodo(undefined)} disabled={todo.length === 0}>Zamknij</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>

  );
}

export function DodajTag({ add }: { add: any }) {
  const [tagName, setTagName] = useState<string>()
  const [todo, addTodo] = useTodo()
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="tag" onChange={(e) => setTagName(e.target.value)} />
      <Button variant="ghost" size="icon" onClick={() => add(tagName)}><Plus className="h-4 w-4" /></Button>
    </div>
  )
}

export function DisplayStrona({ dane }: { dane: any }) {
  try {
    const strona = JSON.parse(dane)
    return (<>
      <div>{strona.kr_nazwa} {strona.kr_imie} {strona.kr_nazwisko}</div>
      <div>{strona.kr_ulica} {strona?.kr_adres_nr}</div>
      <div>{strona?.kr_kodpocztowy} {strona.kr_miejscowosc}</div>
      {(strona.kr_edoreczenie) && <div>AED: {strona.kr_edoreczenie}</div>}
      {(strona.kr_email) && <div>email: {strona.kr_email}</div>}
    </>)
  } catch (e) {
    return (<>ERROR {e}</>)
  }

}

export function DefaultTagEditor({ name, initialValue, dispach }: { name: string, initialValue: string, dispach: any }) {
  const [todo, addTodo] = useTodo()
  const [removed, setRemoved] = useState(todo.find((t: any) => t.tag === name)?.action === 'delete')

  function remove() {
    setRemoved(true)
    const currentTag = todo.find((t: any) => t.tag === name)
    addTodo({ 'tag': currentTag.tag, 'value': currentTag.value, 'action': 'delete' })
  }
  return (
    <TableRow key={name} style={{ textDecoration: (removed) ? "line-through" : "" }}>
      <TableCell>{name}</TableCell>
      <TableCell>{(removed) ? <>{initialValue}</>
        : <Input placeholder={name} onChange={(e) => addTodo({ 'tag': name, 'value': e.target.value })} id={name} defaultValue={initialValue} />
      }
      </TableCell>
      <TableCell>
        <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /></Button>
      </TableCell>
    </TableRow>)
}

export function StronaTagEditor({ name, initialValue, dispach }: { name: string, initialValue: string, dispach: any }){
  const [todo, addTodo] = useTodo()
  const [removed, setRemoved] = useState(todo.find((t: any) => t.tag === name)?.action === 'delete')
  const { bindInput, bindOptions,  bindOption, isBusy, suggestions, selectedIndex} = useAutoComplete({
    onChange: (value:any) => {
     
      // dispach({ 'tag': name, 'value': value })
      const update = { 'tag': name, 'value': value }
      dispach(update)
      console.log(JSON.stringify(update))
    },
    source: async (search:any) => {
        return (await szukajKorespondent(search)).map((r:any) => ({value: r.kr_id, label: r.kr_dane, ...r}))
    }
})
  function remove() {
    setRemoved(true)
    const currentTag = todo.find((t: any) => t.tag === name)
    addTodo({ 'tag': currentTag.tag, 'value': currentTag.value, 'action': 'delete' })
  }
  return(
    <><TableRow key="wyszykiwarka-koresponendtow">
      <TableCell colSpan={3}>
      {/* <TestAutocomplete></TestAutocomplete> */}
      <Input placeholder="szukaj korespondenta" {...bindInput} />

      <ul {...bindOptions} className="w-full scroll-smooth absolute max-h-[260px] bg-slate-100 z-10">
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
            
      </TableCell>
      </TableRow>
    <TableRow key={name} style={{ textDecoration: (removed) ? "line-through" : "" }}>
    <TableCell>{name}</TableCell>
    <TableCell><DisplayStrona dane={initialValue}/>
    </TableCell>
    <TableCell>
      <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /></Button>
    </TableCell>
  </TableRow>
  </>
  )
}

export function TextAreaTagEditor({ name, initialValue, dispach }: { name: string, initialValue: string, dispach: any }) {
  return (<div className="flex w-full max-w-sm items-center space-x-2">
    <Label htmlFor={name}>{name}</Label>
    <Textarea placeholder={name} onChange={(e) => dispach({ 'tag': name, 'value': e.target.value })} id={name} defaultValue={initialValue} />
  </div>
  )
}

export function WydzialTagEditor({ name, wydzialy, dispach, initialValue }: { name: string, wydzialy: any, dispach: any, initialValue: any }) {
  const [value, setValue] = useState(initialValue)
  function set(newValue: any) {
    setValue(newValue)
    dispach({ 'tag': name, 'value': newValue })
  }
  return (
    <TableRow key={name}>
      <TableCell>{name}</TableCell>
      <TableCell>
        <Select onValueChange={set} value={value}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Wybierz wydział" />
          </SelectTrigger>
          <SelectContent>
            {wydzialy && wydzialy.map((w: any) => <SelectItem value={w} key={w}> {w}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell><Button size="sm" variant="ghost" ><Trash2 className="h-4 w-4" /></Button></TableCell>
    </TableRow>
  )
}
