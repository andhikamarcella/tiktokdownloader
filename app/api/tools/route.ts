import { NextResponse } from 'next/server'
import { trimVideo, convertVideo, removeWatermark } from '../../../lib/ffmpeg'

export const runtime = 'edge'

export async function POST(req: Request) {
  const form = await req.formData()
  const action = form.get('action') as string
  const file = form.get('file') as File | null
  const start = Number(form.get('start') ?? 0)
  const end = Number(form.get('end') ?? 0)
  const format = (form.get('format') as any) || 'webm'

  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 })
  const buffer = await file.arrayBuffer()

  if (action === 'trim') {
    const data = await trimVideo(buffer, start, end)
    return new NextResponse(data, { headers: { 'Content-Type': 'video/mp4' } })
  }

  if (action === 'convert') {
    const result = await convertVideo(buffer, format)
    return new NextResponse(result.buffer, { headers: { 'Content-Disposition': `attachment; filename=${result.filename}` } })
  }

  if (action === 'remove-watermark') {
    const data = await removeWatermark(buffer)
    return new NextResponse(data, { headers: { 'Content-Type': 'video/mp4' } })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
