// Instagram downloader helpers (SCRAPE + RapidAPI fallback)

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

/* =========================
   UTILITIES
========================= */

const FALLBACK_HOST =
  "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";

function extractShortcode(instaUrl: string): string {
  const match = instaUrl.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
  if (!match) throw new Error("Invalid Instagram URL");
  return match[2];
}

const guessTypeFromUrl = (url: string): "video" | "image" =>
  /\.mp4($|\?)/i.test(url) ? "video" : "image";

/* =========================
   SCRAPING (MAIN)
========================= */

export async function fetchInstagramMediaScrape(
  url: string
): Promise<InstagramRapidResponse> {
  const shortcode = extractShortcode(url);

  const endpoint = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;

  const res = await fetch(endpoint, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Instagram scrape failed: ${res.status}`);
  }

  const json = await res.json();
  const media = json?.graphql?.shortcode_media;
  if (!media) throw new Error("Invalid Instagram response");

  const items: InstagramRapidItem[] = [];

  // Carousel
  if (media.edge_sidecar_to_children?.edges?.length) {
    for (const edge of media.edge_sidecar_to_children.edges) {
      const node = edge.node;
      if (node.is_video) {
        items.push({
          url: node.video_url,
          type: "video",
        });
      } else {
        items.push({
          url: node.display_url,
          type: "image",
        });
      }
    }
  } else {
    // Single post / reel
    if (media.is_video) {
      items.push({
        url: media.video_url,
        type: "video",
      });
    } else {
      items.push({
        url: media.display_url,
        type: "image",
      });
    }
  }

  return {
    items,
    title:
      media.edge_media_to_caption?.edges?.[0]?.node?.text ||
      "Instagram media",
    author: media.owner?.username || "Instagram user",
    raw: json,
  };
}

/* =========================
   RAPIDAPI (FALLBACK)
========================= */

export async function fetchInstagramMediaRapid(
  url: string
): Promise<InstagramRapidResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST || FALLBACK_HOST;

  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  const endpoint = `https://${host}/convert?url=${encodeURIComponent(url)}`;

  const response = await fetch(endpoint, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `RapidAPI failed: ${response.status} ${text}`
    );
  }

  const data = await response.json();
  const record = data as Record<string, any>;

  const candidates =
    record.media ||
    record.items ||
    record.links ||
    record.result ||
    [];

  const items: InstagramRapidItem[] = (Array.isArray(candidates)
    ? candidates
    : [candidates]
  )
    .map((item) => {
      const url =
        item.url ||
        item.link ||
        item.video_url ||
        item.image_url ||
        item.src;
      if (!url) return null;
      return {
        url,
        type:
          item.type === "video" || /\.mp4/.test(url)
            ? "video"
            : "image",
        thumbnail:
          item.thumbnail ||
          item.thumb ||
          item.preview ||
          item.poster,
      };
    })
    .filter(Boolean);

  return {
    items,
    title: record.title || record.caption,
    author: record.author || record.username,
    raw: data,
  };
}

/* =========================
   SAFE WRAPPER (USE THIS)
========================= */

export async function fetchInstagramMedia(
  url: string
): Promise<InstagramRapidResponse> {
  try {
    // MAIN (NO QUOTA)
    return await fetchInstagramMediaScrape(url);
  } catch (err) {
    // FALLBACK (OPTIONAL)
    console.warn("Scrape failed, fallback to RapidAPI");
    return await fetchInstagramMediaRapid(url);
  }
}
