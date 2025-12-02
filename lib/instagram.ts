export type InstagramMedia = {
  sourceUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  isVideo: boolean;
};

function toDownloadable(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hostname = "ddinstagram.com";
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

function guessIsVideo(metaHtml: string | undefined, url: string): boolean {
  return (
    (metaHtml ?? "").includes("video") ||
    url.includes("/reel") ||
    url.includes("/tv") ||
    url.includes("/video") ||
    url.includes("/reels")
  );
}

export async function fetchInstagramMedia(url: string): Promise<InstagramMedia> {
  let meta: any = null;
  try {
    const oembed = await fetch(
      `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`,
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

  const isVideo = guessIsVideo(meta?.html as string | undefined, url);

  return {
    sourceUrl: url,
    downloadUrl: toDownloadable(url),
    thumbnailUrl: meta?.thumbnail_url ?? "",
    title: meta?.title ?? "Instagram media",
    author: meta?.author_name ?? "Instagram user",
    isVideo,
  };
}
