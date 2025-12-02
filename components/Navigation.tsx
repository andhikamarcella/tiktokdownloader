'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cloud, Download, History, Image, LayoutPanelLeft, Music, Scissors, Sparkles } from 'lucide-react'

type NavigationProps = {
  isAuthed?: boolean
}

const links = [
  { href: '/downloader', label: 'Downloader', icon: Download },
  { href: '/profile', label: 'Profile bulk', icon: LayoutPanelLeft },
  { href: '/tools/trim', label: 'Trim', icon: Scissors },
  { href: '/tools/convert', label: 'Convert', icon: Image },
  { href: '/tools/instagram', label: 'Instagram', icon: Image },
  { href: '/tools/caption-ai', label: 'Caption AI', icon: Sparkles },
  { href: '/tools/thumbnail', label: 'Thumbnail', icon: Image },
  { href: '/history', label: 'History', icon: History }
]

export default function Navigation({ isAuthed = false }: NavigationProps) {
  const pathname = usePathname()
  return (
    <header className="pt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl glass neu border border-white/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-purple-300" />
          </div>
          TikTok Downloader Pro
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap justify-end w-full sm:w-auto">
          <Cloud className="w-4 h-4 hidden sm:block" />
          <span className="truncate">Edge ready · Vercel & Railway</span>
          <Link
            href={isAuthed ? '/api/auth/logout' : '/api/auth/tiktok'}
            className={`px-3 py-2 rounded-xl border border-white/10 w-full sm:w-auto text-center ${
              isAuthed
                ? 'bg-white/10 hover:bg-white/5 text-white'
                : 'bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold'
            }`}
          >
            {isAuthed ? 'Logout' : 'Login with TikTok'}
          </Link>
        </div>
      </div>
      <nav className="glass rounded-2xl px-3 sm:px-4 py-3 border border-white/10 flex flex-nowrap overflow-x-auto gap-2 scrollbar-thin">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition border border-white/10 ${
                active ? 'bg-white/10 text-white shadow-neu' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
