'use client'

import {
  FileText,
  GitCompare,
  History,
  Info,
  Save,
  Settings
} from 'lucide-react'
import { useState } from 'react'

import { CookieProvider } from '@/components/context/cookie-context'
import { SettingProvider } from '@/components/context/setting-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import CookieAbout from '@/components/cookie/cookie-about'
import CookieCompare from '@/components/cookie/cookie-compare'
import CookieHistory from '@/components/cookie/cookie-history'
import CookieParser from '@/components/cookie/cookie-parser'
import SavedCookies from '@/components/cookie/cookie-save'
import CookieSetting from '@/components/cookie/cookie-setting'

export default function Home() {
  const [activeTab, setActiveTab] = useState('parser')

  return (
    <SettingProvider>
      <CookieProvider>
        <main className="flex h-screen w-screen flex-col overflow-y-auto bg-background">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="flex h-full w-full flex-col"
          >
            <div className="flex h-full w-full flex-col sm:flex-row">
              <TabsList className="flex h-auto w-full flex-shrink-0 flex-row justify-start overflow-x-auto rounded-none border-b bg-muted/30 p-2 sm:h-full sm:w-[100px] sm:flex-col sm:justify-start sm:overflow-y-auto sm:overflow-x-hidden sm:border-r">
                <TabsTrigger
                  value="parser"
                  className="flex min-w-[60px] flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:min-w-[84px]"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Parser</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex min-w-[60px] flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:min-w-[84px]"
                >
                  <History className="h-5 w-5" />
                  <span className="text-xs">History</span>
                </TabsTrigger>
                <TabsTrigger
                  value="compare"
                  className="flex min-w-[60px] flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:min-w-[84px]"
                >
                  <GitCompare className="h-5 w-5" />
                  <span className="text-xs">Compare</span>
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="flex min-w-[60px] flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:min-w-[84px]"
                >
                  <Save className="h-5 w-5" />
                  <span className="text-xs">Saved</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex min-w-[60px] flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:min-w-[84px]"
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="flex min-w-[60px] flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:min-w-[84px]"
                >
                  <Info className="h-5 w-5" />
                  <span className="text-xs">About</span>
                </TabsTrigger>
              </TabsList>

              <div className="min-h-[calc(100vh-64px)] flex-1 overflow-auto p-4 sm:min-h-screen sm:p-6">
                <TabsContent
                  value="parser"
                  className="mt-0 h-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-48px)]"
                >
                  <CookieParser />
                </TabsContent>
                <TabsContent
                  value="history"
                  className="mt-0 h-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-48px)]"
                >
                  <CookieHistory setActiveTab={setActiveTab} />
                </TabsContent>
                <TabsContent
                  value="compare"
                  className="mt-0 h-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-48px)]"
                >
                  <CookieCompare />
                </TabsContent>
                <TabsContent
                  value="saved"
                  className="mt-0 h-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-48px)]"
                >
                  <SavedCookies setActiveTab={setActiveTab} />
                </TabsContent>
                <TabsContent
                  value="settings"
                  className="mt-0 h-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-48px)]"
                >
                  <CookieSetting />
                </TabsContent>
                <TabsContent
                  value="about"
                  className="mt-0 h-full min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-48px)]"
                >
                  <CookieAbout />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </main>
      </CookieProvider>
    </SettingProvider>
  )
}
