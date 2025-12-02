export type RedditMediaItem = {
  url: string;
  type: "image" | "gif" | "video";
  width?: number;
  height?: number;
  poster?: string;
};

export type RedditMediaResponse = {
  title?: string;
  author?: string;
  items: RedditMediaItem[];
};

export type RedditAuth = {
  sessionCookie?: string;
  bearerToken?: string;
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

type RedditVideo = {
  fallback_url?: string;
  dash_url?: string;
  hls_url?: string;
  width?: number;
  height?: number;
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
  secure_media?: { reddit_video?: RedditVideo };
  media?: { reddit_video?: RedditVideo };
};

const WORKER_URL = "https://blue-mode-1265.andhikamarcellafernanda.workers.dev/?url=";

const decodeUrl = (url?: string) => url?.replace(/&amp;/g, "&") ?? "";

const proxiedFetch = async (target: string, init?: RequestInit) => {
  const proxyUrl = `${WORKER_URL}${encodeURIComponent(target)}`;
  const baseHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  } as const;

  const mergedHeaders = {
    ...baseHeaders,
    ...(init?.headers || {}),
  } as Record<string, string>;

  return fetch(proxyUrl, {
    ...init,
    headers: mergedHeaders,
    redirect: "follow",
  });
};

const guessTypeFromUrl = (url: string, fallback: RedditMediaItem["type"]) => {
  if (/v\.redd\.it|\.mp4($|\?)/i.test(url)) return "video" as const;
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
  const ext = guessExtension(
    item.url,
    item.type === "gif" ? "gif" : item.type === "video" ? "mp4" : "jpg",
  );
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
      type: "video",
      width: preview.reddit_video_preview.width,
      height: preview.reddit_video_preview.height,
      poster: items[0]?.url,
    });
  }

  return items;
}

function extractRedditVideo(post: RedditPost): RedditMediaItem[] {
  const items: RedditMediaItem[] = [];
  const video = post.secure_media?.reddit_video || post.media?.reddit_video;
  if (!video?.fallback_url) return items;

  items.push({
    url: decodeUrl(video.fallback_url),
    type: "video",
    width: video.width,
    height: video.height,
    poster: post.preview?.images?.[0]?.source?.url
      ? decodeUrl(post.preview.images[0].source.url)
      : undefined,
  });

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

async function fetchRedditPost(url: string, auth?: RedditAuth): Promise<RedditPost> {
  const trimUrl = url.replace(/\?.*$/, "").replace(/\.json$/, "").replace(/\/$/, "");
  const sessionCookie = auth?.sessionCookie?.trim();
  const headers = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.reddit.com/",
    Cookie: `over18=1;${sessionCookie ? ` ${sessionCookie}` : ""}`,
    ...(auth?.bearerToken ? { Authorization: `Bearer ${auth.bearerToken}` } : {}),
  } as const;

  const resolvedUrl = await (async () => {
    try {
      const res = await proxiedFetch(trimUrl.startsWith("http") ? trimUrl : `https://${trimUrl}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const finalUrl = res.headers.get("x-final-url");
      return finalUrl ? finalUrl.replace(/\/$/, "") : trimUrl;
    } catch {
      return trimUrl;
    }
  })();

  const parsed = (() => {
    try {
      return new URL(resolvedUrl.startsWith("http") ? resolvedUrl : `https://${resolvedUrl}`);
    } catch {
      return null;
    }
  })();

  const path = parsed?.pathname || "";
  const basePath = path ? path.replace(/\/$/, "") : "";

  const postId = (() => {
    const segments = basePath.split("/").filter(Boolean);
    const idFromComments = segments.find((segment, idx) => segments[idx - 1] === "comments");
    const likelyId = idFromComments || segments.find((segment) => /^[a-z0-9]{5,9}$/i.test(segment));
    return likelyId || "";
  })();

  const commentPath = postId ? `/comments/${postId}` : "";

  const candidates = [
    `https://www.reddit.com/api/info.json?raw_json=1&url=${encodeURIComponent(resolvedUrl)}`,
    `${resolvedUrl}.json?raw_json=1`,
    basePath ? `https://old.reddit.com${basePath}.json?raw_json=1` : null,
    basePath ? `https://api.reddit.com${basePath}?raw_json=1` : null,
    commentPath ? `https://www.reddit.com${commentPath}.json?raw_json=1` : null,
    commentPath ? `https://old.reddit.com${commentPath}.json?raw_json=1` : null,
  ].filter(Boolean) as string[];

  let lastError: string | undefined;

  for (const endpoint of candidates) {
    try {
      const res = await proxiedFetch(endpoint, {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        const cleanText = text?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        if (res.status === 403) {
          lastError = "Reddit returned 403 (access blocked). Try a public post or the share link.";
        } else if (res.status === 404) {
          lastError = "Reddit post not found (404).";
        } else {
          const snippet = cleanText ? ` ${cleanText.slice(0, 160)}` : "";
          lastError = `Reddit lookup failed: ${res.status}${snippet}`;
        }
        continue;
      }

      const json = (await res.json()) as RedditListing | RedditListing[];
      const post = Array.isArray(json)
        ? json[0]?.data?.children?.[0]?.data
        : json?.data?.children?.[0]?.data;

      if (post) return post;
    } catch (err) {
      lastError = (err as Error).message;
    }
  }

  throw new Error(lastError || "No Reddit post found for this URL");
}

export async function fetchRedditMedia(url: string, auth?: RedditAuth): Promise<RedditMediaResponse> {
  const post = await fetchRedditPost(url, auth);

  const items: RedditMediaItem[] = [];
  const seen = new Set<string>();
  const pushUnique = (media: RedditMediaItem) => {
    if (!media.url || seen.has(media.url)) return;
    seen.add(media.url);
    items.push(media);
  };

  extractGalleryItems(post).forEach(pushUnique);
  extractPreviewItems(post).forEach(pushUnique);
  extractRedditVideo(post).forEach(pushUnique);
  extractDirectUrl(post).forEach(pushUnique);

  if (!items.length) {
    throw new Error("No downloadable images, GIFs, or videos detected");
  }

  return {
    title: post.title,
    author: post.author,
    items,
  };
}
