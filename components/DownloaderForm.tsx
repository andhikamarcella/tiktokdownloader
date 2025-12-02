"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Headphones, Link2, Loader2, Music, Video } from "lucide-react";
import { TikTokMedia } from "../lib/tiktok";
import { exportAsJSON, exportAsTXT, exportCSV, exportHashtags, exportSongInfo } from "../utils/exporters";

export type CaptionSuite = {
  cleaned: string;
  summary: string;
  aesthetic: string;
  formal: string;
  funny: string;
  viral: string;
  en: string;
  id: string;
};

type LookupResponse = { media: TikTokMedia; captions: CaptionSuite | null };

type HistoryItem = { url: string; thumb: string; caption: string; ts: number };

export default function DownloaderForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TikTokMedia | null>(null);
  const [captions, setCaptions] = useState<CaptionSuite | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tt-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tt-history", JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const autoDetect = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes("tiktok.com")) setUrl(text);
    } catch (e) {
      console.warn("Clipboard not available", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tiktok/lookup", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json()) as LookupResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Lookup failed");
      setData(json.media);
      setCaptions(json.captions);
      setHistory((h) => [{ url, thumb: json.media.thumbnail_url, caption: json.media.caption, ts: Date.now() }, ...h]);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const metadataExports = useMemo(() => {
    if (!data) return null;
    return {
      json: exportAsJSON(data),
      txt: exportAsTXT(data),
      csv: exportCSV(data),
      captionOnly: data.caption,
      hashtags: exportHashtags(data),
      song: exportSongInfo(data),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 border border-white/10">
        <div className="flex gap-3 items-center">
          <Link2 className="w-5 h-5 text-purple-300" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any TikTok link — we auto-detect redirects"
            className="bg-transparent flex-1 text-lg placeholder:text-slate-400"
          />
          <button onClick={autoDetect} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm">
            Auto detect
          </button>
          <button
            disabled={!url || loading}
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
          </button>
        </div>
        {error && <p className="text-sm text-rose-300 mt-2">{error}</p>}
      </div>

      {data && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="aspect-video rounded-xl overflow-hidden bg-black/50">
              <video src={data.no_wm_url || data.wm_url} className="w-full h-full object-cover" autoPlay loop muted controls />
            </div>
            <div className="flex gap-2">
              <a href={data.no_wm_url} className="flex-1 text-center py-2 rounded-xl bg-white/10">
                No watermark
              </a>
              <a href={data.wm_url} className="flex-1 text-center py-2 rounded-xl bg-white/5">
                Watermark
              </a>
              <a href={data.audio_url} className="flex-1 text-center py-2 rounded-xl bg-emerald-500/20">
                Audio
              </a>
            </div>
            <div className="glass neu p-3 rounded-xl">
              <p className="text-sm text-slate-300">{data.caption}</p>
              <p className="text-xs text-purple-200 mt-1">{data.hashtags.join(" ")}</p>
            </div>
            <div className="flex items-center gap-3">
              {data.author?.avatar && <img src={data.author.avatar} alt="avatar" className="w-10 h-10 rounded-full" />}
              <div>
                <p className="font-semibold">{data.author?.nickname ?? data.author?.username}</p>
                <p className="text-xs text-slate-400">{data.author?.username}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
            <h3 className="font-semibold">Metadata & caption AI</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-slate-400">Sound</p>
                <p>{data.sound?.title ?? data.music_title ?? "Unknown"}</p>
                <p className="text-xs">{data.sound?.artist}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-slate-400">Duration</p>
                <p>{data.duration ? `${data.duration}s` : "N/A"}</p>
              </div>
            </div>
            {captions && (
              <div className="space-y-2 text-sm">
                <p className="text-xs text-slate-400">Clean</p>
                <p className="glass neu p-2 rounded-lg">{captions.cleaned}</p>
                <p className="text-xs text-slate-400">Summary</p>
                <p className="glass neu p-2 rounded-lg">{captions.summary}</p>
                <p className="text-xs text-slate-400">Styles</p>
                <div className="grid grid-cols-2 gap-2">
                  <p className="glass neu p-2 rounded-lg text-xs">{captions.aesthetic}</p>
                  <p className="glass neu p-2 rounded-lg text-xs">{captions.formal}</p>
                  <p className="glass neu p-2 rounded-lg text-xs">{captions.funny}</p>
                  <p className="glass neu p-2 rounded-lg text-xs">{captions.viral}</p>
                </div>
                <p className="text-xs text-slate-400">Translations</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p className="glass neu p-2 rounded-lg">EN: {captions.en}</p>
                  <p className="glass neu p-2 rounded-lg">ID: {captions.id}</p>
                </div>
              </div>
            )}
            {metadataExports && (
              <div className="space-y-2 text-sm">
                <p className="text-xs text-slate-400">Export metadata</p>
                <div className="grid grid-cols-2 gap-2">
                  <textarea className="glass p-2 rounded-lg h-20" readOnly value={metadataExports.json} />
                  <textarea className="glass p-2 rounded-lg h-20" readOnly value={metadataExports.csv} />
                  <textarea className="glass p-2 rounded-lg h-20" readOnly value={metadataExports.captionOnly} />
                  <textarea className="glass p-2 rounded-lg h-20" readOnly value={metadataExports.hashtags} />
                  <textarea className="glass p-2 rounded-lg h-20" readOnly value={metadataExports.song} />
                  <textarea className="glass p-2 rounded-lg h-20" readOnly value={metadataExports.txt} />
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Music className="w-4 h-4" /> Music detection
            </h3>
            <MusicDetector url={data.audio_url || url} />
            <h3 className="font-semibold flex items-center gap-2">
              <Headphones className="w-4 h-4" /> Cloud save
            </h3>
            <CloudSaves media={data} />
            <h3 className="font-semibold flex items-center gap-2">
              <Video className="w-4 h-4" /> Thumbnail enhancer
            </h3>
            <ThumbnailFrames url={data.thumbnail_url || url} />
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-4 border border-white/10">
        <h3 className="font-semibold mb-2">Smart history</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {history.map((item) => (
            <div key={item.ts} className="glass neu p-3 rounded-xl text-sm">
              <div className="flex items-center gap-3">
                <img src={item.thumb} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="line-clamp-2">{item.caption}</p>
                  <p className="text-xs text-slate-400">{new Date(item.ts).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MusicDetector({ url }: { url: string }) {
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    const res = await fetch("/api/music/detect", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: { "Content-Type": "application/json" },
    });
    setResult(await res.json());
  };

  return (
    <div className="space-y-2 text-sm">
      <button onClick={run} className="px-3 py-2 rounded-xl bg-white/10">
        Detect music
      </button>
      {result && (
        <div className="text-xs space-y-1">
          <p>Fingerprint: {result.fingerprint?.hash}</p>
          <p>AudD: {result.audd?.result?.title ?? "n/a"}</p>
          <p>YouTube: {result.youtube?.items?.[0]?.snippet?.title ?? "n/a"}</p>
        </div>
      )}
    </div>
  );
}

function CloudSaves({ media }: { media: TikTokMedia }) {
  const send = async (provider: string) => {
    console.info(`Queue to ${provider}`, media.no_wm_url || media.wm_url);
    alert(`Ready to push ${provider} via your own token exchange.`);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {["google drive", "dropbox", "telegram"].map((p) => (
        <button key={p} onClick={() => send(p)} className="px-3 py-2 rounded-xl bg-white/10 capitalize">
          {p}
        </button>
      ))}
    </div>
  );
}

function ThumbnailFrames({ url }: { url: string }) {
  const [frames, setFrames] = useState<any>(null);
  const run = async () => {
    const res = await fetch("/api/thumbnail/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setFrames(await res.json());
  };
  return (
    <div className="space-y-2 text-xs">
      <button onClick={run} className="px-3 py-2 rounded-xl bg-white/10">
        Generate frames
      </button>
      {frames && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {frames.frames.map((f: any) => (
              <img key={f.url} src={f.url} className="rounded-lg" />
            ))}
          </div>
          <p>Best: {frames.best.url}</p>
        </div>
      )}
    </div>
  );
}
