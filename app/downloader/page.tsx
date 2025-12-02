import DownloaderForm from '../../components/DownloaderForm'

export const dynamic = 'force-static'

export default function DownloaderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Video, audio, metadata, AI, export</p>
          <h1 className="text-3xl font-bold">TikTok Downloader</h1>
        </div>
        <div className="text-right text-xs text-slate-400">Supports US · EU · Asia edge regions</div>
      </div>
      <DownloaderForm />
    </div>
  )
}
