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
import React, { useRef, useState } from 'react'
// kod z https://paulallies.medium.com/how-to-build-a-react-autocomplete-component-31085bf0c82b
const KEY_CODES = {
    "DOWN": 40,
    "UP": 38,
    "PAGE_DOWN": 34,
    "ESCAPE": 27,
    "PAGE_UP": 33,
    "ENTER": 13,
}

function useAutoComplete({ delay = 500, source, onChange }:any) {
    
    const [myTimeout, setMyTimeOut] = useState(setTimeout(() => { }, 0))
    const listRef = useRef<any>()
    const [suggestions, setSuggestions] = useState<any>([])
    const [isBusy, setBusy] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [textValue, setTextValue] = useState("")

    function delayInvoke(cb:any) {
        if (myTimeout) {
            clearTimeout(myTimeout)
        }
        setMyTimeOut(setTimeout(cb, delay));
    }

    function selectOption(index:any) {
        if (index > -1) {
            onChange(suggestions[index])
            setTextValue(suggestions[index].label)
        }
        clearSuggestions()
    }

    async function getSuggestions(searchTerm:any) {
        if (searchTerm && source) {
            const options = await source(searchTerm)
            setSuggestions(options)
        }
    }

    function clearSuggestions() {
        setSuggestions([])
        setSelectedIndex(-1)
    }

    function onTextChange(searchTerm:any) {
        setBusy(true)
        setTextValue(searchTerm)
        clearSuggestions();
        delayInvoke(() => {
            getSuggestions(searchTerm)
            setBusy(false)
        });
    }


    const optionHeight = listRef?.current?.children[0]?.clientHeight

    function scrollUp() {
        if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
        if(listRef.current != null &&  listRef.current.scrollTop != null)
            listRef.current.scrollTop -= optionHeight
    }

    function scrollDown() {
        if (selectedIndex < suggestions.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
        if(listRef.current != null &&  listRef.current.scrollTop != null)
            listRef.current.scrollTop = selectedIndex * optionHeight
    }

    function pageDown() {
        setSelectedIndex(suggestions.length - 1)
        if(listRef.current != null &&  listRef.current.scrollTop != null)
            listRef.current.scrollTop = suggestions.length * optionHeight
    }

    function pageUp() {
        setSelectedIndex(0)
        if(listRef.current != null &&  listRef.current.scrollTop != null)
            listRef.current.scrollTop = 0
    }

    function onKeyDown(e:any) {
        const keyOperation = {
            [KEY_CODES.DOWN]: scrollDown,
            [KEY_CODES.UP]: scrollUp,
            [KEY_CODES.ENTER]: () => selectOption(selectedIndex),
            [KEY_CODES.ESCAPE]: clearSuggestions,
            [KEY_CODES.PAGE_DOWN]: pageDown,
            [KEY_CODES.PAGE_UP]: pageUp,
        }
        if (keyOperation[e.keyCode]) {
            keyOperation[e.keyCode]()
        } else {
            setSelectedIndex(-1)
        }
    }

    return {
        bindOption: {
            onClick: (e:any) => {
                let nodes = Array.from(listRef.current.children);
                selectOption(nodes.indexOf(e.target.closest("li")))
            }
        },
        bindInput: {
            value: textValue,
            onChange: (e:any) => onTextChange(e.target.value),
            onKeyDown
        },
        bindOptions: {
            ref: listRef
        },
        isBusy,
        suggestions,
        selectedIndex,
    }
}
export default useAutoComplete