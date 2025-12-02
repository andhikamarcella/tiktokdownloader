# TikTok Downloader Pro

Next.js 14 (App Router) Edge-ready TikTok downloader with AI caption tools, music detection, ffmpeg-wasm utilities, thumbnail enhancer, profile bulk downloads, metadata export, and cloud save placeholders.

## Features
- Download TikTok videos tanpa watermark / with watermark and audio-only.
- Auto-detect URLs, video preview, metadata (caption, hashtags, sound, author, duration, HD thumbnail).
- AI caption cleaner, summarizer, translator, style rewrites.
- Music detection via fingerprint placeholder + Spotify & YouTube Music search stubs.
- Video tools: trim, convert (WebM/GIF/60FPS/Live Photo), AI watermark remover via ffmpeg-wasm.
- Thumbnail enhancer selecting best frames with multiple aspect variants.
- Profile tools with bulk selection and downloads.
- Metadata export (JSON, TXT, CSV, caption only, hashtags, song info).
- Smart local-only history, glassmorphism UI, skeletons, and confetti-ready layout.
- Cloud save placeholders: Google Drive, Dropbox, Telegram bot.

## Getting started
1. Install dependencies: `npm install` (or `pnpm install`).
2. Copy `.env.example` to `.env.local` and fill provider credentials.
3. Run dev server: `npm run dev`.
4. Deploy to Vercel/Railway/Render with Edge runtime support.

## API routes
- `/api/tiktok/video` — scrape metadata, audio/video URLs, AI captions.
- `/api/tiktok/profile` — profile info and videos list.
- `/api/tiktok/thumbnail` — best frame picker and variants.
- `/api/tiktok/music` — audio fingerprint + Spotify/YT Music stubs.
- `/api/tiktok/caption` — caption cleaning/summarization/translation.
- `/api/tiktok/cloud` — cloud upload placeholders.
- `/api/tools` — ffmpeg-wasm trim/convert/watermark removal.

## UI routes
- `/downloader`, `/profile`, `/tools/trim`, `/tools/convert`, `/tools/caption-ai`, `/tools/thumbnail`, `/history`.

## Notes
- Scraping and media processing use placeholders; wire to production services or proxies for full functionality.
