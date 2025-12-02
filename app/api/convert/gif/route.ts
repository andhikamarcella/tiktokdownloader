import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST() {
  return NextResponse.json({
    message: "Client-side ffmpeg.wasm converts MP4 to GIF.",
    hint: "Use lib/ffmpeg runToGif from a client page."
  })
}
