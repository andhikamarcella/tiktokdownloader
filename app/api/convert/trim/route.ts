import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST() {
  return NextResponse.json({
    message: "Client-side ffmpeg.wasm trims clips.",
    hint: "Use lib/ffmpeg runTrim in the trim tool page."
  })
}
