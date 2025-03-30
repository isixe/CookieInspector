/**
 * Cookie string type
 */
export type CookieType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'json'
  | 'url'
  | 'unknown'

export type CompareSource = 'current' | 'history' | 'saved'
export type CompareMode = 'table' | 'text'

/**
 * ParsedCookie interface to include type with subValues
 */
export interface ParsedCookie {
  id: string
  name: string
  value: string
  type: CookieType
  subValues: { name: string; value: string; type: CookieType }[]
}

/**
 * Compare item interface
 */
export interface CompareItem {
  id: string
  label: string
  cookies: ParsedCookie[]
  originCookieString: string
}

/**
 * Compare result interface
 */
export interface CompareResult {
  name: string
  leftValue: string
  rightValue: string
  isDifferent: boolean
}

/**
 * Cookie history entry
 */
export interface CookieHistoryEntry {
  id: string
  timestamp: number
  originCookieString: string
  parsedCookies: ParsedCookie[]
}

/**
 * Saved cookie entry
 */
export interface SavedCookieEntry {
  id: string
  name: string
  originCookieString: string
  parsedCookies: ParsedCookie[]
  tags: string[]
  description: string
  timestamp: number
}

/**
 * Cookie context type, used to define the context value and method for cookies
 */
export interface CookieContextType {
  originCookieString: string
  setOriginCookieString: (value: string) => void
  parsedCookies: ParsedCookie[]
  setParsedCookies: (cookies: ParsedCookie[]) => void
  selectedCookies: string[]
  setSelectedCookies: (ids: string[]) => void
  history: CookieHistoryEntry[]
  clearHistory: () => void
  savedCookies: SavedCookieEntry[]
  setSavedCookies: (cookies: SavedCookieEntry[]) => void
  deleteOneSavedCookie: (id: string) => void
  updateOneSavedCookie: (
    id: string,
    name: string,
    tags: string[],
    originCookieString: string,
    parsedCookies: ParsedCookie[],
    description: string
  ) => void
  updateOneSubCookie: (
    id: string,
    subValueString: string,
    subValueIndex?: number,
    subValueName?: string,
    newSubValues?: ParsedCookie[]
  ) => void
  deleteOneSubCookie: (
    id: string,
    subValueIndex: number,
    parsedCookies: ParsedCookie[]
  ) => void
  deleteOneCookie: (id: string) => void
  appendCookieString: (cookieStr: string) => void
  clearSavedCookies: () => void
}
