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
  setSavedCookies: () => {}
})

export function CookieProvider({ children }: { children: ReactNode }) {
  const { setting } = useContext(SettingContext)

  const [originCookieString, setOriginCookieString] = useState<string>('')
  const [parsedCookies, setParsedCookies] = useState<ParsedCookie[]>([])
  const [history, setHistory] = useState<CookieHistoryEntry[]>([])
  const [savedCookies, setSavedCookies] = useState<SavedCookieEntry[]>([])

  const [selectedCookies, setSelectedCookies] = useState<string[]>([])

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

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('cookieHistory')
    const savedCookiesData = localStorage.getItem('savedCookies')

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

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

  // Add this effect to automatically save to history when cookies are parsed
  useEffect(() => {
    if (parsedCookies.length > 0) {
      addToHistory()
    }
  }, [parsedCookies, addToHistory])

  const clearHistory = () => {
    setHistory([])
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
        setSavedCookies
      }}
    >
      {children}
    </CookieContext.Provider>
  )
}
