import Header from '@/components/layout/header'
import '@/styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Inspector',
  description: 'A Color Converter Tool'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" />
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
