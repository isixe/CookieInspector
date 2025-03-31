'use client'

import { SettingContext } from '@/components/context/setting-context'
import {
  CookieContextType,
  CookieHistoryEntry,
  ParsedCookie,
  SavedCookieEntry
} from '@/types/cookie'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react'

/**
 * cookie context variable
 */
export const CookieContext = createContext<CookieContextType>({
  originCookieString: '',
  setOriginCookieString: () => {},
  parsedCookies: [],
  setParsedCookies: () => {},
  selectedCookies: [],
  setSelectedCookies: () => {},
  history: [],
  clearHistory: () => {},
  savedCookies: [],
  setSavedCookies: () => {},
  deleteOneSavedCookie: () => {},
  updateOneSavedCookie: () => {},
  deleteOneSubCookie: () => {},
  deleteOneCookie: () => {},
  appendCookieString: () => {},
  clearSavedCookies: () => {}
})

export function CookieProvider({ children }: { children: ReactNode }) {
  const { setting } = useContext(SettingContext)

  const [originCookieString, setOriginCookieString] = useState<string>('')
  const [parsedCookies, setParsedCookies] = useState<ParsedCookie[]>([])
  const [history, setHistory] = useState<CookieHistoryEntry[]>([])
  const [savedCookies, setSavedCookies] = useState<SavedCookieEntry[]>([])

  const [selectedCookies, setSelectedCookies] = useState<string[]>([])
  // Load data from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('cookieHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

    const savedCookiesData = localStorage.getItem('savedCookies')
    if (savedCookiesData) {
      setSavedCookies(JSON.parse(savedCookiesData))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cookieHistory', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('savedCookies', JSON.stringify(savedCookies))
  }, [savedCookies])

  /**
   * Add a new history entry when the cookies is modified
   * @namespace [cookie context]
   */
  const addToHistory = useCallback(() => {
    if (originCookieString.trim() === '') {
      return
    }

    const newEntry: CookieHistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      originCookieString,
      parsedCookies: [...parsedCookies]
    }

    setHistory((prev) => {
      // Check if this exact cookie string already exists in history
      const exists = prev.some(
        (entry) => entry.originCookieString === originCookieString
      )
      if (exists) {
        return prev
      }

      // Apply history limit
      const newHistory = [newEntry, ...prev]
      if (newHistory.length > setting.historyLimit) {
        return newHistory.slice(0, setting.historyLimit)
      }
      return newHistory
    })
  }, [originCookieString, parsedCookies, setting.historyLimit])

  // Add this effect to automatically save to history when cookies are parsed
  useEffect(() => {
    if (parsedCookies.length > 0) {
      addToHistory()
    }
  }, [parsedCookies, addToHistory])

  const clearHistory = () => {
    setHistory([])
  }

  const deleteOneSavedCookie = (id: string) => {
    setSavedCookies((prev) => prev.filter((cookie) => cookie.id !== id))
  }

  // Add function to update a saved cookie
  const updateOneSavedCookie = (
    id: string,
    name: string,
    tags: string[],
    originCookieString: string,
    parsedCookies: ParsedCookie[],
    description: string
  ) => {
    setSavedCookies((prev) =>
      prev.map((cookie) => {
        if (cookie.id === id) {
          return {
            id,
            name,
            tags,
            timestamp: cookie.timestamp,
            originCookieString,
            parsedCookies,
            description
          }
        }
        return cookie
      })
    )
  }

  const deleteOneSubCookie = (
    id: string,
    subValueIndex: number,
    parsedCookies: ParsedCookie[]
  ) => {
    const updatedCookies = parsedCookies.map((cookie) => {
      if (cookie.id == id) {
        if (subValueIndex) {
          // Update a sub-value
          const originSubValues = cookie.subValues?.filter(
            (_, index) => index !== subValueIndex
          )

          console.log(originSubValues)
          console.log(cookie.subValues)
          return { ...cookie, subValues: originSubValues }
        }
      }
      return cookie
    })
    const newCookieString = updatedCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join(';')
  }

  /**
   * Delete a cookie string which in current parser table row
   * from the parsed cookies
   * @param id The id of the cookie to delete
   */
  const deleteOneCookie = (id: string) => {
    const updatedCookies = parsedCookies.filter((cookie) => cookie.id !== id)
    setParsedCookies(updatedCookies)

    // Update the cookie string
    const newCookieString = updatedCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join(';')

    setOriginCookieString(newCookieString)

    // Remove from selected if it was selected
    setSelectedCookies((prev) => prev.filter((cookieId) => cookieId !== id))
  }

  const appendCookieString = (cookieStr: string) => {
    if (!cookieStr.trim()) return

    const currentStr = originCookieString.trim()
    const newStr = currentStr ? `${currentStr}; ${cookieStr}` : cookieStr

    setOriginCookieString(newStr)
  }

  const clearSavedCookies = () => {
    setSavedCookies([])
  }

  return (
    <CookieContext.Provider
      value={{
        originCookieString,
        setOriginCookieString,
        parsedCookies,
        setParsedCookies,
        selectedCookies,
        setSelectedCookies,
        history,
        clearHistory,
        savedCookies,
        setSavedCookies,
        deleteOneSavedCookie,
        updateOneSavedCookie,
        deleteOneSubCookie,
        deleteOneCookie,
        appendCookieString,
        clearSavedCookies
      }}
    >
      {children}
    </CookieContext.Provider>
  )
}
