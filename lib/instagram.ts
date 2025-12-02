// Instagram downloader helpers using RapidAPI providers
export type SaveInstaItem = {
  url: string;
  type: "video" | "image";
  thumbnail?: string;
  width?: number;
  height?: number;
};

export type SaveInstaResponse = {
  title?: string;
  author?: string;
  caption?: string;
  username?: string;
  media?: any[];
  result?: any[];
  links?: any[];
  items?: any[];
  url?: string;
};

export type InstagramRapidItem = {
  url: string;
  type: "video" | "image";
  thumbnail?: string;
  width?: number;
  height?: number;
};

export type InstagramRapidResponse = {
  title?: string;
  author?: string;
  items: InstagramRapidItem[];
  raw: unknown;
};

const FALLBACK_HOST = "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";

const guessTypeFromUrl = (url: string): "video" | "image" =>
  /\.mp4($|\?)/i.test(url) || /\/reel\//.test(url) || /\/video\//.test(url) ? "video" : "image";

const normalizeCandidates = (candidate: unknown): InstagramRapidItem[] => {
  if (!candidate) return [];
  const arrayLike = Array.isArray(candidate) ? candidate : [candidate];
  return arrayLike
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { url: item, type: guessTypeFromUrl(item) } satisfies InstagramRapidItem;
      }
      if (typeof item === "object") {
        const record = item as Record<string, unknown>;
        const url =
          typeof record.url === "string"
            ? record.url
            : typeof record.link === "string"
              ? record.link
              : typeof record.downloadUrl === "string"
                ? record.downloadUrl
                : typeof record.download_link === "string"
                  ? record.download_link
                  : typeof record.video === "string"
                    ? record.video
                    : typeof record.video_url === "string"
                      ? record.video_url
                      : typeof record.image_url === "string"
                        ? record.image_url
                        : typeof record.src === "string"
                          ? record.src
                          : undefined;
        if (!url) return null;
        const typeValue = record.type;
        const type: "video" | "image" =
          typeValue === "video" || typeValue === "image" ? typeValue : guessTypeFromUrl(url);
        const thumbValue =
          (typeof record.thumbnail === "string" && record.thumbnail) ||
          (typeof record.thumb === "string" && record.thumb) ||
          (typeof record.preview === "string" && record.preview) ||
          (typeof record.poster === "string" && record.poster) ||
          (typeof record.thumbnail_url === "string" && record.thumbnail_url);
        const thumb = typeof thumbValue === "string" ? thumbValue : undefined;
        return {
          url,
          type,
          thumbnail: thumb,
          width: typeof record.width === "number" ? record.width : undefined,
          height: typeof record.height === "number" ? record.height : undefined,
        } satisfies InstagramRapidItem;
      }
      return null;
    })
    .filter(Boolean) as InstagramRapidItem[];
};

// Normalize SaveInsta responses into a stable shape for the UI
export function normalizeSaveInsta(data: SaveInstaResponse) {
  const candidates =
    (Array.isArray(data.media) && data.media) ||
    (Array.isArray(data.result) && data.result) ||
    (Array.isArray(data.links) && data.links) ||
    (Array.isArray(data.items) && data.items) ||
    (data.url ? [data] : []);

  const items: SaveInstaItem[] = (candidates || [])
    .map((item: any) => {
      const url =
        item.url ||
        item.link ||
        item.downloadUrl ||
        item.video_url ||
        item.image_url ||
        item.src;
      if (!url) return null;
      const isVideo =
        item.type === "video" ||
        item.mediaType === "video" ||
        item.is_video === true ||
        /\.mp4($|\?)/.test(url);
      return {
        url,
        type: isVideo ? "video" : "image",
        thumbnail: item.thumbnail || item.thumb || item.preview || item.poster || item.thumbnail_url,
        width: item.width,
        height: item.height,
      } satisfies SaveInstaItem;
    })
    .filter(Boolean) as SaveInstaItem[];

  return {
    items,
    title: data.title || data.caption || "Instagram media",
    author: data.author || data.username || "Instagram user",
  };
}

export function normalizeRapidInstagram(data: unknown): InstagramRapidResponse {
  const record = (data ?? {}) as Record<string, unknown>;
  const collections = [
    record.media,
    record.result,
    record.items,
    record.links,
    record.data,
    (record.response as Record<string, unknown> | undefined)?.items,
    record.url,
  ];

  const items = collections.flatMap(normalizeCandidates);

  return {
    items,
    title: typeof record.title === "string" ? record.title : typeof record.caption === "string" ? record.caption : undefined,
    author: typeof record.author === "string" ? record.author : typeof record.username === "string" ? record.username : undefined,
    raw: data,
  } satisfies InstagramRapidResponse;
}

// Fetch Instagram media using the configured RapidAPI host
export async function fetchInstagramMedia(url: string): Promise<InstagramRapidResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST || FALLBACK_HOST;

  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  const endpoint = `https://${host}/convert?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RapidAPI request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return normalizeRapidInstagram(data);
}
