import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"

export const ffmpeg = createFFmpeg({ log: true })

export async function ensureFFmpegLoaded() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load()
  }
}

export async function runTrim(file: File, start: number, end: number) {
  await ensureFFmpegLoaded()
  const data = await fetchFile(file)
  ffmpeg.FS("writeFile", "input.mp4", data)
  const duration = Math.max(end - start, 1)
  await ffmpeg.run("-i", "input.mp4", "-ss", `${start}`, "-t", `${duration}", "-c", "copy", "trimmed.mp4")
  const trimmed = ffmpeg.FS("readFile", "trimmed.mp4")
  return new Blob([trimmed.buffer], { type: "video/mp4" })
}

export async function runToMp3(file: File) {
  await ensureFFmpegLoaded()
  const data = await fetchFile(file)
  ffmpeg.FS("writeFile", "input.mp4", data)
  await ffmpeg.run("-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3")
  const audio = ffmpeg.FS("readFile", "output.mp3")
  return new Blob([audio.buffer], { type: "audio/mpeg" })
}

export async function runToGif(file: File) {
  await ensureFFmpegLoaded()
  const data = await fetchFile(file)
  ffmpeg.FS("writeFile", "input.mp4", data)
  await ffmpeg.run(
    "-i",
    "input.mp4",
    "-vf",
    "fps=12,scale=360:-1:flags=lanczos",
    "-t",
    "8",
    "output.gif"
  )
  const gif = ffmpeg.FS("readFile", "output.gif")
  return new Blob([gif.buffer], { type: "image/gif" })
}

export async function extractAudio(file: File) {
  await ensureFFmpegLoaded()
  const data = await fetchFile(file)
  ffmpeg.FS("writeFile", "input.mp4", data)
  await ffmpeg.run("-i", "input.mp4", "-vn", "-acodec", "copy", "audio.m4a")
  const audio = ffmpeg.FS("readFile", "audio.m4a")
  return new Blob([audio.buffer], { type: "audio/mp4" })
}
