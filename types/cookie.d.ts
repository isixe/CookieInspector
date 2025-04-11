/**
 * Cookie string type
 */
export type CookieType =
  | 'email'
  | 'url'
  | 'uuid'
  | 'date'
  | 'number'
  | 'boolean'
  | 'timestamp'
  | 'phone'
  | 'json'
  | 'image'
  | 'hex'
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'string'

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
  subValues: SubParsedCookie[]
}

/**
 * SubParsedCookie interface to include type
 */
export interface SubParsedCookie {
  name: string
  value: string
  type: CookieType
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
}
