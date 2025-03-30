'use client'

import { Setting, SettingContextType } from '@/types/setting'
import { createContext, useEffect, useState, type ReactNode } from 'react'

const defaultSetting: Setting = {
  historyLimit: 300
}

export const SettingContext = createContext<SettingContextType>(undefined)

export function SettingProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<Setting>(defaultSetting)

  // Load Setting from localStorage on initial render
  useEffect(() => {
    const savedSetting = localStorage.getItem('cookieSetting')
    if (savedSetting) {
      try {
        const parsedSetting = JSON.parse(savedSetting)
        setSetting(parsedSetting)
      } catch (error) {
        console.error('Failed to parse Setting:', error)
      }
    }
  }, [])

  // Save Setting to localStorage when they change
  const updateSetting = (newSetting: Partial<Setting>) => {
    setSetting((prev) => {
      const updated = { ...prev, ...newSetting }
      localStorage.setItem('cookieSetting', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <SettingContext.Provider value={{ setting, updateSetting }}>
      {children}
    </SettingContext.Provider>
  )
}
