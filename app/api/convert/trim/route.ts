import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json({
    message: "Client-side ffmpeg.wasm handles trimming.",
    hint: "Load ffmpeg in the client and run '-ss {start} -t {duration} -c copy trimmed.mp4'.",
  });
}
