'use client'

import { FileText, GitCompare, History, Save, Settings } from 'lucide-react'
import { useState } from 'react'

import { CookieProvider } from '@/components/context/cookie-context'
import { SettingProvider } from '@/components/context/setting-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        <main className="flex h-screen w-screen flex-col overflow-hidden bg-background">
          <div>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
              className="flex h-full flex-1 flex-col"
            >
              <div className="flex h-full flex-col sm:flex-row">
                <TabsList className="flex h-auto w-full flex-shrink-0 flex-row justify-center rounded-none border-b bg-muted/30 p-2 sm:h-full sm:w-[100px] sm:flex-col sm:justify-start sm:border-r">
                  <TabsTrigger
                    value="parser"
                    className="flex w-full flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Parser</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex w-full flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <History className="h-5 w-5" />
                    <span className="text-xs">History</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="compare"
                    className="flex w-full flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <GitCompare className="h-5 w-5" />
                    <span className="text-xs">Compare</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="saved"
                    className="flex w-full flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Save className="h-5 w-5" />
                    <span className="text-xs">Saved</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex w-full flex-col items-center gap-1 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-xs">Settings</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  <TabsContent value="parser" className="mt-0 h-full">
                    <CookieParser />
                  </TabsContent>
                  <TabsContent value="history" className="mt-0 h-full">
                    <CookieHistory setActiveTab={setActiveTab} />
                  </TabsContent>
                  <TabsContent value="compare" className="mt-0 h-full">
                    <CookieCompare />
                  </TabsContent>
                  <TabsContent value="saved" className="mt-0 h-full">
                    <SavedCookies setActiveTab={setActiveTab} />
                  </TabsContent>
                  <TabsContent value="settings" className="mt-0 h-full">
                    <CookieSetting />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </main>
      </CookieProvider>
    </SettingProvider>
  )
}
