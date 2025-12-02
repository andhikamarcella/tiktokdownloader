import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json({
    message: "Client-side ffmpeg.wasm handles GIF conversion.",
    hint: "Load ffmpeg in the client and run '-vf fps=12,scale=360:-1:flags=lanczos -t 8 output.gif'.",
  });
}
