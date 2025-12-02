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

export async function fetchInstagramMedia(url: string): Promise<InstagramMedia> {
  const oembed = await fetch(
    `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`
  );
  if (!oembed.ok) {
    throw new Error("Failed to fetch Instagram metadata");
  }
  const meta = await oembed.json();
  const isVideo =
    (meta?.html as string | undefined)?.includes("video") ||
    url.includes("/reel") ||
    url.includes("/tv") ||
    url.includes("/video");

  return {
    sourceUrl: url,
    downloadUrl: toDownloadable(url),
    thumbnailUrl: meta?.thumbnail_url ?? "",
    title: meta?.title ?? "Instagram media",
    author: meta?.author_name ?? "Instagram user",
    isVideo,
  };
}
