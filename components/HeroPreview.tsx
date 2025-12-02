"use client";

import { useEffect, useMemo, useState } from "react";

// Sample media list provided by the user for the landing preview
const sampleMedia = [
  {
    title: "Big Buck Bunny",
    description:
      "A giant rabbit takes comical revenge on three mischievous rodents."
      + " Licensed under Creative Commons Attribution.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    title: "Elephant Dream",
    description: "The first Blender Open Movie from 2006.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    title: "For Bigger Blazes",
    description: "Chromecast showcase spot from Google.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    title: "For Bigger Escape",
    description: "Chromecast online video highlight.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    title: "For Bigger Fun",
    description: "Chromecast demo video for a fun night in.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    title: "For Bigger Joyrides",
    description: "Chromecast highlight for bigger joyrides.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    title: "For Bigger Meltdowns",
    description: "Chromecast spot featuring bigger meltdowns.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
  {
    title: "Sintel",
    description: "Independently produced short film by the Blender Foundation.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
  {
    title: "Subaru Outback On Street And Dirt",
    description: "Subaru Outback review across street and dirt.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  },
  {
    title: "Tears of Steel",
    description: "Crowd-funded sci-fi short by Blender Foundation.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },
  {
    title: "Volkswagen GTI Review",
    description: "Lap review of the VW GTI at Adams Motorsports Park.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  },
  {
    title: "We Are Going On Bullrun",
    description: "Shelby GT500 rally daily video series teaser.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  },
  {
    title: "What car can you get for a grand?",
    description: "Exploring budget car options around $1,000.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  },
];

export default function HeroPreview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPortrait, setIsPortrait] = useState(true);

  const media = useMemo(() => sampleMedia[currentIndex], [currentIndex]);

  // Ensure the aspect resets when switching videos
  useEffect(() => {
    setIsPortrait(true);
  }, [currentIndex]);

  return (
    <div className="glass p-6 rounded-2xl border border-white/10">
      <div
        className={`rounded-xl overflow-hidden bg-black/60 flex items-center justify-center transition-all duration-300 ${
          isPortrait ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <video
          key={media.src}
          className="w-full h-full object-contain"
          src={media.src}
          controls
          loop
          muted
          playsInline
          autoPlay
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            if (video.videoWidth && video.videoHeight) {
              setIsPortrait(video.videoHeight >= video.videoWidth);
            }
          }}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between pt-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{media.title}</p>
          <p className="text-xs text-slate-400 line-clamp-2">{media.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/15 hover:border-white/40 text-sm"
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? sampleMedia.length - 1 : prev - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/15 hover:border-white/40 text-sm"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % sampleMedia.length)}
          >
            Next
          </button>
          <select
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm"
            value={currentIndex}
            onChange={(event) => setCurrentIndex(Number(event.target.value))}
          >
            {sampleMedia.map((item, index) => (
              <option key={item.src} value={index}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-right text-slate-400 mt-2">Preview loop · HD thumb auto-pick · Trim & convert</p>
    </div>
  );
}
