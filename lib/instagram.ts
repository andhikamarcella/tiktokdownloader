export type InstagramMedia = {
  sourceUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  isVideo: boolean;
};

function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    url.search = ""; // drop query noise
    if (!url.pathname.endsWith("/")) {
      url.pathname = `${url.pathname}/`;
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function toDownloadable(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    return `https://instasupersave.com/download?url=${encodeURIComponent(normalized)}`;
  } catch (e) {
    return url;
  }
}

function guessIsVideo(metaHtml: string | undefined, url: string, metaJson?: any): boolean {
  if (metaJson?.items?.[0]?.video_versions?.length) return true;
  return (
    (metaHtml ?? "").includes("video") ||
    url.includes("/reel") ||
    url.includes("/tv") ||
    url.includes("/video") ||
    url.includes("/reels")
  );
}

async function fetchMetaJson(normalizedUrl: string) {
  // Jina proxy helps bypass robots when grabbing the public JSON payload
  const metaUrl = `https://www.instagram.com${new URL(normalizedUrl).pathname}?__a=1&__d=dis`;
  const jinaUrl = `https://r.jina.ai/${metaUrl}`;
  const res = await fetch(jinaUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error(`meta fetch failed ${res.status}`);
  const text = await res.text();
  // jina returns the upstream body; attempt to parse JSON directly
  return JSON.parse(text);
}

export async function fetchInstagramMedia(url: string): Promise<InstagramMedia> {
  const normalized = normalizeUrl(url);
  let meta: any = null;
  let metaJson: any = null;

  try {
    const oembed = await fetch(
      `https://www.instagram.com/oembed/?url=${encodeURIComponent(normalized)}&omitscript=true`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        },
        next: { revalidate: 60 },
      }
    );
    if (oembed.ok) {
      meta = await oembed.json();
    }
  } catch (error) {
    console.warn("Instagram oEmbed fallback", error);
  }

  try {
    metaJson = await fetchMetaJson(normalized);
  } catch (error) {
    console.warn("Instagram JSON fallback", error);
  }

  const candidateVideo = metaJson?.items?.[0]?.video_versions?.[0]?.url;
  const candidateImage =
    metaJson?.items?.[0]?.image_versions2?.candidates?.[0]?.url || meta?.thumbnail_url;

  const downloadUrl = candidateVideo || candidateImage || toDownloadable(normalized);
  const thumbnailUrl = candidateImage || candidateVideo || meta?.thumbnail_url || "";
  const isVideo = guessIsVideo(meta?.html as string | undefined, normalized, metaJson);

  return {
    sourceUrl: normalized,
    downloadUrl,
    thumbnailUrl,
    title: meta?.title ?? metaJson?.items?.[0]?.caption?.text ?? "Instagram media",
    author: meta?.author_name ?? metaJson?.items?.[0]?.user?.username ?? "Instagram user",
    isVideo,
  };
}
