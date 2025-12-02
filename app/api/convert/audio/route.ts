import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json({
    message: "Client-side ffmpeg.wasm handles audio extraction.",
    hint: "Use lib/ffmpeg ensureFFmpegLoaded/convertToAudio in a client component.",
  });
}
