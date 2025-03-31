'use client'

import { SettingContext } from '@/components/context/setting-context'
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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { CookieContext } from '../context/cookie-context'

export default function CookieSetting() {
  const { setting, updateSetting } = useContext(SettingContext)
  const [historyLimit, setHistoryLimit] = useState(
    setting.historyLimit.toString()
  )
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const {
    clearHistory,
    setOriginCookieString,
    setParsedCookies,
    clearSavedCookies
  } = useContext(CookieContext)

  useEffect(() => {
    setHistoryLimit(setting.historyLimit.toString())
  }, [setting.historyLimit])

  const handleSave = () => {
    const limit = Number.parseInt(historyLimit)
    if (!isNaN(limit) && limit > 0) {
      updateSetting({ historyLimit: limit })
    } else {
      // Reset to current setting if invalid
      setHistoryLimit(setting.historyLimit.toString())
    }
  }

  const handleResetAllData = () => {
    // Clear all data
    clearHistory()
    clearSavedCookies()
    setOriginCookieString('')
    setParsedCookies([])

    // Close the dialog
    setResetConfirmOpen(false)
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <ScrollArea className="flex-1">
        <div className="space-y-8">
          <Card className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-md font-medium">About</h3>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Cookie Inspector Tool v1.0.0
                <br />A tool for inspecting, parsing, and managing browser
                cookies.
              </p>
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-md font-medium">History</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="history-limit">Maximum history entries</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="history-limit"
                    type="number"
                    min="1"
                    value={historyLimit}
                    onChange={(e) => setHistoryLimit(e.target.value)}
                    onBlur={() => handleSave()}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="w-28 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <span className="text-sm text-muted-foreground">entries</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Limit the number of cookie history entries to save. Default is
                  300.
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 border-destructive/50 p-4">
            <div className="space-y-2">
              <h3 className="text-md font-medium text-destructive">
                Danger Zone
              </h3>
              <Separator className="bg-destructive/20" />

              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                <p className="text-sm text-muted-foreground">
                  Reset all application data. This will clear all saved cookies,
                  history, and current cookies.
                </p>
                <div className="flex md:justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => setResetConfirmOpen(true)}
                    className="w-full md:w-40"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>

      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your saved cookies, history, and
              current cookies. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
