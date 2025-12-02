"use client";

import { useState } from "react";
import { Download, Image as ImageIcon, Loader2, PlayCircle, Users } from "lucide-react";
import type { InstagramMedia } from "../lib/instagram";

export default function InstagramDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<InstagramMedia | null>(null);

  const lookup = async () => {
    setLoading(true);
    setError(null);
    setMedia(null);
    try {
      const res = await fetch("/api/instagram/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lookup failed");
      setMedia(json.media as InstagramMedia);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!media?.downloadUrl) return;
    const res = await fetch(media.downloadUrl);
    if (!res.ok) {
      setError("Unable to download media");
      return;
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = media.isVideo ? "instagram-video.mp4" : "instagram-photo.jpg";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
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
              placeholder="Paste Instagram photo or reel link"
              className="flex-1 bg-transparent placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={lookup}
            disabled={!url || loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-slate-900 font-semibold flex items-center gap-2 justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
          </button>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>

      {media && (
        <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
          <div className="aspect-video rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
            {media.isVideo ? (
              <video src={media.downloadUrl} className="w-full h-full object-cover" controls loop muted />
            ) : (
              <img src={media.thumbnailUrl || media.downloadUrl} alt={media.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{media.author}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{media.title}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={media.downloadUrl}
              download={media.isVideo ? "instagram-video.mp4" : "instagram-photo.jpg"}
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-center"
            >
              Direct link
            </a>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-slate-900 font-semibold flex items-center gap-2 justify-center"
            >
              <PlayCircle className="w-4 h-4" /> Save file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
