/**
 * Cookie parsed core
 */

import { ParsedCookie, SubParsedCookie } from '@/types/cookie'
import { getStringType } from '@/utils/stringType'

/**
 * ------------------------------------------------------------------------
 * ParsedCookie | cookieString
 * @name cookieString The cookie string to parse
 * @name ParsedCookie[] An array of parsed cookie list
 * ------------------------------------------------------------------------
 */

/**
 * Parse a ParsedCookie list to cookie string
 * @param parsedCookies The ParsedCookie list to parse
 * @returns string: The origin cookie string
 */
export function parseToOriginString(parsedCookie: ParsedCookie[]): string {
  if (!parsedCookie || parsedCookie.length === 0) {
    return ''
  }

  const cookieString = parsedCookie
    .map((row) => `${row.name}=${row.value}`)
    .join(';')

  return cookieString
}

/**
 * Parse the origin cookie string to a ParsedCookie list
 * @param cookieString The new cookie string to parse
 * @returns ParsedCookie[]: An array of parsed cookie list
 */
export function parseFromOriginString(cookieString: string): ParsedCookie[] {
  if (!cookieString || !cookieString.trim()) {
    return []
  }

  const cookieList = cookieString.split(';')

  let parsedCookies: ParsedCookie[] = []

  cookieList.forEach((rowCookieString, index) => {
    const splitIndex = rowCookieString.indexOf('=')

    const rowName = rowCookieString.split('=')[0]
    const rowValue =
      splitIndex >= 0 ? rowCookieString.substring(splitIndex + 1) : ''

    const type = getStringType(rowValue)
    const subValues = subParseFromRowCookieString(rowCookieString)

    const rowParsedCookie = {
      id: `row-${index}`,
      name: rowName || '',
      value: rowValue || '',
      type,
      subValues
    }

    parsedCookies.push(rowParsedCookie)
  })

  parsedCookies = parsedCookies.filter((row) => row.name || row.value)

  return parsedCookies
}

/**
 * ------------------------------------------------------------------------
 * rowCookieString | SubParsedCookie
 * @name rowCookieString The row cookie string to parse
 * @name SubParsedCookie An array of sub parsed cookies
 * ------------------------------------------------------------------------
 */

/**
 * Parse a raw cookie string to a SubParsedCookie list
 * @param rowCookieString The row cookie string to parse
 * @returns SubParsedCookie[] An array of sub parsed cookies
 */
export function subParseFromRowCookieString(
  rowCookieString: string
): SubParsedCookie[] {
  if (!rowCookieString) {
    return []
  }

  let subValues: SubParsedCookie[] = []

  if (rowCookieString.indexOf('&') > 0) {
    rowCookieString.split('&').forEach((rowCookieString) => {
      const splitIndex = rowCookieString.indexOf('=')

      const name = rowCookieString.split('=')[0]
      const value =
        splitIndex >= 0 ? rowCookieString.substring(splitIndex + 1) : ''

      const subParsedCookie = {
        name: name || '',
        value: value || '',
        type: getStringType(value)
      }

      if (name || value) {
        subValues.push(subParsedCookie)
      }
    })
    subValues = subValues.filter((subValue) => subValue !== undefined)
  }

  if (subValues.length === 1) {
    return []
  }

  return subValues
}

/**
 * Parse a SubParsedCookie list to row cookie string
 * @param subValues The SubParsedCookie list to parse
 * @returns string: The row cookie string
 */
export function subParseToRowCookieString(
  subValues: SubParsedCookie[]
): string {
  const rowCookieString = subValues
    .map((subValue) => {
      if (subValue.value) {
        return `${subValue.name}=${subValue.value}`
      }
      return `${subValue.name}=`
    })
    .join('&')

  return rowCookieString
}

/**
 * ------------------------------------------------------------------------
 * rowValue [->] ParsedCookie[]
 * @name rowValue a row string cookie
 * @name ParsedCookie[] An array of parsed cookies list
 * ------------------------------------------------------------------------
 */

/**
 * Update the parsed cookies list with the new item
 * @param originParsedCookie The original parsed cookies list
 * @param rowId The id of the cookie to update
 * @param rowValue The value of the cookie to update
 * @param rowName The name of the cookie to update
 * @return ParsedCookie[]: The updated parsed cookies list
 */
export function updateRowToOriginParsedCookie(
  originParsedCookie: ParsedCookie[],
  rowId: string,
  rowValue: string,
  rowName?: string
): ParsedCookie[] {
  let newRowParsedCookies = originParsedCookie.map((cookie) => {
    if (cookie.id == rowId) {
      const name = rowName || cookie.name
      const value = rowValue
      const type = getStringType(rowValue)
      const subValues = subParseFromRowCookieString(`${name}=${value}`)

      return {
        ...cookie,
        name,
        value,
        type,
        subValues
      }
    }
    return cookie
  })

  if (rowValue.indexOf(';') > -1) {
    const originCookieString = parseToOriginString(newRowParsedCookies)
    newRowParsedCookies = parseFromOriginString(originCookieString)
  }

  newRowParsedCookies = newRowParsedCookies.filter(
    (row) => row.name || rowValue
  )
  return newRowParsedCookies
}

/**
 * ------------------------------------------------------------------------
 * subRowValue [->] SubParsedCookie[]
 * @name subRowValue a sub row string cookie
 * @name SubParsedCookie[] An array of sub parsed cookies list
 * ------------------------------------------------------------------------
 */

/**
 *
 * @param subRowName
 * @param subRowValue
 * @returns SubParsedCookie[] a SubParsedCookie list
 */
export function updateSubRowToOriginSubParsedCookie(
  originSubParsedCookies: SubParsedCookie[],
  subRowIndex: Number,
  subRowValue: string
): SubParsedCookie[] {
  let newSubParsedCookies = originSubParsedCookies.map((subValue, index) => {
    if (subRowIndex === index) {
      return {
        name: subValue.name,
        value: subRowValue,
        type: getStringType(subRowValue)
      }
    }
    return subValue
  })

  newSubParsedCookies = newSubParsedCookies.filter(
    (subValue) => subValue.name || subValue.value
  )

  if (subRowValue.indexOf('&') > -1) {
    const rowCookieString = subParseToRowCookieString(newSubParsedCookies)
    newSubParsedCookies = subParseFromRowCookieString(rowCookieString)
  }

  return newSubParsedCookies
}
