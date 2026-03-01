import '@/styles/globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host') || 'localhost:3000'
  const url = `${protocol}://${host}`

  return {
    title: 'Cookie Inspector',
    keywords:
      'cookie check, cookie checker, cookie parser, cookie manager, cookie inspector, cookie tool',
    description:
      'A tool for inspecting, parsing, and managing browser cookies.',
    alternates: {
      canonical: url
    },
    openGraph: {
      title: 'Cookie Inspector',
      description:
        'A tool for inspecting, parsing, and managing browser cookies.',
      url,
      siteName: 'Cookie Inspector',
      locale: 'en',
      type: 'website',
      images: `${url}/og-image.png`
    }
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const analyticsScript = process.env.ANALYTICS_SCRIPT || ''

  return (
    <html lang="en">
      <head>
        {analyticsScript ? (
          <Script
            src={analyticsScript}
            id="analytics"
            data-website-id="cookie-inspector"
            defer
          />
        ) : null}

        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
