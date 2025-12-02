import JSZip from "jszip";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchUserVideos, TikTokProfileVideo } from "../../../../lib/tiktok";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = cookies().get("tiktok_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
  if (!ids.length) {
    return NextResponse.json({ error: "No video ids provided" }, { status: 400 });
  }

  const videos = await fetchUserVideos(token);
  const selected: TikTokProfileVideo[] = videos.filter((video) => ids.includes(video.id));

  const manifest = await Promise.all(
    selected.map(async (video) => ({
      id: video.id,
      title: video.title,
      download_url: video.download_url || video.share_url || "",
      cover: video.cover,
    })),
  );

  const zip = new JSZip();
  zip.file("links.json", JSON.stringify(manifest, null, 2));
  manifest.forEach((entry, idx) => {
    zip.file(`links/link-${idx + 1}.txt`, entry.download_url || "");
  });

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=profile-videos.zip",
    },
  });
}
