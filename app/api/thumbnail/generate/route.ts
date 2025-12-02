import { NextResponse } from "next/server"
import cloudinary from "../../../../lib/cloudinary"
import { buildThumbnailFrames } from "../../../../lib/tiktok"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string }
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 })

  const frames = await buildThumbnailFrames(url)

  const variants = cloudinary.config().cloud_name
    ? {
        square: cloudinary.url(url, { transformation: [{ width: 600, height: 600, crop: "fill" }] }),
        portrait: cloudinary.url(url, { transformation: [{ width: 720, height: 1280, crop: "fill" }] }),
        landscape: cloudinary.url(url, { transformation: [{ width: 1280, height: 720, crop: "fill" }] })
      }
    : frames.variants

  return NextResponse.json({ ...frames, variants })
}
