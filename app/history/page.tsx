'use client'

import { useEffect, useState } from 'react'
import { History, Trash2 } from 'lucide-react'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('tt-history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const clear = () => {
    localStorage.removeItem('tt-history')
    setHistory([])
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
      <div className="grid sm:grid-cols-3 gap-3">
        {history.map((item) => (
          <div key={item.ts} className="glass neu p-3 rounded-xl text-sm">
            <img src={item.thumb} className="w-full rounded-lg" />
            <p className="mt-2 line-clamp-2">{item.caption}</p>
            <p className="text-xs text-slate-400">{item.url}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
