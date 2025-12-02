import { TikTokMedia } from "../lib/tiktok";

export function exportAsJSON(data: TikTokMedia) {
  return JSON.stringify(data, null, 2);
}

export function exportAsTXT(data: TikTokMedia) {
  const sound = data.sound ? `${data.sound.title} - ${data.sound.artist ?? ""}` : data.music_title ?? "Unknown";
  const author = data.author ? data.author.username : "";
  return `${data.caption}\nHashtags: ${data.hashtags.join(" ")}\nSound: ${sound}\nAuthor: ${author}`;
}

export function exportHashtags(data: TikTokMedia) {
  return data.hashtags.join(" ");
}

export function exportSongInfo(data: TikTokMedia) {
  if (!data.sound && !data.music_title) return "Unknown sound";
  const title = data.sound?.title ?? data.music_title ?? "";
  const artist = data.sound?.artist ?? "";
  const album = data.sound?.album ?? "Single";
  return `${title} · ${artist} (${album})`;
}

export function exportCSV(data: TikTokMedia) {
  const headers = ["caption", "hashtags", "sound", "author", "duration"];
  const row = [
    JSON.stringify(data.caption),
    JSON.stringify(data.hashtags.join(" ")),
    JSON.stringify(exportSongInfo(data)),
    JSON.stringify(`${data.author?.username ?? ""} (${data.author?.nickname ?? ""})`),
    data.duration ?? "",
  ];
  return `${headers.join(",")}\n${row.join(",")}`;
}
