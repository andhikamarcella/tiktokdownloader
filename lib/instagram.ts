export type InstagramRapidItem = {
  url: string;
  type: "video" | "image";
  thumbnail?: string;
};

export type InstagramRapidResponse = {
  title?: string;
  author?: string;
  items: InstagramRapidItem[];
  raw?: any;
};

function extractShortcode(url: string) {
  const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([\w\-]+)/);
  return match ? match[1] : null;
}

export async function fetchInstagramMediaScrape(url: string) {
  const shortcode = extractShortcode(url);
  if (!shortcode) throw new Error("Invalid Instagram URL");

  const res = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error("Instagram page fetch failed");
  }

  const html = await res.text();

  const jsonMatch = html.match(/window\._sharedData\s*=\s*(\{.+?\});/);
  if (!jsonMatch) throw new Error("Instagram data not found");

  const data = JSON.parse(jsonMatch[1]);

  return data;
}

export async function fetchInstagramMedia(url: string): Promise<InstagramRapidResponse> {
  const data = await fetchInstagramMediaScrape(url);
  
  // Parse the scraped data
  // Note: This structure might change as Instagram updates their frontend
  const post = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
  if (!post) throw new Error("Invalid Instagram data structure");

  const items: InstagramRapidItem[] = [];

  if (post.edge_sidecar_to_children) {
      // Gallery
      for (const edge of post.edge_sidecar_to_children.edges) {
          const node = edge.node;
          items.push({
              url: node.is_video ? node.video_url : node.display_url,
              type: node.is_video ? "video" : "image",
              thumbnail: node.display_url
          });
      }
  } else {
      // Single item
      items.push({
          url: post.is_video ? post.video_url : post.display_url,
          type: post.is_video ? "video" : "image",
          thumbnail: post.display_url
      });
  }

  return {
      title: post.edge_media_to_caption?.edges?.[0]?.node?.text || "Instagram Post",
      author: post.owner?.username,
      items
  };
}
