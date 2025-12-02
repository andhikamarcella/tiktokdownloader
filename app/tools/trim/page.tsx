"use client";

import { useState } from "react";
import { Loader2, Scissors } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TrimPage() {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleTrim = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      if (typeof window === "undefined") throw new Error("FFmpeg only runs in the browser");
      const { ensureFFmpegLoaded, ffmpeg } = await import("../../../lib/ffmpeg");
      if (!ffmpeg || typeof ffmpeg.isLoaded !== "function") {
        throw new Error("FFmpeg helper unavailable. Ensure @ffmpeg/ffmpeg@0.12.2 is installed.");
      }
      await ensureFFmpegLoaded();
      const fileData = new Uint8Array(await file.arrayBuffer());
      ffmpeg.FS("writeFile", "input.mp4", fileData);
      const duration = Math.max(end - start, 1);
      await ffmpeg.run("-i", "input.mp4", "-ss", `${start}`, "-t", `${duration}`, "-c", "copy", "trimmed.mp4");
      const trimmed = ffmpeg.FS("readFile", "trimmed.mp4");
      if (!(trimmed instanceof Uint8Array)) throw new Error("Failed to read trimmed video");
      setOutput(URL.createObjectURL(new Blob([trimmed.buffer], { type: "video/mp4" })));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Scissors className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Trim before download (client ffmpeg.wasm)</p>
          <h1 className="text-3xl font-bold">Trim tool</h1>
        </div>
      </div>
      <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
        <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            value={start}
            min={0}
            onChange={(e) => setStart(Number(e.target.value))}
            className="glass p-2 rounded-xl flex-1"
            placeholder="Start (s)"
          />
          <input
            type="number"
            value={end}
            min={start + 1}
            onChange={(e) => setEnd(Number(e.target.value))}
            className="glass p-2 rounded-xl flex-1"
            placeholder="End (s)"
          />
          <button onClick={handleTrim} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2 w-full sm:w-auto justify-center" disabled={loading || !file}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Trim & preview"}
          </button>
        </div>
        <p className="text-xs text-slate-400">Runs locally with ffmpeg.wasm 0.12.2. Adjust start/end (seconds) before preview.</p>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {output && <video src={output} controls className="w-full rounded-xl" />}
      </div>
    </div>
  );
}
