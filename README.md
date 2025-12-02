# TikTok Downloader Pro

Next.js 14 (App Router) Edge-ready TikTok downloader with AI caption tools, music detection, client-side ffmpeg-wasm utilities, Cloudinary thumbnail enhancer, and smart local history.

## Features
- Download TikTok videos tanpa watermark / with watermark and audio-only using TikMate → TikWM → TTSave fallback.
- Auto-detect URLs, video preview, metadata (caption, hashtags, sound, author, duration, HD thumbnail).
- AI caption cleaner, summarizer, translator, style rewrites via Groq & Gemini.
- Music detection via AudD → ACRCloud placeholder → YouTube search fallback.
- Video tools: client-side trim, MP4 → MP3, MP4 → GIF, audio extraction with ffmpeg.wasm (never on the server).
- Thumbnail enhancer selecting best frames with Cloudinary variants.
- Metadata export (JSON, TXT, CSV, caption only, hashtags, song info).
- Smart local-only history, glassmorphism UI.

## Getting started
1. Install dependencies: `npm install` (or `pnpm install`).
2. Copy `.env.example` to `.env.local` and fill provider credentials.
3. Run dev server: `npm run dev`.
4. Deploy to Vercel/Railway/Render with Edge runtime support.

## API routes
- `/api/tiktok/lookup` — TikTok lookup with provider fallback + caption suite, returns `no_wm_url`, `wm_url`, `audio_url`, `thumbnail_url`, `caption`, `hashtags`, `music_title`.
- `/api/ai/clean|summarize|rewrite|translate` — Groq/Gemini caption helpers.
- `/api/music/detect` — AudD-first audio recognition with ACRCloud placeholder then YouTube fallback.
- `/api/convert/audio|gif|trim` — informational endpoints for client ffmpeg usage.
- `/api/thumbnail/generate` — build frame variants (Cloudinary-ready).

## UI routes
- `/` (main downloader), `/tools/trim`, `/tools/convert`, `/tools/caption-ai`, `/tools/thumbnail`, `/history`.

## Notes
- Media processing stays on the client via ffmpeg.wasm; server routes return metadata only.
- Cloudinary integration generates safe thumbnails when credentials are provided.
