"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Image as ImageIcon, Loader2, PlayCircle, Users } from "lucide-react";
import type { InstagramRapidItem } from "../lib/instagram";

type MediaState = {
  title?: string;
  author?: string;
  items: InstagramRapidItem[];
};

type HistoryItem = { url: string; thumb: string; caption: string; ts: number };

export default function InstagramDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaState | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pasting, setPasting] = useState(false);

  const hasCarousel = useMemo(() => (media?.items.length || 0) > 1, [media]);

  useEffect(() => {
    const saved = localStorage.getItem("tt-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!history.length) return;
    localStorage.setItem("tt-history", JSON.stringify(history.slice(0, 50)));
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
      const res = await fetch(`/api/ig?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lookup failed");
      setMedia({
        title: json.title,
        author: json.author,
        items: json.items as InstagramRapidItem[],
      });
      if (json.items?.length) {
        const first = json.items[0] as InstagramRapidItem;
        setHistory((prev) => [
          {
            url,
            thumb: first.thumbnail || first.url,
            caption: json.title || "Instagram media",
            ts: Date.now(),
          },
          ...prev,
        ]);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = async (item: InstagramRapidItem, index: number) => {
    setError(null);
    try {
      const res = await fetch(
      `/api/ig/download?url=${encodeURIComponent(item.url)}`
      );
      if (!res.ok) throw new Error("Unable to download media");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      const baseName = item.type === "video" ? "instagram-video" : "instagram-photo";
      anchor.download = hasCarousel ? `${baseName}-${index + 1}` : baseName;
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
            <ImageIcon className="w-5 h-5 text-pink-300" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Instagram photo, reel, or carousel link"
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-slate-900 font-semibold flex items-center gap-2 justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {!error && !media && (
          <p className="text-xs text-slate-400">Scrape-first Instagram downloader with safe server-side download.</p>
        )}
      </div>

      {media && (
        <div className="glass rounded-2xl p-4 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{media.author || "Instagram user"}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{media.title || "Media"}</span>
            {hasCarousel && <span className="text-xs px-2 py-1 rounded-full bg-white/10">Carousel</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.items.map((item, idx) => (
              <div key={`${item.url}-${idx}`} className="space-y-3 rounded-xl border border-white/10 p-3 bg-black/30">
                <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black/60 flex items-center justify-center">
                  {item.type === "video" ? (
                    <video src={item.url} className="w-full h-full object-contain" controls loop muted playsInline />
                  ) : (
                    <img src={item.thumbnail || item.url} alt={media.title || "Instagram media"} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                  href={`/api/ig/download?url=${encodeURIComponent(item.url)}`}
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
