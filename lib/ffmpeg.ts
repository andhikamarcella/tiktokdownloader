"use client";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export const ffmpeg = createFFmpeg({ log: true });

export async function ensureFFmpegLoaded() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

export async function convertToAudio(file: File) {
  await ensureFFmpegLoaded();

  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

  await ffmpeg.run("-i", "input.mp4", "audio.m4a");

  const data = ffmpeg.FS("readFile", "audio.m4a");

  return new Blob([data.buffer], { type: "audio/mp4" });
}
