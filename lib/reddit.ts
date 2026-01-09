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
  /** Success indicator for the proxy-backed API. */
  success?: boolean;
  /** Normalized media classification for the API consumer. */
  type?: "video" | "image" | "gallery" | "gif" | "unknown";
  /** Structured media references for Viddit-style clients. */
  media?: {
    video: string | null;
    audio: string | null;
    image: string | null;
    gallery: string[];
  };
  resolvedUrl?: string;
  raw?: any;
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
  is_gif?: boolean;
};

type RedditPost = {
  title?: string;
  author?: string;
  permalink?: string;
  url?: string;
  url_overridden_by_dest?: string;
  is_gallery?: boolean;
  media_metadata?: Record<string, RedditGalleryItem>;
  preview?: RedditPreview;
  post_hint?: string;
  secure_media?: { reddit_video?: RedditVideo };
  media?: { reddit_video?: RedditVideo };
};

const WORKER_URL = "https://redditdown.andhikamarcellafernanda.workers.dev/?url=";

const decodeUrl = (url?: string) => url?.replace(/&amp;/g, "&") ?? "";

const stripJsonAndTrailingSlash = (url: string) => url.replace(/\.json($|\?.*)/i, "").replace(/\/$/, "");

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

const extractCanonicalFromHtml = (html: string) => {
  const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
  if (canonicalMatch?.[1]) return canonicalMatch[1];

  const permalinkMatch = html.match(/"permalink"\s*:\s*"([^"]+)"/i);
  if (permalinkMatch?.[1]) return `https://www.reddit.com${permalinkMatch[1]}`;

  return "";
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

const buildAudioUrl = (videoUrl: string) => {
  try {
    const parsed = new URL(videoUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const postId = parts[0];
    if (!postId) return null;
    parsed.pathname = `/${postId}/DASH_audio.mp4`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
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

const galleryUrls = (post: RedditPost) => {
  if (!post.is_gallery || !post.media_metadata) return [] as string[];
  return Object.values(post.media_metadata)
    .map((item) => decodeUrl(item?.s?.gif || item?.s?.u))
    .filter((url): url is string => Boolean(url));
};

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

async function resolveShortlink(url: string, headers: Record<string, string>) {
  const target = stripJsonAndTrailingSlash(url.startsWith("http") ? url : `https://${url}`);
  try {
    const res = await proxiedFetch(target, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Referer: "https://www.reddit.com/",
        ...headers,
      },
    });

    const text = await res.text();
    const canonical = extractCanonicalFromHtml(text);
    if (canonical) return stripJsonAndTrailingSlash(canonical);
  } catch {
    // fall through to default
  }

  return target;
}

const unique = <T,>(list: T[]) => Array.from(new Set(list));

const buildJsonCandidates = (resolvedUrl: string) => {
  const base = stripJsonAndTrailingSlash(resolvedUrl);

  let parsed: URL | null = null;
  try {
    parsed = new URL(base.startsWith("http") ? base : `https://${base}`);
  } catch {
    // if URL parsing fails, fall back to string-based candidates
  }

  const candidates: string[] = [];

  if (parsed) {
    const pathWithQuery = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "");
    const hostNormalized = parsed.hostname.replace(/^old\./, "").replace(/^www\./, "");

    // Canonical + raw JSON
    candidates.push(`https://www.${hostNormalized}${pathWithQuery}.json?raw_json=1`);

    // old.reddit fallback
    candidates.push(`https://old.${hostNormalized}${pathWithQuery}.json?raw_json=1`);

    // comment-based path derived from ID
    const parts = pathWithQuery.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (id) {
      candidates.push(`https://www.reddit.com/comments/${id}.json?raw_json=1`);
      candidates.push(`https://gateway.reddit.com/desktopapi/v1/post/${id}?raw_json=1`);
      candidates.push(`https://www.reddit.com/api/info/?id=t3_${id}&raw_json=1`);
    }
  } else {
    candidates.push(`${base}.json?raw_json=1`);
  }

  return unique(candidates);
};

const parsePostFromJson = (json: RedditListing | RedditListing[] | any): RedditPost | null => {
  // Standard listing arrays
  if (Array.isArray(json)) {
    const fromListing = json[0]?.data?.children?.[0]?.data as RedditPost | undefined;
    if (fromListing) return fromListing;
  }

  // Single listing envelope
  if (json?.data?.children?.[0]?.data) {
    return json.data.children[0].data as RedditPost;
  }

  // Gateway desktop API response
  if (json?.posts && typeof json.posts === "object") {
    const values = Object.values(json.posts) as RedditPost[];
    if (values.length) return values[0];
  }

  // api/info style
  if (json?.data?.children?.length) {
    return json.data.children[0].data as RedditPost;
  }

  return null;
};

async function fetchRedditPost(url: string, auth?: RedditAuth): Promise<RedditPost> {
  const sessionCookie = auth?.sessionCookie?.trim();
  const headers = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.reddit.com/",
    Cookie: `over18=1;${sessionCookie ? ` ${sessionCookie}` : ""}`,
    ...(auth?.bearerToken ? { Authorization: `Bearer ${auth.bearerToken}` } : {}),
  } as const;

  const resolvedUrl = await resolveShortlink(url, headers);
  const candidates = buildJsonCandidates(resolvedUrl);
  const errors: string[] = [];
  let json: RedditListing | RedditListing[] | undefined;

  for (const candidate of candidates) {
    try {
      const res = await proxiedFetch(candidate, {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.text();
        const cleanBody = body?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        const snippet = cleanBody ? ` ${cleanBody.slice(0, 160)}` : "";
        errors.push(`${res.status}${snippet}`.trim());
        continue;
      }

      json = (await res.json()) as RedditListing | RedditListing[];
      const parsedPost = parsePostFromJson(json);
      if (!parsedPost) {
        errors.push("Invalid JSON shape from proxy");
        continue;
      }
      return parsedPost;
    } catch (err) {
      errors.push((err as Error).message || "Unknown proxy error");
    }
  }

  const suffix = errors.length ? ` (${unique(errors).join(" | ")})` : "";
  throw new Error(`Proxy lookup failed after fallbacks${suffix}`);
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

  const redditVideo =
    post.secure_media?.reddit_video || post.media?.reddit_video || post.preview?.reddit_video_preview;
  const fallback = decodeUrl(redditVideo?.fallback_url);
  const gallery = galleryUrls(post);
  const direct = decodeUrl(post.url_overridden_by_dest || post.url || "");
  const previewImage = post.preview?.images?.[0]?.source?.url
    ? decodeUrl(post.preview.images[0].source.url)
    : "";

  const response: RedditMediaResponse = {
    title: post.title,
    author: post.author,
    items,
    resolvedUrl: post.permalink ? `https://www.reddit.com${post.permalink}` : stripJsonAndTrailingSlash(url),
    raw: post,
    success: true,
    type: "unknown",
    media: {
      video: null,
      audio: null,
      image: null,
      gallery: [],
    },
  };

  if (fallback) {
    response.media = {
      video: fallback,
      audio: buildAudioUrl(fallback),
      image: null,
      gallery: [],
    };
    const isGif = Boolean(redditVideo && "is_gif" in redditVideo && redditVideo.is_gif);
    response.type = isGif ? "gif" : "video";
    return response;
  }

  if (gallery.length) {
    response.media = { video: null, audio: null, image: null, gallery };
    response.type = "gallery";
    return response;
  }

  if (direct) {
    response.media = { video: null, audio: null, image: direct, gallery: [] };
    response.type = /\.gif($|\?)/i.test(direct) ? "gif" : "image";
    return response;
  }

  if (previewImage) {
    response.media = { video: null, audio: null, image: previewImage, gallery: [] };
    response.type = "image";
    return response;
  }

  return response;
}
