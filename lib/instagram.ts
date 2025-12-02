// Instagram downloader helpers using SaveInsta RapidAPI
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
  media?: any[];
  result?: any[];
  links?: any[];
  items?: any[];
  url?: string;
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
