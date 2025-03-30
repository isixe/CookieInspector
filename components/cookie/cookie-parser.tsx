'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { CookieType, ParsedCookie, SavedCookieEntry } from '@/types/cookie'
import { getStringType, getTypeColor } from '@/utils/stringType'
import { Check, ChevronDown, ChevronUp, Copy, Save, Trash2 } from 'lucide-react'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { CookieContext } from '../context/cookie-context'

export default function CookieParser() {
  const {
    originCookieString,
    setOriginCookieString,
    parsedCookies,
    setParsedCookies,
    savedCookies,
    setSavedCookies,
    selectedCookies,
    setSelectedCookies,
    updateOneSubCookie,
    deleteOneCookie
  } = useContext(CookieContext)

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [cookieName, setCookieName] = useState('')
  const [cookieTags, setCookieTags] = useState('')
  const [cookieDescription, setCookieDescription] = useState('')
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [copyClicked, setCopyClicked] = useState(false)

  const parseSubValues = useCallback(
    (value: string): { name: string; value: string; type: CookieType }[] => {
      if (value.includes('&') && value.includes('=')) {
        return value
          .split('&')
          .map((pair) => {
            const [name, ...valueParts] = pair.split('=')
            const subValue = valueParts.join('=').trim()
            return {
              name: name.trim(),
              value: subValue,
              type: getStringType(subValue)
            }
          })
          .filter((pair) => pair.name)
      }

      return []
    },
    []
  )

  const parseCookieString = useCallback(
    (str: string): ParsedCookie[] => {
      if (!str) {
        return []
      }

      return str
        .split(';')
        .map((cookie) => cookie.trim())
        .filter((cookie) => cookie)
        .map((cookie, index) => {
          const [name, ...valueParts] = cookie.split('=')
          const value = valueParts.join('=') // Rejoin in case value contains = characters

          const id = `cookie-${index}-${Date.now()}`
          const type = getStringType(value)

          // Check if the value contains key-value pairs
          const subValues = parseSubValues(cookie)

          return {
            id,
            name: name.trim(),
            value: value || '',
            type,
            subValues: subValues.length > 0 ? subValues : []
          }
        })
    },
    [parseSubValues]
  )

  // Parse cookies whenever the cookie string changes
  useEffect(() => {
    if (originCookieString.trim() === '') {
      setParsedCookies([])
      return
    }

    const cookies = parseCookieString(originCookieString)
    setParsedCookies(cookies)
  }, [originCookieString, setParsedCookies, parseCookieString])

  const handleCheckboxChange = (id: string) => {
    setSelectedCookies((prev: string[]) => {
      if (prev.includes(id)) {
        return prev.filter((cookieId: string) => cookieId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedCookies.length === parsedCookies.length) {
      setSelectedCookies([])
    } else {
      setSelectedCookies(parsedCookies.map((cookie) => cookie.id))
    }
  }

  // Update the handleValueChange function to handle sub-value updates
  const handleValueChange = (
    id: string,
    newValue: string,
    subValueIndex?: number,
    subValueName?: string,
    newSubValues?: ParsedCookie[]
  ) => {
    updateOneSubCookie(id, newValue, subValueIndex, subValueName, newSubValues)
  }

  const handleCopyCookies = () => {
    const textToCopy = getSelectedCookiesString()
    if (!textToCopy) {
      return
    }

    navigator.clipboard.writeText(textToCopy)
    setCopyClicked(true)
    setTimeout(() => setCopyClicked(false), 2000)
  }

  const handleSaveConfirm = () => {
    if (!cookieName.trim()) {
      return
    }

    const tagsList =
      cookieTags.length > 0
        ? cookieTags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '')
        : []

    saveOneCookieRecord(cookieName, tagsList, cookieDescription)

    // Reset form
    setCookieName('')
    setCookieTags('')
    setCookieDescription('')
    setSaveDialogOpen(false)
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  /**
   * Get parsed cookies array filtered by selected
   * @namespace [cookie context]
   */
  const getSelectedParsedCookiesArray = useCallback(() => {
    if (selectedCookies.length === 0) {
      return parsedCookies
    }
    return parsedCookies.filter((cookie) => selectedCookies.includes(cookie.id))
  }, [parsedCookies, selectedCookies])

  /**
   * Get cookie string from selected cookies array
   * @namespace [cookie context]
   */
  const getSelectedCookiesString = useCallback(() => {
    const selectedParsedCookiesArray = getSelectedParsedCookiesArray()
    const selectedCookiesString = selectedParsedCookiesArray
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join(';')
    return selectedCookiesString
  }, [getSelectedParsedCookiesArray])

  /**
   * Save cookies record form parsed cookies
   * @param name saving cookie record name
   * @param tags record tags
   * @namespace cookies parser
   */
  const saveOneCookieRecord = (
    name: string,
    tags: string[],
    description: string
  ) => {
    const originOrSelectedCookieString = getSelectedCookiesString()
    const selectedParsedCookiesArray = getSelectedParsedCookiesArray()

    const newSavedCookie: SavedCookieEntry = {
      id: Date.now().toString(),
      name,
      timestamp: Date.now(),
      originCookieString: originOrSelectedCookieString,
      parsedCookies: selectedParsedCookiesArray,
      tags,
      description
    }

    setSavedCookies([...savedCookies, newSavedCookie])
  }
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Cookie Parser</h2>
        <div className="relative">
          <Textarea
            id="cookie-input"
            placeholder="Enter your cookie string here (e.g. name=value; name2=value2)"
            value={originCookieString}
            onChange={(e) => setOriginCookieString(e.target.value)}
            className="max-h-[150px] min-h-[80px] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {originCookieString.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {originCookieString.length} characters
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="border-gray-800 text-sm"
            onClick={() => handleCopyCookies()}
            disabled={parsedCookies.length === 0}
          >
            {copyClicked ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Copy</span>
            <span className="inline sm:hidden">Copy</span>
            {selectedCookies.length > 0 && (
              <span className="hidden sm:inline"> Selected</span>
            )}
          </Button>
          <Button
            onClick={() => setSaveDialogOpen(true)}
            disabled={parsedCookies.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />

            {!selectedCookies.length && (
              <>
                <span className="hidden sm:inline">Save Cookies</span>
                <span className="inline sm:hidden">Save Cookies</span>
              </>
            )}
            {selectedCookies.length > 0 && (
              <>
                <span className="hidden sm:inline">
                  Save {selectedCookies.length} Cookies
                </span>
                <span className="inline sm:hidden">
                  Save {selectedCookies.length} Cookies
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
      {parsedCookies.length > 0 ? (
        <div className="flex-1 overflow-hidden rounded-md border">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedCookies.length === parsedCookies.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-1/4">Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedCookies.map((cookie) => (
                  <React.Fragment key={cookie.id}>
                    <TableRow key={cookie.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCookies.includes(cookie.id)}
                          onCheckedChange={() =>
                            handleCheckboxChange(cookie.id)
                          }
                        />
                      </TableCell>
                      <TableCell
                        className="max-w-[150px] truncate font-medium"
                        title={cookie.name}
                      >
                        {cookie.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={cookie.value}
                            onChange={(e) =>
                              handleValueChange(cookie.id, e.target.value)
                            }
                            className="text-sm"
                          />
                          {cookie.subValues && cookie.subValues.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(cookie.id)}
                            >
                              {expandedRows[cookie.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(cookie.type)}>
                          {cookie.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOneCookie(cookie.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {cookie.subValues && expandedRows[cookie.id] && (
                      <TableRow key={`${cookie.id}-expanded`}>
                        <TableCell colSpan={5}>
                          <div className="rounded-md bg-muted/50 py-2 pl-10">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-1/4">
                                    Sub Name
                                  </TableHead>
                                  <TableHead>Value</TableHead>
                                  <TableHead className="w-[80px]">
                                    Type
                                  </TableHead>
                                  <TableHead className="w-[60px]">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {cookie.subValues.map((subValue, index) => (
                                  <TableRow key={`${cookie.id}-sub-${index}`}>
                                    <TableCell
                                      className="max-w-[150px] truncate"
                                      title={subValue.name}
                                    >
                                      {subValue.name}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={subValue.value}
                                        onChange={(e) =>
                                          handleValueChange(
                                            cookie.id,
                                            e.target.value,
                                            index,
                                            subValue.name
                                          )
                                        }
                                        className="w-full text-sm"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={getTypeColor(subValue.type)}
                                      >
                                        {subValue.type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updatedCookie =
                                            parsedCookies.find(
                                              (c) => c.id === cookie.id
                                            )
                                          if (
                                            updatedCookie &&
                                            updatedCookie.subValues
                                          ) {
                                            const newSubValues = [
                                              ...updatedCookie.subValues
                                            ]
                                            newSubValues.splice(index, 1)
                                            updateOneSubCookie(
                                              cookie.id,
                                              cookie.value,
                                              undefined,
                                              undefined,
                                              newSubValues
                                            )
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 rounded-md border bg-muted/10 py-8 text-center text-muted-foreground">
          No cookies to display. Enter a cookie string to get started.
        </div>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Cookies</DialogTitle>
            <DialogDescription>
              {selectedCookies.length > 0
                ? `Saving ${selectedCookies.length} selected cookies.`
                : 'Saving all cookies.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cookie-save-name">Name</Label>
              <Input
                id="cookie-save-name"
                placeholder="e.g., Login Cookies"
                value={cookieName}
                onChange={(e) => setCookieName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookie-save-tags">Tags (comma separated)</Label>
              <Input
                id="cookie-save-tags"
                placeholder="e.g., login, production, test"
                value={cookieTags}
                onChange={(e) => setCookieTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookie-save-description">Description</Label>
              <Textarea
                id="cookie-save-description"
                placeholder="Add some notes about these cookies"
                value={cookieDescription}
                onChange={(e) => setCookieDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm} disabled={!cookieName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
