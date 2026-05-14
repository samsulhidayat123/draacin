"use client";

import { useMemo, useState } from "react";
import { sanitizeSourceUrl, sortServers } from "@/lib/playerSecurity";

function normalizeServers(servers) {
  const seen = new Set();

  return sortServers(servers)
    .filter((server) => {
      if (seen.has(server.embedUrl)) return false;
      seen.add(server.embedUrl);
      return true;
    });
}

export default function ServerPlayer({ servers, title, sourceUrl }) {
  const playableServers = useMemo(() => normalizeServers(servers), [servers]);
  const safeSourceUrl = useMemo(() => sanitizeSourceUrl(sourceUrl), [sourceUrl]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeServer = playableServers[activeIndex];

  if (!activeServer) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-[#111] p-6 text-center">
        <p className="text-lg font-bold text-white">Player tidak tersedia</p>
        <p className="max-w-xl text-sm text-gray-400">
          Tidak ada server video yang bisa dimuat untuk film ini.
        </p>
        {safeSourceUrl && (
          <a
            href={safeSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-500"
          >
            Buka sumber
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-800 bg-black">
      <div className="aspect-video w-full bg-black">
        <iframe
          key={activeServer.embedUrl}
          src={activeServer.embedUrl}
          title={`${title} - ${activeServer.name}`}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-forms allow-presentation allow-same-origin allow-scripts"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-900 bg-[#111] px-4 py-3">
        {playableServers.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-gray-400">Servers:</span>
            {playableServers.map((server, index) => (
              <button
                key={`${server.name}-${server.embedUrl}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-sm px-3 py-1 text-xs font-bold transition-colors ${
                  index === activeIndex
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {server.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Server: {activeServer.name}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {activeIndex < playableServers.length - 1 && (
            <button
              type="button"
              onClick={() => setActiveIndex((index) => index + 1)}
              className="rounded-sm bg-gray-800 px-3 py-1 text-xs font-bold text-gray-300 hover:bg-gray-700"
            >
              Coba server lain
            </button>
          )}

          <a
            href={activeServer.embedUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-sm bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500"
          >
            Buka server
          </a>
        </div>
      </div>
    </div>
  );
}
