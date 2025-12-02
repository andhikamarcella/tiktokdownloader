import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

async function uploadToDrive(fileUrl: string) {
  return { success: true, message: 'Queued upload to Google Drive', fileUrl }
}

async function uploadToDropbox(fileUrl: string) {
  return { success: true, message: 'Queued upload to Dropbox', fileUrl }
}

async function sendToTelegram(fileUrl: string) {
  return { success: true, message: 'Sent to Telegram bot', fileUrl }
}

export async function POST(req: NextRequest) {
  const { fileUrl, provider } = await req.json()
  if (!fileUrl || !provider) return NextResponse.json({ error: 'Missing fileUrl/provider' }, { status: 400 })

  const handlers: Record<string, (url: string) => Promise<any>> = {
    drive: uploadToDrive,
    dropbox: uploadToDropbox,
    telegram: sendToTelegram
  }
  const handler = handlers[provider]
  if (!handler) return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })

  const result = await handler(fileUrl)
  return NextResponse.json(result)
}
