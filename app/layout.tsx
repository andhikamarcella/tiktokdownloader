import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import Navigation from '../components/Navigation'

export const metadata: Metadata = {
  title: 'TikTok Downloader Pro',
  description: 'Download TikTok videos without watermark, audio only, AI tools, and cloud save.',
  metadataBase: new URL('https://tiktokdownloader.local')
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.2),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.15),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.18),transparent_30%)]" />
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <Navigation />
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
