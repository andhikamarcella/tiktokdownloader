"use client";

import { useState } from "react";
import { Loader2, Scissors } from "lucide-react";
import { ensureFFmpegLoaded, ffmpeg } from "../../../lib/ffmpeg";

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
      await ensureFFmpegLoaded();
      const fileData = new Uint8Array(await file.arrayBuffer());
      ffmpeg.FS("writeFile", "input.mp4", fileData);
      const duration = Math.max(end - start, 1);
      await ffmpeg.run("-i", "input.mp4", "-ss", `${start}`, "-t", `${duration}`, "-c", "copy", "trimmed.mp4");
      const trimmed = ffmpeg.FS("readFile", "trimmed.mp4");
      setOutput(URL.createObjectURL(new Blob([trimmed.buffer], { type: "video/mp4" })));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scissors className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Trim before download (client ffmpeg.wasm)</p>
          <h1 className="text-3xl font-bold">Trim tool</h1>
        </div>
      </div>
      <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
        <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex gap-3">
          <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} className="glass p-2 rounded-xl" />
          <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value))} className="glass p-2 rounded-xl" />
          <button onClick={handleTrim} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Trim & preview"}
          </button>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {output && <video src={output} controls className="w-full rounded-xl" />}
      </div>
    </div>
  );
}
