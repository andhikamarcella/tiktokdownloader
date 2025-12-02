"use client"

import { useState } from "react"
import { Download, Loader2, CheckSquare, Square } from "lucide-react"

export default function ProfilePage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [selected, setSelected] = useState<string[]>([])

  const fetchProfile = async () => {
    setLoading(true)
    const mockVideos = Array.from({ length: 9 }).map((_, i) => ({
      id: `vid-${i + 1}`,
      title: `Clip ${i + 1} from ${url || "profile"}`,
      cover: `https://picsum.photos/seed/profile-${i}/400/700`,
      url: `${url || "https://www.tiktok.com/@demo"}/video/${i + 1}`
    }))
    const data = {
      avatar: "https://i.pravatar.cc/200?img=12",
      nickname: "Creator Nick",
      username: "@profile",
      followers: 120_000,
      videos: mockVideos
    }
    setProfile(data)
    setSelected(mockVideos.map((v) => v.id))
    setLoading(false)
  }

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (!profile) return
    setSelected((prev) => (prev.length === profile.videos.length ? [] : profile.videos.map((v: any) => v.id)))
  }

  const downloadSelected = () => {
    if (!profile) return
    const chosen = profile.videos.filter((v: any) => selected.includes(v.id))
    alert(`Prepare download for ${chosen.length} videos`) // placeholder for backend hook
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-slate-300">Bulk download profile videos</p>
          <h1 className="text-3xl font-bold">Profile tools</h1>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Profile URL"
          className="flex-1 bg-transparent px-3 py-2 rounded-xl border border-white/10"
        />
        <button onClick={fetchProfile} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2 justify-center">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Fetch
        </button>
      </div>

      {profile && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <img src={profile.avatar} className="w-14 h-14 rounded-full" alt={profile.nickname} />
            <div>
              <p className="font-semibold">{profile.nickname}</p>
              <p className="text-xs text-slate-400">{profile.username}</p>
              <p className="text-xs text-slate-400">Followers: {profile.followers.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button onClick={toggleAll} className="px-3 py-2 rounded-xl bg-white/10 flex items-center gap-2">
              {selected.length === profile.videos.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />} 
              {selected.length === profile.videos.length ? "Unselect all" : "Select all"}
            </button>
            <span className="text-slate-400">{selected.length} / {profile.videos.length} selected</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.videos.map((video: any) => (
              <label key={video.id} className="glass neu p-3 rounded-xl flex gap-3 cursor-pointer">
                <input type="checkbox" checked={selected.includes(video.id)} onChange={() => toggle(video.id)} />
                <div className="space-y-1">
                  <img src={video.cover} className="w-full rounded-lg object-cover aspect-[4/5]" alt={video.title} />
                  <p className="text-sm">{video.title}</p>
                  <p className="text-xs text-slate-400">{video.url}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={downloadSelected}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold"
            >
              Download selected ({selected.length})
            </button>
            <button onClick={toggleAll} className="px-4 py-2 rounded-xl bg-white/10">
              {selected.length === profile.videos.length ? "Clear selection" : "Select all"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
