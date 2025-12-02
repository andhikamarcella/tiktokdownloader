import DownloaderForm from '../../components/DownloaderForm'

export const dynamic = 'force-static'

export default function DownloaderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm text-slate-300">Video, audio, metadata, AI, export</p>
          <h1 className="text-3xl font-bold leading-tight">TikTok Downloader</h1>
        </div>
        <div className="text-xs text-slate-400 w-full sm:w-auto text-left sm:text-right">Supports US · EU · Asia edge regions</div>
      </div>
      <DownloaderForm />
    </div>
  )
}
