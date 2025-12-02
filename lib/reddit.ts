export type RedditMediaItem = {
  url: string;
  type: "image" | "gif";
  width?: number;
  height?: number;
  poster?: string;
};

export type RedditMediaResponse = {
  title?: string;
  author?: string;
  items: RedditMediaItem[];
};

type RedditListing = {
  data: {
    children: { data: RedditPost }[];
  };
};

type RedditGalleryItem = {
  status: string;
  e?: string;
  m?: string;
  s?: { u?: string; x?: number; y?: number; gif?: string };
};

type RedditImageVariant = {
  source?: { url: string; width: number; height: number };
};

type RedditPreview = {
  images?: { source: { url: string; width: number; height: number }; variants?: { gif?: RedditImageVariant } }[];
  reddit_video_preview?: { fallback_url: string; width?: number; height?: number };
};

type RedditPost = {
  title?: string;
  author?: string;
  url?: string;
  url_overridden_by_dest?: string;
  is_gallery?: boolean;
  media_metadata?: Record<string, RedditGalleryItem>;
  preview?: RedditPreview;
  post_hint?: string;
};

const decodeUrl = (url?: string) => url?.replace(/&amp;/g, "&") ?? "";

const guessTypeFromUrl = (url: string, fallback: RedditMediaItem["type"]) => {
  if (/\.gif($|\?)/i.test(url)) return "gif" as const;
  if (/\.(jpe?g|png|webp)($|\?)/i.test(url)) return "image" as const;
  return fallback;
};

const guessExtension = (url: string, fallback: string) => {
  const cleaned = url.split(/[?#]/)[0];
  const parts = cleaned.split(".");
  const ext = parts.length > 1 ? parts.pop() : undefined;
  if (ext && ext.length <= 5) return ext;
  return fallback;
};

export function fileNameForItem(item: RedditMediaItem, idx: number) {
  const ext = guessExtension(item.url, item.type === "gif" ? "gif" : "jpg");
  return `reddit-${item.type}-${idx + 1}.${ext}`;
}

function extractGalleryItems(post: RedditPost): RedditMediaItem[] {
  const items: RedditMediaItem[] = [];
  const metadata = post.media_metadata;
  if (!post.is_gallery || !metadata) return items;

  for (const value of Object.values(metadata)) {
    if (value.status !== "valid") continue;
    const source = value.s;
    if (!source) continue;
    const rawUrl = decodeUrl(source.gif || source.u);
    if (!rawUrl) continue;
    const type = value.m?.includes("gif") ? "gif" : guessTypeFromUrl(rawUrl, "image");
    items.push({ url: rawUrl, type, width: source.x, height: source.y });
  }

  return items;
}

function extractPreviewItems(post: RedditPost): RedditMediaItem[] {
  const items: RedditMediaItem[] = [];
  const preview = post.preview;
  if (!preview) return items;

  const firstImage = preview.images?.[0];
  if (firstImage?.source) {
    const srcUrl = decodeUrl(firstImage.source.url);
    if (srcUrl) {
      const type = firstImage.variants?.gif?.source ? "gif" : guessTypeFromUrl(srcUrl, "image");
      items.push({ url: srcUrl, type, width: firstImage.source.width, height: firstImage.source.height });
    }
    const gifVariant = firstImage.variants?.gif?.source?.url;
    if (gifVariant) {
      const gifUrl = decodeUrl(gifVariant);
      items.push({ url: gifUrl, type: "gif", width: firstImage.source.width, height: firstImage.source.height });
    }
  }

  if (preview.reddit_video_preview?.fallback_url) {
    const videoUrl = decodeUrl(preview.reddit_video_preview.fallback_url);
    items.push({
      url: videoUrl,
      type: "gif",
      width: preview.reddit_video_preview.width,
      height: preview.reddit_video_preview.height,
      poster: items[0]?.url,
    });
  }

  return items;
}

function extractDirectUrl(post: RedditPost): RedditMediaItem[] {
  const items: RedditMediaItem[] = [];
  const direct = decodeUrl(post.url_overridden_by_dest || post.url);
  if (!direct) return items;
  const type = guessTypeFromUrl(direct, post.post_hint === "rich:video" ? "gif" : "image");
  items.push({ url: direct, type });
  return items;
}

export async function fetchRedditMedia(url: string): Promise<RedditMediaResponse> {
  const infoUrl = `https://www.reddit.com/api/info.json?url=${encodeURIComponent(url)}`;
  const res = await fetch(infoUrl, {
    headers: { "User-Agent": "TikTokDownloaderPro/1.0" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit lookup failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as RedditListing;
  const post = json?.data?.children?.[0]?.data;

  if (!post) {
    throw new Error("No Reddit post found for this URL");
  }

  const items: RedditMediaItem[] = [];
  const seen = new Set<string>();
  const pushUnique = (media: RedditMediaItem) => {
    if (!media.url || seen.has(media.url)) return;
    seen.add(media.url);
    items.push(media);
  };

  extractGalleryItems(post).forEach(pushUnique);
  extractPreviewItems(post).forEach(pushUnique);
  extractDirectUrl(post).forEach(pushUnique);

  if (!items.length) {
    throw new Error("No downloadable images or GIFs detected");
  }

  return {
    title: post.title,
    author: post.author,
    items,
  };
}
