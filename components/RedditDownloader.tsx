"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Image as ImageIcon, Loader2, MessageCircle, PlayCircle } from "lucide-react";
import type { RedditMediaItem, RedditMediaResponse } from "../lib/reddit";
import { fileNameForItem } from "../lib/reddit";

type HistoryItem = { url: string; thumb: string; caption: string; ts: number };

export default function RedditDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<RedditMediaResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pasting, setPasting] = useState(false);

  const isGallery = useMemo(() => (media?.items.length || 0) > 1, [media]);

  useEffect(() => {
    const saved = localStorage.getItem("reddit-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!history.length) return;
    localStorage.setItem("reddit-history", JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const handlePaste = async () => {
    setPasting(true);
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (err) {
      setError("Clipboard not available");
    } finally {
      setPasting(false);
    }
  };

  const lookup = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setMedia(null);
    try {
      const res = await fetch(`/api/reddit?url=${encodeURIComponent(url)}`);
      const json = (await res.json()) as RedditMediaResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Lookup failed");
      setMedia(json);
      const first = json.items[0];
      setHistory((prev) => [
        { url, thumb: first.url, caption: json.title || "Reddit media", ts: Date.now() },
        ...prev,
      ]);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = async (item: RedditMediaItem, index: number) => {
    setError(null);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error("Unable to download media");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileNameForItem(item, index);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-3 flex-1">
            <MessageCircle className="w-5 h-5 text-orange-300" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Reddit post link with photos, GIFs, or videos"
              className="flex-1 bg-transparent placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setUrl("")}
              disabled={!url}
              className="px-3 py-2 rounded-xl bg-white/5 text-sm text-slate-100 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handlePaste}
              disabled={pasting}
              className="px-4 py-2 rounded-xl bg-white/10 text-sm flex items-center justify-center gap-2"
            >
              {pasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Paste
            </button>
            <button
              onClick={lookup}
              disabled={!url || loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-300 text-slate-900 font-semibold flex items-center gap-2 justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {!error && !media && (
          <p className="text-xs text-slate-400">
            Works with public Reddit posts that include hosted images, GIFs, videos, or galleries.
          </p>
        )}
      </div>

      {media && (
        <div className="glass rounded-2xl p-4 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <ImageIcon className="w-4 h-4" />
            <span className="font-semibold">{media.author || "Reddit user"}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{media.title || "Media"}</span>
            {isGallery && <span className="text-xs px-2 py-1 rounded-full bg-white/10">Gallery</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.items.map((item, idx) => (
              <div key={`${item.url}-${idx}`} className="space-y-3 rounded-xl border border-white/10 p-3 bg-black/30">
                <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black/60 flex items-center justify-center">
                  {item.type === "gif" || item.type === "video" ? (
                    <video
                      src={item.url}
                      poster={item.poster}
                      className="w-full h-full object-contain"
                      controls
                      loop={item.type === "gif"}
                      muted={item.type === "gif"}
                      playsInline
                    />
                  ) : (
                    <img src={item.url} alt={media.title || "Reddit media"} className="w-full h-full object-contain" />
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
                    className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-300 text-slate-900 font-semibold flex items-center gap-2 justify-center"
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
