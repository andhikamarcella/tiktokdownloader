import DownloaderForm from '../../components/DownloaderForm'
import InstagramDownloader from '../../components/InstagramDownloader'

export const dynamic = 'force-static'

export default function DownloaderPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm text-slate-300">Video, audio, metadata, AI, export</p>
          <h1 className="text-3xl font-bold leading-tight">TikTok Downloader</h1>
        </div>
        <div className="text-xs text-slate-400 w-full sm:w-auto text-left sm:text-right">Supports US · EU · Asia edge regions</div>
      </div>
      <DownloaderForm />

      <div className="pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <h2 className="text-2xl font-semibold">Instagram video & photo downloader</h2>
        </div>
        <p className="text-sm text-slate-400">Grab public reels or photo posts with direct download links powered by InstaSuperSave.</p>
        <InstagramDownloader />
      </div>
    </div>
  )
}
