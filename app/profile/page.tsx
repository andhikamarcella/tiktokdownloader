'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [selected, setSelected] = useState<string[]>([])

  const fetchProfile = async () => {
    setLoading(true)
    const res = await fetch('/api/tiktok/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    const data = await res.json()
    setProfile(data)
    setSelected(data.videos.map((v: any) => v.id))
    setLoading(false)
  }

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Bulk download profile videos</p>
          <h1 className="text-3xl font-bold">Profile tools</h1>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10 flex gap-3 items-center">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Profile URL" className="flex-1 bg-transparent" />
        <button onClick={fetchProfile} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Fetch
        </button>
      </div>

      {profile && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <img src={profile.avatar} className="w-14 h-14 rounded-full" />
            <div>
              <p className="font-semibold">{profile.nickname}</p>
              <p className="text-xs text-slate-400">{profile.username}</p>
              <p className="text-xs text-slate-400">Followers: {profile.followers.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {profile.videos.map((video: any) => (
              <label key={video.id} className="glass neu p-3 rounded-xl flex gap-3 cursor-pointer">
                <input type="checkbox" checked={selected.includes(video.id)} onChange={() => toggle(video.id)} />
                <div className="space-y-1">
                  <img src={video.cover} className="w-full rounded-lg" />
                  <p className="text-sm">{video.title}</p>
                  <p className="text-xs text-slate-400">{video.url}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold">Download selected ({selected.length})</button>
            <button className="px-4 py-2 rounded-xl bg-white/10">Download all</button>
          </div>
        </div>
      )}
    </div>
  )
}
