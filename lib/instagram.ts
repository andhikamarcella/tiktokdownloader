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
