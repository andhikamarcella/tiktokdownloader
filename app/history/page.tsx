'use client'

import { useEffect, useState } from 'react'
import { Clipboard, Check, History, Trash2 } from 'lucide-react'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('tt-history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const clear = () => {
    localStorage.removeItem('tt-history')
    setHistory([])
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      setTimeout(() => setCopied(null), 1500)
    } catch (err) {
      console.error('Failed to copy link', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Local only</p>
          <h1 className="text-3xl font-bold">Smart history</h1>
        </div>
        <button onClick={clear} className="ml-auto px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2 text-sm">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((item) => (
          <div key={item.ts} className="glass neu p-3 rounded-xl text-sm space-y-2">
            <img src={item.thumb} className="w-full rounded-lg" alt={item.caption} />
            <p className="line-clamp-2">{item.caption}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400 break-all">
              <span className="flex-1">{item.url}</span>
              <button
                onClick={() => copyLink(item.url)}
                className="p-2 rounded-lg bg-white/5 border border-white/10"
                aria-label="Copy link"
              >
                {copied === item.url ? <Check className="w-4 h-4 text-emerald-300" /> : <Clipboard className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
