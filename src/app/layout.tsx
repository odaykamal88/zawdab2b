import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { BRAND_NAME } from '@/lib/brand'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: `${BRAND_NAME} — MENA Regulatory Intelligence for Digital Assets`,
  description:
    'Regulatory intelligence, treasury advisory, and compliance monitoring for CFOs and compliance officers across UAE, Bahrain, Saudi Arabia, and the wider MENA region.',
  openGraph: {
    title: `${BRAND_NAME} — MENA Regulatory Intelligence`,
    description:
      'Intelligence before enforcement. Regulatory monitoring, treasury intelligence, and vendor benchmarking for MENA digital asset compliance.',
    type: 'website',
    locale: 'en_US',
    siteName: BRAND_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} — MENA Regulatory Intelligence`,
    description: 'Intelligence before enforcement. Not after.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Fonts — loaded via link tags (Turbopack doesn't support @import url in CSS) */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: BRAND_NAME,
              description:
                'MENA regulatory intelligence and treasury advisory for digital asset compliance.',
              url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zawda.com',
              sameAs: ['https://www.linkedin.com/company/zawdabtc', 'https://x.com'],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col"><ClerkProvider><Providers>{children}</Providers></ClerkProvider></body>
    </html>
  )
}
