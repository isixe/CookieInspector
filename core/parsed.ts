/**
 * Cookie parsed core
 * @name cookieString The cookie string to parse
 * @name ParsedCookie[] An array of parsed cookies list
 */

import { CookieType, ParsedCookie } from '@/types/cookie'
import { getStringType } from '@/utils/stringType'

/**
 * Parse a cookie string from the parsed cookies list
 * @returns string: The origin cookie string
 */
export function parseToOriginString() {
  return
}

/**
 * Parse a cookie string from the origin cookie string format
 * @param newCookieString The new cookie string to parse
 * @returns ParsedCookie[]: An array of parsed cookies list
 */
export function parseFromOriginString(newCookieString: string): ParsedCookie[] {
  if (!newCookieString) {
    return []
  }

  const cookieList = newCookieString.split(';')

  let parsedCookies: ParsedCookie[] = []

  cookieList.forEach((rowCookie, index) => {
    let subValues: { name: string; value: string; type: CookieType }[] = []

    if (rowCookie.indexOf('&') > 0) {
      rowCookie.split('&').forEach((subCookie) => {
        const [name, value] = subCookie.split('=')
        if (name) {
          subValues.push({
            name,
            value,
            type: getStringType(value)
          })
        }
      })
    }

    const rowName = rowCookie.split('=')[0]
    const rowValue = rowCookie.substring(rowCookie.indexOf('=') + 1)
    const type = getStringType(rowValue)
    subValues = subValues.filter((subValue) => subValue !== undefined)

    const rowParsedCookie = {
      id: `${index}`,
      name: rowName || '',
      value: rowValue || '',
      type,
      subValues
    }

    parsedCookies.push(rowParsedCookie)
  })

  return parsedCookies
}
