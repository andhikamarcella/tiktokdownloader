import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const ffmpeg = createFFmpeg({ log: true })

export async function ensureFFmpegLoaded() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load()
  }
  return ffmpeg
}

export async function trimVideo(input: ArrayBuffer, start: number, end: number) {
  const instance = await ensureFFmpegLoaded()
  instance.FS('writeFile', 'input.mp4', new Uint8Array(input))
  await instance.run('-i', 'input.mp4', '-ss', `${start}`, '-to', `${end}`, '-c', 'copy', 'trim.mp4')
  const data = instance.FS('readFile', 'trim.mp4')
  return data.buffer
}

export async function convertVideo(input: ArrayBuffer, format: 'webm' | 'gif' | '60fps' | 'livephoto') {
  const instance = await ensureFFmpegLoaded()
  instance.FS('writeFile', 'input.mp4', new Uint8Array(input))
  const output = format === 'gif' ? 'output.gif' : format === 'webm' ? 'output.webm' : 'output.mp4'
  const args =
    format === '60fps'
      ? ['-i', 'input.mp4', '-filter:v', 'minterpolate=fps=60', output]
      : format === 'livephoto'
        ? ['-i', 'input.mp4', '-vf', 'scale=1080:-1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output]
        : ['-i', 'input.mp4', output]
  await instance.run(...args)
  const data = instance.FS('readFile', output)
  return { buffer: data.buffer, filename: output }
}

export async function removeWatermark(input: ArrayBuffer) {
  const instance = await ensureFFmpegLoaded()
  instance.FS('writeFile', 'input.mp4', new Uint8Array(input))
  await instance.run('-i', 'input.mp4', '-vf', 'hqdn3d=1.5:1.5:6:6', 'clean.mp4')
  const data = instance.FS('readFile', 'clean.mp4')
  return data.buffer
}
