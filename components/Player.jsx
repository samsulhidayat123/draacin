"use client";

import { sanitizeEmbedUrl } from "@/lib/playerSecurity";

export default function Player({ url }) {
  const safeUrl = sanitizeEmbedUrl(url);

  if (!safeUrl) {
    return (
      <div className="mx-auto flex aspect-video w-full max-w-6xl items-center justify-center rounded-lg bg-[#111] p-6 text-center text-sm font-bold text-gray-300">
        Player diblokir karena sumber video tidak aman.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-xl">

      <iframe
        src={safeUrl}
        title="Video player"
        className="w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-presentation allow-same-origin allow-scripts"
      />

    </div>
  );
}
