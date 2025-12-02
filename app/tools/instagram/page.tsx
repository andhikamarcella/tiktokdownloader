"use client";

import { useState } from "react";
import { Download, Image as ImageIcon, Loader2, PlayCircle } from "lucide-react";
import type { InstagramRapidItem, InstagramRapidResponse } from "@/lib/instagram";

const initialState: InstagramRapidResponse = { items: [], raw: null };

export default function InstagramToolPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramRapidResponse>(initialState);

  const onSubmit = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(initialState);
    try {
      const res = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to download");
      setResult(data as InstagramRapidResponse);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = async (item: InstagramRapidItem, index: number) => {
    try {
      const response = await fetch(item.url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${item.type === "video" ? "instagram-video" : "instagram-photo"}-${index + 1}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const hasMultiple = result.items.length > 1;

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <ImageIcon className="w-5 h-5 text-pink-300" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Instagram reel, photo, or carousel link"
              className="flex-1 bg-transparent placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={onSubmit}
            disabled={!url || loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-slate-900 font-semibold flex items-center gap-2 justify-center disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
          </button>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {!error && !result.items.length && (
          <p className="text-xs text-slate-400">We use RapidAPI only — no scraping, Vercel-friendly.</p>
        )}
      </div>

      {result.items.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <span className="font-semibold">{result.author || "Instagram user"}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{result.title || "Media"}</span>
            {hasMultiple && <span className="text-xs px-2 py-1 rounded-full bg-white/10">Carousel</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.items.map((item, idx) => (
              <div key={`${item.url}-${idx}`} className="space-y-3 rounded-xl border border-white/10 p-3 bg-black/30">
                <div className="aspect-video rounded-lg overflow-hidden bg-black/60 flex items-center justify-center">
                  {item.type === "video" ? (
                    <video src={item.url} className="w-full h-full object-cover" controls loop muted playsInline />
                  ) : (
                    <img src={item.thumbnail || item.url} alt={result.title || "Instagram media"} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={item.url}
                    download
                    className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-center"
                  >
                    Direct link
                  </a>
                  <button
                    onClick={() => downloadItem(item, idx)}
                    className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-slate-900 font-semibold flex items-center gap-2 justify-center"
                  >
                    <PlayCircle className="w-4 h-4" /> Save file
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
