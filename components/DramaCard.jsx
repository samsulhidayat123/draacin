// components/DramaCard.jsx

import Link from "next/link";
import { getContentHref, getTypeLabel } from "@/lib/contentRoutes";
import { getPosterUrl } from "@/lib/poster";

function episodeCountOf(drama) {
  if (Array.isArray(drama?.episodes)) return drama.episodes.length;

  const count = Number(drama?.totalEpisodes || drama?.chapterCount || 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

export default function DramaCard({ drama }) {

  const poster = getPosterUrl(drama.poster, "/placeholder.png");
  const title = drama.title || drama.bookName || "Untitled Film";
  const href = getContentHref(drama);
  const typeLabel = getTypeLabel(drama.type);
  const isMovieLike = ["movie", "film_indo"].includes(drama.type);
  const episodeCount = episodeCountOf(drama);
  const serverCount = Array.isArray(drama.playbackServers)
    ? drama.playbackServers.length
    : 0;
  const canPlay =
    isMovieLike
      ? drama.playable === true || serverCount > 0 || Boolean(drama.playbackTargetId)
      : episodeCount > 0 || drama.playable === true;
  const statusLabel = canPlay ? "Bisa Play" : "Belum Tersedia";

  return (
    <Link href={href} className="group block">
      
      <article className="relative overflow-hidden rounded-sm bg-[#181818] shadow-[0_12px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:ring-white/20">

        {/* Poster */}
        <div className="relative aspect-[2/3] w-full">

          <img
            src={poster}
            alt={title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:brightness-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-70" />

          <span
            className={`absolute left-2 top-2 max-w-[calc(100%-4.5rem)] truncate rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow sm:px-2 sm:text-[10px] ${
              canPlay ? "bg-emerald-600" : "bg-zinc-700"
            }`}
          >
            {statusLabel}
          </span>

          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-sm bg-black/80 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-200 ring-1 ring-white/10">
            {drama.quality || typeLabel}
          </span>

          <span className="absolute right-2 top-2 max-w-16 truncate rounded-sm bg-black/75 px-1.5 py-0.5 text-[9px] font-black uppercase text-zinc-200 ring-1 ring-white/10 sm:px-2 sm:text-[10px]">
            {typeLabel}
          </span>

        </div>

        {/* Info */}
        <div className="p-2.5">
          
          <h3 className="line-clamp-2 min-h-8 break-words text-xs font-bold leading-4 text-white transition-colors group-hover:text-red-500 md:text-sm md:leading-5">
            {title}
          </h3>

          <div className="mt-2 flex min-h-5 flex-wrap items-center gap-1.5">
            <span className="rounded-sm bg-zinc-900 px-1.5 py-0.5 text-[10px] font-black uppercase text-zinc-400">
              {isMovieLike ? "Movie" : "Episode"}
            </span>
            <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {episodeCount > 0
                ? `${episodeCount} eps`
                : drama.tags?.[0] || drama.genres?.[0] || "Katalog"}
            </span>
          </div>

        </div>

      </article>

    </Link>
  );
}
