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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ParsedCookie } from '@/types/cookie'
import { Check, Copy, Eye, RotateCcw, Search, Trash2, X } from 'lucide-react'
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { CookieContext } from '../context/cookie-context'

// Define the CookieHistoryEntry type
interface CookieHistoryEntry {
  id: string
  timestamp: number
  originCookieString: string
  parsedCookies: ParsedCookie[]
}

export default function CookieHistory(props: {
  setActiveTab: Dispatch<SetStateAction<string>>
}) {
  const { setActiveTab } = props
  const { history, clearHistory, setOriginCookieString, setParsedCookies } =
    useContext(CookieContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntry, setPreviewEntry] = useState<CookieHistoryEntry | null>(
    null
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Filter history based on search term
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history

    const term = searchTerm.toLowerCase()
    return history.filter((entry) => {
      // Search in cookie string
      if (entry.originCookieString.toLowerCase().includes(term)) return true

      // Search in cookie names and values
      return entry.parsedCookies.some(
        (cookie) =>
          cookie.name.toLowerCase().includes(term) ||
          cookie.value.toLowerCase().includes(term)
      )
    })
  }, [history, searchTerm])

  // Update the handleRestore function to switch to the parser tab
  const handleRestore = (entry: CookieHistoryEntry) => {
    setOriginCookieString(entry.originCookieString)
    setParsedCookies(entry.parsedCookies)
    // Switch to the parser tab
    setActiveTab('parser')
  }

  const handlePreview = (entry: CookieHistoryEntry) => {
    setPreviewEntry(entry)
    setPreviewOpen(true)
  }

  const handleClearHistory = () => {
    setDeleteConfirmOpen(true)
  }

  const confirmClearHistory = () => {
    clearHistory()
    setDeleteConfirmOpen(false)
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

  // Clear search when component unmounts or when history changes
  useEffect(() => {
    return () => setSearchTerm('')
  }, [history])

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cookie History</h2>
        {history.length > 0 && (
          <Button variant="destructive" onClick={handleClearHistory} size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Clear History</span>
            <span className="inline sm:hidden">Clear</span>
          </Button>
        )}
      </div>

      {history.length > 0 && (
        <div className="relative">
          <Input
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
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

      {history.length === 0 ? (
        <div className="flex-1 rounded-md border bg-muted/10 py-8 text-center text-muted-foreground">
          No cookie history yet. Parse some cookies to see them here.
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex-1 rounded-md border bg-muted/10 py-8 text-center text-muted-foreground">
          No results found for {searchTerm}.
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Cookies</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={selectedEntry === entry.id ? 'bg-muted/30' : ''}
                  onClick={() => setSelectedEntry(entry.id)}
                >
                  <TableCell className="whitespace-nowrap">
                    {formatDate(entry.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[500px] flex-wrap gap-1 overflow-hidden truncate">
                      {entry.parsedCookies.slice(0, 3).map((cookie) => (
                        <Badge key={cookie.id} variant="outline">
                          {cookie.name.length > 55
                            ? `${cookie.name.substring(0, 55)}...`
                            : cookie.name}
                        </Badge>
                      ))}
                      {entry.parsedCookies.length > 3 && (
                        <Badge variant="outline">
                          +{entry.parsedCookies.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 max-w-[500px] truncate text-xs text-muted-foreground">
                      {entry.originCookieString.length > 60
                        ? `${entry.originCookieString.substring(0, 60)}...`
                        : entry.originCookieString}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(entry)}
                        title="Preview cookies"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(entry)}
                        title="Restore these cookies"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Cookie Preview</DialogTitle>
            <DialogDescription>
              {previewEntry && formatDate(previewEntry.timestamp)}
            </DialogDescription>
          </DialogHeader>

          {previewEntry && (
            <div className="flex-1 space-y-4 overflow-hidden py-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Cookie String</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyCookie(
                        previewEntry.originCookieString,
                        previewEntry.id
                      )
                    }
                    title="Copy cookie string"
                  >
                    {copiedItems[previewEntry.id] ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Card className="max-h-[100px] overflow-auto bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap break-all text-xs">
                    {previewEntry.originCookieString}
                  </pre>
                </Card>
              </div>

              <div className="flex-1 overflow-hidden">
                <h3 className="mb-1 text-sm font-medium">
                  Cookies ({previewEntry.parsedCookies.length})
                </h3>
                <ScrollArea className="h-[300px] rounded-md border">
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
                      {previewEntry.parsedCookies.map((cookie) => (
                        <TableRow key={cookie.id}>
                          <TableCell className="font-sm">
                            {cookie.name.length > 25
                              ? `${cookie.name.substring(0, 25)}...`
                              : cookie.name}
                          </TableCell>
                          <TableCell
                            className="font-sm truncate"
                            title={cookie.value}
                          >
                            {cookie.value.length > 25
                              ? `${cookie.value.substring(0, 25)}...`
                              : cookie.value}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="hover:no-underline"
                            >
                              {cookie.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyCookie(
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
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {previewEntry && (
              <Button
                onClick={() => {
                  handleRestore(previewEntry)
                  setPreviewOpen(false)
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="w-[90%] sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your entire cookie history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearHistory}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
