"use client";

import { useState } from "react";
import { Loader2, Repeat } from "lucide-react";

export const dynamic = "force-dynamic";

const formats = [
  { value: "mp3", label: "MP4 → MP3" },
  { value: "gif", label: "MP4 → GIF" },
];

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("mp3");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const convertWithFFmpeg = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      if (typeof window === "undefined") throw new Error("FFmpeg only runs in the browser");
      const { ffmpeg, ensureFFmpegLoaded } = await import("../../../lib/ffmpeg");
      if (!ffmpeg || typeof ffmpeg.isLoaded !== "function") {
        throw new Error("FFmpeg helper unavailable. Ensure @ffmpeg/ffmpeg@0.12.2 is installed.");
      }
      await ensureFFmpegLoaded();
      const fileData = new Uint8Array(await file.arrayBuffer());
      ffmpeg.FS("writeFile", "input.mp4", fileData);
      let blob: Blob;
      if (format === "mp3") {
        await ffmpeg.run("-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3");
        const data = ffmpeg.FS("readFile", "output.mp3");
        if (!(data instanceof Uint8Array)) throw new Error("Failed to read converted audio");
        blob = new Blob([data.buffer], { type: "audio/mpeg" });
      } else {
        await ffmpeg.run("-i", "input.mp4", "-vf", "fps=12,scale=360:-1:flags=lanczos", "-t", "8", "output.gif");
        const data = ffmpeg.FS("readFile", "output.gif");
        if (!(data instanceof Uint8Array)) throw new Error("Failed to read converted gif");
        blob = new Blob([data.buffer], { type: "image/gif" });
      }
      setOutput(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { convertToAudio } = await import("../../../lib/ffmpeg");
      const blob = await convertToAudio(file);
      setOutput(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Repeat className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Convert formats with client-side ffmpeg.wasm</p>
          <h1 className="text-3xl font-bold">Convert</h1>
        </div>
      </div>
      <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="glass p-2 rounded-xl flex-1 min-w-[160px]">
            {formats.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400">All conversions run locally with ffmpeg.wasm 0.12.2 (client-only).</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={convertWithFFmpeg} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2" disabled={loading || !file}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Convert"}
          </button>
          <button onClick={handleExtract} className="px-4 py-2 rounded-xl bg-white/5" disabled={loading || !file}>
            Extract audio (M4A)
          </button>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {output &&
          (format === "gif" ? <img src={output} className="w-full rounded-xl" /> : <audio controls src={output} className="w-full" />)}
      </div>
    </div>
  );
}
