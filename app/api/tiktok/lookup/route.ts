import { NextResponse } from "next/server";
import { buildCaptionSuite } from "../../../../lib/ai";
import { getVideoInfo } from "../../../../lib/tiktok";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const media = await getVideoInfo(url);
    const captions = media.caption ? await buildCaptionSuite(media.caption) : null;

    return NextResponse.json({
      media: {
        video_no_wm: media.video_no_wm,
        video_wm: media.video_wm,
        audio_url: media.audio_url,
        thumbnail_url: media.thumbnail_url,
        caption: media.caption,
        hashtags: media.hashtags,
        music_title: media.music_title ?? media.sound?.title ?? "",
        author: media.author,
        duration: media.duration,
        provider: media.provider,
        sound: media.sound,
        // legacy aliases to avoid breaking older UI callers
        no_wm_url: media.video_no_wm,
        wm_url: media.video_wm,
      },
      captions,
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
