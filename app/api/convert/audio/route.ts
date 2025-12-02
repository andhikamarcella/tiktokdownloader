import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST() {
  return NextResponse.json({
    message: "Client-side ffmpeg.wasm handles audio extraction.",
    hint: "Use lib/ffmpeg runToMp3 or extractAudio in a client component."
  })
}
