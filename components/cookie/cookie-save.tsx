'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import type { CookieType, ParsedCookie, SavedCookieEntry } from '@/types/cookie'
import { getStringType, getTypeColor } from '@/utils/stringType'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  Eye,
  PlusCircle,
  Search,
  Trash2,
  X
} from 'lucide-react'
import React, {
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { CookieContext } from '../context/cookie-context'

// Optimize the Saved Cookies component layout
export default function SavedCookies(props: {
  setActiveTab: Dispatch<SetStateAction<string>>
}) {
  const { setActiveTab } = props
  const {
    savedCookies,
    deleteOneSavedCookie,
    appendCookieString,
    updateOneSavedCookie
  } = useContext(CookieContext)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedCookie, setSelectedCookie] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [cookieToDelete, setCookieToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Add state for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [cookieEditId, setCookieEditId] = useState<string>('')
  const [editName, setEditName] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCookieString, setEditCookieString] = useState('')
  const [editParsedCookies, setEditParsedCookies] = useState<ParsedCookie[]>([])

  const [selectedCookiesEntry, setSelectedCookiesEntry] = useState<
    SavedCookieEntry | null | undefined
  >(null)

  useEffect(() => {
    const selectedCookieData = selectedCookie
      ? savedCookies.find((cookie) => cookie.id === selectedCookie)
      : null
    setSelectedCookiesEntry(selectedCookieData)
  }, [savedCookies, selectedCookie])

  useEffect(() => {
    if (!editDialogOpen) {
      // Reset form values when dialog closes without saving
      setCookieEditId('')
      setEditName('')
      setEditTags('')
      setEditDescription('')
      setEditCookieString('')
      setEditParsedCookies([])
      return
    }

    if (cookieEditId) {
      // Load values when dialog opens
      const cookieEntry = savedCookies.find(
        (cookie) => cookie.id === cookieEditId
      )
      if (cookieEntry) {
        setEditName(cookieEntry.name)
        setEditTags(cookieEntry.tags.join(','))
        setEditDescription(cookieEntry.description || '')
        setEditCookieString(cookieEntry.originCookieString)
        setEditParsedCookies([...cookieEntry.parsedCookies])
      }
    }
  }, [editDialogOpen, cookieEditId, savedCookies])

  // Filter saved cookies based on search term
  const filteredCookies = useMemo(() => {
    if (!searchTerm.trim()) {
      return savedCookies
    }

    const term = searchTerm.toLowerCase()
    return savedCookies.filter((cookie) => {
      // Search in name
      if (cookie.name.toLowerCase().includes(term)) {
        return true
      }

      // Search in tags
      if (cookie.tags.some((tag) => tag.toLowerCase().includes(term))) {
        return true
      }

      // Search in description
      if (
        cookie.description &&
        cookie.description.toLowerCase().includes(term)
      ) {
        return true
      }

      // Search in cookie string
      if (cookie.originCookieString.toLowerCase().includes(term)) {
        return true
      }

      // Search in cookie names and values
      return cookie.parsedCookies.some(
        (cookie) =>
          cookie.name.toLowerCase().includes(term) ||
          cookie.value.toLowerCase().includes(term)
      )
    })
  }, [savedCookies, searchTerm])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Update the handleAppend function to switch to the parser tab
  const handleAppend = (entry: SavedCookieEntry) => {
    appendCookieString(entry.originCookieString)
    // Switch to the parser tab
    setActiveTab('parser')
  }

  const handleShowDetails = (id: string) => {
    setSelectedCookie(id)
    setDetailsOpen(true)
  }

  const handleOneRecordDeleteClick = (id: string) => {
    setCookieToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (cookieToDelete) {
      deleteOneSavedCookie(cookieToDelete)
      setCookieToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Helper function for copy button feedback
  const handleCopyCookies = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItems((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => {
      setCopiedItems((prev) => ({ ...prev, [id]: false }))
    }, 2000)
  }

  // Add function to handle edit button click
  const handleEditClick = (entry: SavedCookieEntry) => {
    setCookieEditId(entry.id)
    setEditName(entry.name)
    setEditTags(entry.tags.join(','))
    setEditDescription(entry.description || '')
    setEditCookieString(entry.originCookieString)
    setEditParsedCookies(entry.parsedCookies)
    setEditDialogOpen(true)
  }

  // Add function to handle edit confirmation
  const handleEditConfirm = () => {
    if (!editName.trim() || !cookieEditId) {
      return
    }

    const cookieEntry = savedCookies.find(
      (cookie) => cookie.id === cookieEditId
    )

    if (!cookieEntry) {
      return
    }

    const editTagsList =
      editTags.length > 0
        ? editTags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '')
        : []

    updateOneSavedCookie(
      cookieEditId,
      editName,
      editTagsList,
      editCookieString,
      editParsedCookies,
      editDescription
    )

    // Reset form and close dialog
    setEditDialogOpen(false)
  }

  const preUpdateEditCookieString = (value: string) => {
    setEditCookieString(value)
    // Parse the cookie string and update the parsed cookies state
    const parsed: ParsedCookie[] = value.split(';').map((cookie, index) => {
      const name = cookie.split('=')[0]
      const value = cookie.substring(cookie.indexOf('=') + 1)

      let subValues: { name: string; value: string; type: CookieType }[] = []
      if (cookie.indexOf('&') > 0) {
        subValues = cookie
          .split('&')
          .map((subCookie) => {
            const [name, value] = subCookie.split('=')
            if (name) {
              return {
                name,
                value,
                type: getStringType(value)
              }
            }
          })
          .filter((subValue) => subValue !== undefined)
      }

      return {
        id: `${cookieEditId}-row-${index}`,
        name: name || '',
        value: value || '',
        type: getStringType(value),
        subValues
      }
    })
    setEditParsedCookies(parsed)
  }

  const preUpdateEditRowCookieValue = (rowId: string, value: string) => {
    const cookieString = editParsedCookies
      .map((row) => {
        if (row.id === rowId) {
          return `${row.name}=${value}`
        }
        return `${row.name}=${row.value}`
      })
      .join(';')

    // Update cookie string when individual cookie value changes
    setEditCookieString(cookieString)

    const parsedCookie: ParsedCookie[] = cookieString
      .split(';')
      .map((rowCookie, index) => {
        const name = rowCookie.split('=')[0]
        const value = rowCookie.substring(rowCookie.indexOf('=') + 1)

        let subValues: { name: string; value: string; type: CookieType }[] = []
        if (rowCookie.indexOf('&') > 0) {
          subValues = rowCookie
            .split('&')
            .map((subCookie) => {
              const [name, value] = subCookie.split('=')
              if (name) {
                return {
                  name,
                  value,
                  type: getStringType(value)
                }
              }
            })
            .filter((subValue) => subValue !== undefined)
        }

        return {
          id: `${cookieEditId}-row-${index}`,
          name: name || '',
          value: value || '',
          type: getStringType(value),
          subValues
        }
      })

    setEditParsedCookies(parsedCookie)
  }

  const preDeleteEditRowCookie = (rowId: string) => {
    const newParsedCookies = editParsedCookies.filter((row) => row.id !== rowId)
    setEditParsedCookies(newParsedCookies)
    const newCookieString = newParsedCookies
      .map((row) => `${row.name}=${row.value}`)
      .join(';')
    setEditCookieString(newCookieString)
  }

  const preUpdateEditOneSubCookieValue = (
    id: string,
    newSubValue: string,
    subValueIndex: number
  ) => {
    const updatedCookies = editParsedCookies.map((cookie) => {
      if (cookie.id !== id) {
        return cookie
      }

      // Update a sub-value
      let originParsedSubValues = cookie.subValues?.map((subValue, index) => {
        if (index == subValueIndex) {
          return {
            ...subValue,
            value: newSubValue,
            type: getStringType(newSubValue)
          }
        }
        return subValue
      })

      let subValuesString =
        originParsedSubValues
          ?.map((subValue) => `${subValue.name}=${subValue.value}`)
          .join('&') || ''

      if (subValueIndex !== 0 && !subValuesString.length) {
        subValuesString = cookie.value
      }

      if (subValueIndex === 0 && subValuesString.length === 1) {
        toggleRowExpansion(id)
        originParsedSubValues = []
      }

      subValuesString = subValuesString.substring(
        subValuesString.indexOf('=') + 1
      )

      return {
        ...cookie,
        name: originParsedSubValues[0]?.name || cookie.name,
        value: subValuesString,
        subValues: originParsedSubValues
      }
    })

    // Update the edit cookie
    setEditParsedCookies(updatedCookies)
    const newCookieString = updatedCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join(';')
    setEditCookieString(newCookieString)
  }

  const preDeleteEditOneSubCookie = (id: string, subValueIndex: number) => {
    const updatedCookies = editParsedCookies.map((cookie) => {
      if (cookie.id !== id) {
        return cookie
      }

      // Update a sub-value
      let originParsedSubValues = cookie.subValues?.filter(
        (_, index) => index !== subValueIndex
      )

      let subValuesString =
        originParsedSubValues
          ?.map((subValue) => `${subValue.name}=${subValue.value}`)
          .join('&') || ''

      if (subValueIndex !== 0 && !subValuesString.length) {
        subValuesString = cookie.value
      }

      if (!subValuesString) {
        toggleRowExpansion(id)
      }

      if (subValueIndex === 0 && subValuesString.length === 1) {
        toggleRowExpansion(id)
        originParsedSubValues = []
      }

      subValuesString = subValuesString.substring(
        subValuesString.indexOf('=') + 1
      )

      return {
        ...cookie,
        name: originParsedSubValues[0]?.name || cookie.name,
        value: subValuesString,
        subValues: originParsedSubValues
      }
    })

    // Update the edit cookie
    setEditParsedCookies(updatedCookies)
    const newCookieString = updatedCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join(';')
    setEditCookieString(newCookieString)
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <h2 className="text-2xl font-semibold">Saved Cookies</h2>

      {savedCookies.length > 0 && (
        <div className="relative">
          <Input
            placeholder="Search saved cookies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 transform p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {savedCookies.length === 0 ? (
        <div className="flex-1 rounded-md border bg-muted/10 py-8 text-center text-muted-foreground">
          No saved cookies yet. Save some cookies to see them here.
        </div>
      ) : filteredCookies.length === 0 ? (
        <div className="flex-1 rounded-md border bg-muted/10 py-8 text-center text-muted-foreground">
          No results found for {searchTerm}.
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded-md border">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Date Saved
                  </TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCookies.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {entry.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="hover:no-underline"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No tags
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      {formatDate(entry.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAppend(entry)}
                          title="Append to current cookies"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowDetails(entry.id)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(entry)}
                          title="Edit saved cookie"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyCookies(
                              entry.originCookieString,
                              entry.id
                            )
                          }
                          title="Copy cookie string"
                          className="hidden sm:flex"
                        >
                          {copiedItems[entry.id] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOneRecordDeleteClick(entry.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="mx-auto flex max-h-[80vh] w-[90%] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCookiesEntry?.name}</DialogTitle>
            <DialogDescription>
              Saved on{' '}
              {selectedCookiesEntry &&
                formatDate(selectedCookiesEntry.timestamp)}
            </DialogDescription>
          </DialogHeader>

          {selectedCookiesEntry && (
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              <div>
                <h3 className="mb-1 text-sm font-medium">Tags</h3>
                {selectedCookiesEntry.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedCookiesEntry.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="hover:no-underline"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>

              <div>
                <h3 className="mb-1 text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCookiesEntry.description
                    ? selectedCookiesEntry.description
                    : 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Cookie String</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyCookies(
                        selectedCookiesEntry.originCookieString,
                        selectedCookiesEntry.id
                      )
                    }
                    title="Copy cookie string"
                  >
                    {copiedItems[selectedCookiesEntry.id] ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Card className="max-h-[100px] overflow-auto bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap break-all text-xs">
                    {selectedCookiesEntry.originCookieString}
                  </pre>
                </Card>
              </div>

              <div className="flex-1">
                <h3 className="mb-1 text-sm font-medium">
                  Cookies ({selectedCookiesEntry.parsedCookies.length})
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[60px]">Copy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCookiesEntry.parsedCookies.map((cookie) => (
                      <React.Fragment key={cookie.id}>
                        <TableRow key={cookie.id}>
                          <TableCell>{cookie.name}</TableCell>
                          <TableCell
                            className="max-w-[300px] truncate"
                            title={cookie.value}
                          >
                            <div className="flex items-center gap-2">
                              <span className="truncate">{cookie.value}</span>
                              {cookie.subValues &&
                                cookie.subValues.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleRowExpansion(cookie.id)
                                    }
                                    title={
                                      expandedRows[cookie.id]
                                        ? 'Hide sub-cookies'
                                        : 'Show sub-cookies'
                                    }
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
                            <Badge
                              variant="outline"
                              className={getTypeColor(cookie.type)}
                            >
                              {cookie.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyCookies(
                                  `${cookie.name}=${cookie.value}`,
                                  cookie.id
                                )
                              }
                              title={`Copy ${cookie.name}=${cookie.value}`}
                            >
                              {copiedItems[cookie.id] ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {cookie.subValues && expandedRows[cookie.id] && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0">
                              <div className="bg-muted/20 p-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-1/3">
                                        Sub Name
                                      </TableHead>
                                      <TableHead className="w-1/3">
                                        Value
                                      </TableHead>
                                      <TableHead className="w-1/6">
                                        Type
                                      </TableHead>
                                      <TableHead className="w-1/6">
                                        Copy
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {cookie.subValues.map(
                                      (subCookie, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            {subCookie.name}
                                          </TableCell>
                                          <TableCell
                                            className="max-w-[200px] truncate"
                                            title={subCookie.value}
                                          >
                                            {subCookie.value}
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant="outline"
                                              className="hover:no-underline"
                                            >
                                              {subCookie.type}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleCopyCookies(
                                                  `${subCookie.name}=${subCookie.value}`,
                                                  `subCookie-${index}`
                                                )
                                              }
                                              title={`Copy ${subCookie.name}=${subCookie.value}`}
                                            >
                                              {copiedItems[
                                                `subCookie-${index}`
                                              ] ? (
                                                <Check className="h-4 w-4" />
                                              ) : (
                                                <Copy className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
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
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedCookiesEntry && (
              <Button
                onClick={() => {
                  handleAppend(selectedCookiesEntry)
                  setDetailsOpen(false)
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Append
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
        }}
      >
        <DialogContent className="mx-auto flex max-h-[80vh] w-[90%] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Saved Cookie</DialogTitle>
            <DialogDescription>
              Update the details for this saved cookie.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            <div className="space-y-2">
              <Label htmlFor="cookie-edit-name">Name</Label>
              <Input
                id="cookie-edit-name"
                placeholder="e.g., Login Cookies"
                className="outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookie-edit-tags">Tags (comma separated)</Label>
              <Input
                id="cookie-edit-tags"
                className="outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="e.g., login, production, test"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookie-edit-description">Description</Label>
              <Textarea
                id="cookie-edit-description"
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Add some notes about these cookies"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookie-edit-string">Cookie String</Label>
              <Textarea
                id="cookie-edit-string"
                className="font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                value={editCookieString}
                onChange={(e) => preUpdateEditCookieString(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-medium">
                Individual Cookies ({editParsedCookies.length})
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editParsedCookies.map((cookie) => (
                      <React.Fragment key={cookie.id}>
                        <TableRow key={cookie.id}>
                          <TableCell>
                            {cookie.name.length > 15
                              ? `${cookie.name.substring(0, 15)}...`
                              : cookie.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                value={cookie.value || ''}
                                onChange={(e) =>
                                  preUpdateEditRowCookieValue(
                                    cookie.id,
                                    e.target.value
                                  )
                                }
                                className="h-8 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                              {cookie.subValues &&
                                cookie.subValues.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleRowExpansion(cookie.id)
                                    }
                                    title={
                                      expandedRows[cookie.id]
                                        ? 'Hide sub-values'
                                        : 'Show sub-values'
                                    }
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
                              onClick={() => {
                                preDeleteEditRowCookie(cookie.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {cookie.subValues && expandedRows[cookie.id] && (
                          <TableRow key={`${cookie.id}-expanded`}>
                            <TableCell colSpan={3} className="p-0">
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
                                      <TableRow
                                        key={`${cookie.id}-sub-${index}`}
                                      >
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
                                              preUpdateEditOneSubCookieValue(
                                                cookie.id,
                                                e.target.value,
                                                index
                                              )
                                            }
                                            className="w-full text-sm"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            className={getTypeColor(
                                              subValue.type
                                            )}
                                          >
                                            {subValue.type}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              preDeleteEditOneSubCookie(
                                                cookie.id,
                                                index
                                              )
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
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditConfirm} disabled={!editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved cookie entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
