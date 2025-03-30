'use client'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CompareItem,
  CompareMode,
  CompareResult,
  CompareSource
} from '@/types/cookie'
import { AlignJustify, Check, Copy, TableIcon } from 'lucide-react'
import { useContext, useState } from 'react'
import { CookieContext } from '../context/cookie-context'
import { Button } from '../ui/button'

export default function CookieCompare() {
  const { parsedCookies, originCookieString, history, savedCookies } =
    useContext(CookieContext)

  const [leftSource, setLeftSource] = useState<CompareSource>('current')
  const [rightSource, setRightSource] = useState<CompareSource>('history')

  const [leftItemId, setLeftItemId] = useState<string>('')
  const [rightItemId, setRightItemId] = useState<string>('')

  const [compareMode, setCompareMode] = useState<CompareMode>('table')
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

  // Prepare source items
  const currentItem: CompareItem = {
    id: 'current',
    label: 'Current Cookies',
    cookies: parsedCookies,
    originCookieString: originCookieString
  }

  const historyItems: CompareItem[] = history.map((entry) => ({
    id: entry.id,
    label: `History: ${new Date(entry.timestamp).toLocaleString()}`,
    cookies: entry.parsedCookies,
    originCookieString: entry.originCookieString
  }))

  const savedItems: CompareItem[] = savedCookies.map((entry) => ({
    id: entry.id,
    label: `Saved: ${entry.name}`,
    cookies: entry.parsedCookies,
    originCookieString: entry.originCookieString
  }))

  // Get the selected items
  const getSelectedLeftItem = (): CompareItem | null => {
    if (leftSource === 'current') {
      return currentItem
    }
    if (leftSource === 'history') {
      return historyItems.find((item) => item.id === leftItemId) || null
    }
    if (leftSource === 'saved') {
      return savedItems.find((item) => item.id === leftItemId) || null
    }
    return null
  }

  const getSelectedRightItem = (): CompareItem | null => {
    if (rightSource === 'current') {
      return currentItem
    }
    if (rightSource === 'history') {
      return historyItems.find((item) => item.id === rightItemId) || null
    }
    if (rightSource === 'saved') {
      return savedItems.find((item) => item.id === rightItemId) || null
    }
    return null
  }

  const leftItem = getSelectedLeftItem()
  const rightItem = getSelectedRightItem()

  // Compare cookies
  const compareCookies = (): CompareResult[] => {
    if (!leftItem || !rightItem) {
      return []
    }

    const allCookieNames = new Set<string>()
    leftItem.cookies.forEach((cookie) => allCookieNames.add(cookie.name))
    rightItem.cookies.forEach((cookie) => allCookieNames.add(cookie.name))

    return Array.from(allCookieNames).map((name) => {
      const leftCookie = leftItem.cookies.find((c) => c.name === name)
      const rightCookie = rightItem.cookies.find((c) => c.name === name)

      const isDifferent: boolean =
        (!leftCookie && !!rightCookie) ||
        (!!leftCookie && !rightCookie) ||
        (!!leftCookie &&
          !!rightCookie &&
          leftCookie.value !== rightCookie.value)

      return {
        name,
        leftValue: leftCookie?.value || '',
        rightValue: rightCookie?.value || '',
        isDifferent
      }
    })
  }

  const compareResults = compareCookies()

  const highlightDifferences = (
    leftStr: string,
    rightStr: string
  ): { leftHighlighted: string; rightHighlighted: string } => {
    // Split cookies while preserving original order
    const leftCookies = leftStr
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
    const rightCookies = rightStr
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)

    // Parse main cookies
    const parseCookie = (cookie: string): { name: string; value: string } => {
      const equalsIndex = cookie.indexOf('=')
      if (equalsIndex === -1) {
        return { name: cookie, value: '' }
      }
      return {
        name: cookie.substring(0, equalsIndex).trim(),
        value: cookie.substring(equalsIndex + 1).trim()
      }
    }

    // Parse sub-cookies (parameters within a cookie value)
    const parseSubCookies = (value: string): Map<string, string> => {
      const subCookieMap = new Map<string, string>()

      // If the value contains & characters, it might have sub-cookies
      if (value.includes('&')) {
        const subCookies = value.split('&')
        for (const subCookie of subCookies) {
          const equalsIndex = subCookie.indexOf('=')
          if (equalsIndex !== -1) {
            const name = subCookie.substring(0, equalsIndex).trim()
            const value = subCookie.substring(equalsIndex + 1).trim()
            subCookieMap.set(name, value)
          } else {
            // Handle case where there's no equals sign
            subCookieMap.set(subCookie, '')
          }
        }
      }

      return subCookieMap
    }

    // Process left cookies
    const leftHighlighted = leftCookies.map((cookie) => {
      const { name, value } = parseCookie(cookie)
      const rightCookieValue = rightCookies
        .map(parseCookie)
        .find((c) => c.name === name)?.value

      // If cookie doesn't exist in right side or has no value
      if (rightCookieValue === undefined) {
        return `<span class="bg-green-100 dark:bg-green-900 px-1 rounded">${name}=${value}</span>`
      }

      // If values are identical, return as is
      if (value === rightCookieValue) {
        return `${name}=${value}`
      }

      // If the cookie value doesn't contain & characters, highlight the whole value
      if (!value.includes('&') || !rightCookieValue.includes('&')) {
        return `${name}=<span class="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">${value}</span>`
      }

      // Parse sub-cookies for more precise comparison
      const leftSubCookies = parseSubCookies(value)
      const rightSubCookies = parseSubCookies(rightCookieValue)

      // Reconstruct the value with highlighting for changed sub-cookies
      const subCookieParts = value.split('&').map((part) => {
        const subEqualsIndex = part.indexOf('=')
        if (subEqualsIndex === -1) return part

        const subName = part.substring(0, subEqualsIndex).trim()
        const subValue = part.substring(subEqualsIndex + 1).trim()

        // Check if this sub-cookie exists in right side with different value
        if (!rightSubCookies.has(subName)) {
          return `<span class="bg-green-100 dark:bg-green-900 px-1 rounded">${part}</span>`
        } else if (rightSubCookies.get(subName) !== subValue) {
          return `${subName}=<span class="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">${subValue}</span>`
        }

        return part
      })

      return `${name}=${subCookieParts.join('&')}`
    })

    // Process right cookies
    const rightHighlighted = rightCookies.map((cookie) => {
      const { name, value } = parseCookie(cookie)
      const leftCookieValue = leftCookies
        .map(parseCookie)
        .find((c) => c.name === name)?.value

      // If cookie doesn't exist in left side or has no value
      if (leftCookieValue === undefined) {
        return `<span class="bg-green-100 dark:bg-green-900 px-1 rounded">${name}=${value}</span>`
      }

      // If values are identical, return as is
      if (value === leftCookieValue) {
        return `${name}=${value}`
      }

      // If the cookie value doesn't contain & characters, highlight the whole value
      if (!value.includes('&') || !leftCookieValue.includes('&')) {
        return `${name}=<span class="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">${value}</span>`
      }

      // Parse sub-cookies for more precise comparison
      const rightSubCookies = parseSubCookies(value)
      const leftSubCookies = parseSubCookies(leftCookieValue)

      // Reconstruct the value with highlighting for changed sub-cookies
      const subCookieParts = value.split('&').map((part) => {
        const subEqualsIndex = part.indexOf('=')
        if (subEqualsIndex === -1) return part

        const subName = part.substring(0, subEqualsIndex).trim()
        const subValue = part.substring(subEqualsIndex + 1).trim()

        // Check if this sub-cookie exists in left side with different value
        if (!leftSubCookies.has(subName)) {
          return `<span class="bg-green-100 dark:bg-green-900 px-1 rounded">${part}</span>`
        } else if (leftSubCookies.get(subName) !== subValue) {
          return `${subName}=<span class="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">${subValue}</span>`
        }

        return part
      })

      return `${name}=${subCookieParts.join('&')}`
    })

    return {
      leftHighlighted: leftHighlighted.join(';\n'),
      rightHighlighted: rightHighlighted.join(';\n')
    }
  }

  const handleCopyCookie = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Set this specific item as copied
      setCopiedItems((prev) => ({ ...prev, [id]: true }))

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    })
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <h2 className="text-xl font-semibold">Cookie Compare</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left side selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Left Side</h3>
          <Select
            value={leftSource}
            onValueChange={(value: CompareSource) => {
              setLeftSource(value)
              setLeftItemId('')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Cookies</SelectItem>
              <SelectItem value="history" disabled={historyItems.length === 0}>
                History
              </SelectItem>
              <SelectItem value="saved" disabled={savedItems.length === 0}>
                Saved Cookies
              </SelectItem>
            </SelectContent>
          </Select>

          {leftSource !== 'current' && (
            <Select value={leftItemId} onValueChange={setLeftItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {leftSource === 'history' &&
                  historyItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {new Date(Number.parseInt(item.id)).toLocaleString()}
                    </SelectItem>
                  ))}
                {leftSource === 'saved' &&
                  savedItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Right side selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Right Side</h3>
          <Select
            value={rightSource}
            onValueChange={(value: CompareSource) => {
              setRightSource(value)
              setRightItemId('')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Cookies</SelectItem>
              <SelectItem value="history" disabled={historyItems.length === 0}>
                History
              </SelectItem>
              <SelectItem value="saved" disabled={savedItems.length === 0}>
                Saved Cookies
              </SelectItem>
            </SelectContent>
          </Select>

          {rightSource !== 'current' && (
            <Select value={rightItemId} onValueChange={setRightItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {rightSource === 'history' &&
                  historyItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {new Date(Number.parseInt(item.id)).toLocaleString()}
                    </SelectItem>
                  ))}
                {rightSource === 'saved' &&
                  savedItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Compare results */}
      {leftItem && rightItem && (
        <div className="mt-2 flex flex-1 flex-col overflow-hidden rounded-md border">
          <div className="flex items-center justify-between bg-muted/50 p-4">
            <div>
              <span className="font-medium">Comparing:</span>
              <div className="text-sm text-muted-foreground">
                {leftItem.label} vs {rightItem.label}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>
                {compareResults.filter((r) => r.isDifferent).length} differences
              </Badge>
              <Tabs
                value={compareMode}
                onValueChange={(value: string) =>
                  setCompareMode(value as CompareMode)
                }
                className="ml-4"
              >
                <TabsList className="grid w-[180px] grid-cols-2">
                  <TabsTrigger
                    value="table"
                    className="flex items-center gap-1"
                  >
                    <TableIcon className="h-4 w-4" />
                    <span>Table</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <AlignJustify className="h-4 w-4" />
                    <span>Text</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {compareMode === 'table' ? (
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cookie Name</TableHead>
                      <TableHead>Left Value</TableHead>
                      <TableHead>Right Value</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compareResults.map((result, index) => (
                      <TableRow
                        key={index}
                        className={result.isDifferent ? 'bg-muted/30' : ''}
                      >
                        <TableCell className="font-medium">
                          {result.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {result.leftValue ? (
                              <>
                                <span
                                  className="max-w-[300px] flex-1 truncate"
                                  title={result.leftValue}
                                >
                                  {result.leftValue}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() =>
                                    handleCopyCookie(
                                      result.leftValue,
                                      `left-${index}`
                                    )
                                  }
                                  title="Copy value"
                                >
                                  {copiedItems[`left-${index}`] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <span className="italic text-muted-foreground">
                                Not present
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {result.rightValue ? (
                              <>
                                <span
                                  className="max-w-[300px] flex-1 truncate"
                                  title={result.rightValue}
                                >
                                  {result.rightValue}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() =>
                                    handleCopyCookie(
                                      result.rightValue,
                                      `right-${index}`
                                    )
                                  }
                                  title="Copy value"
                                >
                                  {copiedItems[`right-${index}`] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <span className="italic text-muted-foreground">
                                Not present
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.isDifferent ? (
                            <Badge
                              variant="destructive"
                              className="hover:no-underline"
                            >
                              Different
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="hover:no-underline"
                            >
                              Same
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="grid h-full grid-cols-2 divide-x">
                {leftItem &&
                  rightItem &&
                  (() => {
                    const { leftHighlighted, rightHighlighted } =
                      highlightDifferences(
                        leftItem.originCookieString,
                        rightItem.originCookieString
                      )

                    return (
                      <>
                        <div className="h-full overflow-auto p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                              {leftItem.label}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleCopyCookie(
                                  leftItem.originCookieString,
                                  leftItem.label
                                )
                              }
                              title="Copy all cookies"
                            >
                              {copiedItems[leftItem.label] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="whitespace-pre-wrap break-all font-mono text-sm">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: leftHighlighted
                              }}
                            />
                          </div>
                        </div>
                        <div className="h-full overflow-auto p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                              {rightItem.label}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleCopyCookie(
                                  rightItem.originCookieString,
                                  rightItem.label
                                )
                              }
                              title="Copy all cookies"
                            >
                              {copiedItems[rightItem.label] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="whitespace-pre-wrap break-all font-mono text-sm">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: rightHighlighted
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )
                  })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
