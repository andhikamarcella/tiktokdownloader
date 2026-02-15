import type { NextApiRequest, NextApiResponse } from "next";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";
const WORKER_URL = "https://redditdown.andhikamarcellafernanda.workers.dev/?url=";

type MediaType = "video" | "image" | "gallery" | "gif" | "unknown";

type ApiResponse = {
  ok: boolean;
  type: MediaType;
  video: string | null;
  audio: string | null;
  image: string | null;
  gallery: string[];
  resolvedUrl: string;
  raw: any;
  error?: string;
};

const decodeUrl = (value?: string) => value?.replace(/&amp;/g, "&") ?? "";

const ensureAbsolute = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

const proxiedFetch = (target: string, init?: RequestInit) => {
  const proxyUrl = `${WORKER_URL}${encodeURIComponent(target)}`;
  return fetch(proxyUrl, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      ...(init?.headers || {}),
    },
    redirect: "follow",
  });
};

export async function resolveRedditUrl(input: string): Promise<string> {
  const target = ensureAbsolute(input).replace(/\.json($|\?.*)/i, "").replace(/\/$/, "");
  try {
    const res = await proxiedFetch(target, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const finalUrl = res.headers.get("x-final-url");
    return (finalUrl || target).replace(/\/$/, "");
  } catch {
    return target;
  }
}

export async function fetchRedditJSON(postUrl: string) {
  const clean = postUrl.replace(/\.json($|\?.*)/i, "").replace(/\/$/, "");
  const endpoint = `${clean}.json`;

  const res = await proxiedFetch(endpoint, {
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Proxy lookup failed: ${res.status} ${body?.slice(0, 160)}`.trim());
  }

  return res.json();
}

function getPostFromJson(json: any) {
  if (Array.isArray(json)) {
    return json[0]?.data?.children?.[0]?.data;
  }

  return json?.data?.children?.[0]?.data;
}

function buildAudioUrl(videoUrl: string): string | null {
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
    // ignore
  }

  return null;
}

export function extractMedia(json: any, resolvedUrl: string): ApiResponse {
  const post = getPostFromJson(json);

  if (!post) {
    return {
      ok: false,
      type: "unknown",
      video: null,
      audio: null,
      image: null,
      gallery: [],
      resolvedUrl,
      raw: json,
      error: "No post data found",
    };
  }

  const response: ApiResponse = {
    ok: true,
    type: "unknown",
    video: null,
    audio: null,
    image: null,
    gallery: [],
    resolvedUrl: post?.permalink ? `https://www.reddit.com${post.permalink}` : resolvedUrl,
    raw: json,
  };

  const redditVideo =
    post.secure_media?.reddit_video || post.media?.reddit_video || post.preview?.reddit_video_preview;

  const fallback = decodeUrl(redditVideo?.fallback_url);

  if (fallback) {
    response.video = fallback;
    response.audio = buildAudioUrl(fallback);
    response.type = redditVideo?.is_gif ? "gif" : "video";
    return response;
  }

  if (post.is_gallery && post.media_metadata) {
    response.gallery = Object.values(post.media_metadata)
      .map((item: any) => decodeUrl(item?.s?.gif || item?.s?.u))
      .filter((url: string) => Boolean(url));

    if (response.gallery.length) {
      response.type = "gallery";
      return response;
    }
  }

  const direct = decodeUrl(post.url_overridden_by_dest || post.url);
  if (direct) {
    response.image = direct;
    response.type = /\.gif($|\?)/i.test(direct) ? "gif" : "image";
    return response;
  }

  const preview = post.preview?.images?.[0]?.source?.url;
  if (preview) {
    response.image = decodeUrl(preview);
    response.type = "image";
    return response;
  }

  return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      type: "unknown",
      video: null,
      audio: null,
      image: null,
      gallery: [],
      resolvedUrl: "",
      raw: {},
      error: "Method not allowed",
    });
  }

  const urlParam = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  if (!urlParam) {
    return res.status(400).json({
      ok: false,
      type: "unknown",
      video: null,
      audio: null,
      image: null,
      gallery: [],
      resolvedUrl: "",
      raw: {},
      error: "Missing url parameter",
    });
  }

  try {
    const resolvedUrl = await resolveRedditUrl(urlParam);
    const json = await fetchRedditJSON(resolvedUrl);
    const media = extractMedia(json, resolvedUrl);

    if (!media.ok || (media.type === "unknown" && !media.image && !media.video && !media.gallery.length)) {
      return res.status(404).json({ ...media, ok: false, error: "No downloadable media found" });
    }

    return res.status(200).json(media);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      type: "unknown",
      video: null,
      audio: null,
      image: null,
      gallery: [],
      resolvedUrl: "",
      raw: {},
      error: (error as Error).message || "Unexpected error",
    });
  }
}
