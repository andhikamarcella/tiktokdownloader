import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import HeroPreview from '../components/HeroPreview'

const features = [
  'No-watermark & watermark download',
  'Audio-only MP3/M4A',
  'AI caption summarizer & translator',
  'Music detection via Spotify / YT Music',
  'Reddit photo & GIF downloads',
  'Smart history stored locally',
  'Profile bulk downloads'
]

export default function HomePage() {
  return (
    <div className="glass rounded-3xl p-10 border border-white/10 mt-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        <div className="flex-1 space-y-6">
          <p className="inline-flex items-center text-sm px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" /> AI-powered TikTok toolkit
          </p>
          <h1 className="text-4xl font-bold leading-tight">Download TikTok content with studio-grade tools</h1>
          <p className="text-slate-300">Edge-first Next.js app that lets you grab videos without watermark, extract audio, enhance captions, detect music, and push to your favorite clouds in one click.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((item) => (
              <div key={item} className="glass neu p-3 rounded-xl border border-white/10 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {item}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4">
            <Link href="/downloader" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold shadow-neu">
              Launch downloader
            </Link>
            <Link href="/history" className="px-6 py-3 rounded-2xl border border-white/15 hover:border-white/40">View history</Link>
          </div>
        </div>
        <div className="flex-1 w-full">
          <HeroPreview />
        </div>
      </div>
    </div>
  )
}
