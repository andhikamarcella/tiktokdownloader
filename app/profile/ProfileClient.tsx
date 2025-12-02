"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Download, Loader2, Square, User } from "lucide-react";
import type { TikTokProfileVideo, TikTokUserProfile } from "../../lib/tiktok";

type ProfileClientProps = {
  user: TikTokUserProfile | null;
  videos: TikTokProfileVideo[];
};

function formatNumber(value?: number) {
  if (value === undefined) return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export default function ProfileClient({ user, videos }: ProfileClientProps) {
  const [selected, setSelected] = useState<string[]>(videos.map((v) => v.id));
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setSelected(videos.map((v) => v.id));
  }, [videos]);

  const allSelected = useMemo(() => selected.length === videos.length && videos.length > 0, [selected, videos]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(videos.map((v) => v.id));
    }
  };

  const handleDownload = async () => {
    if (!selected.length) return;
    setDownloading(true);
    setStatus("");
    try {
      const res = await fetch("/api/profile/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) {
        throw new Error("Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "tiktok-profile-videos.zip";
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus(`Preparing ${selected.length} links`);
    } catch (err) {
      console.error(err);
      setStatus((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.displayName || user.username} className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-300" />
            </div>
          )}
          <div>
            <p className="text-sm text-slate-300">Authenticated TikTok profile</p>
            <h1 className="text-2xl font-bold">{user?.displayName || user?.username || "Your profile"}</h1>
            {user?.username && <p className="text-xs text-slate-400">@{user.username}</p>}
            {user?.followers !== undefined && (
              <p className="text-xs text-slate-400">Followers: {formatNumber(user.followers)}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-sm">
          <Link href="/api/auth/logout" className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/5">
            Logout
          </Link>
          <Link
            href="/api/auth/tiktok"
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold"
          >
            Re-authenticate
          </Link>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button onClick={toggleAll} className="px-3 py-2 rounded-xl bg-white/10 flex items-center gap-2">
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {allSelected ? "Unselect all" : "Select all"}
          </button>
          <span className="text-slate-400">{selected.length} / {videos.length} selected</span>
          <button
            onClick={handleDownload}
            disabled={!selected.length || downloading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-sky-400 text-slate-900 font-semibold flex items-center gap-2"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download selected
          </button>
          {status && <span className="text-xs text-slate-300">{status}</span>}
        </div>
        {videos.length === 0 && <p className="text-sm text-slate-300">No videos available for this profile.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {videos.map((video) => (
            <label key={video.id} className="glass neu p-3 rounded-xl flex gap-3 cursor-pointer">
              <input type="checkbox" checked={selected.includes(video.id)} onChange={() => toggle(video.id)} />
              <div className="space-y-1 w-full">
                <div className="relative w-full overflow-hidden rounded-lg aspect-[4/5] bg-white/5">
                  {video.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={video.cover} alt={video.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
                {(video.download_url || video.share_url) && (
                  <p className="text-xs text-slate-400 break-all">{video.download_url || video.share_url}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
