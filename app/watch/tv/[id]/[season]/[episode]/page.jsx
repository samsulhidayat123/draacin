import Link from "next/link";
import UniversalPlayer from "@/components/UniversalPlayer";
import { createVidSrcEpisodeServers } from "@/lib/vidsrc";
import { searchTmdbTvId, slugToSearchTitle } from "@/lib/tmdb";

function isValidVidSrcId(id) {
  if (!id) return false;

  const value = String(id).trim();

  return /^tt\d+$/i.test(value) || /^\d+$/.test(value);
}

async function resolveTvVidSrcId(id) {
  if (isValidVidSrcId(id)) {
    return String(id).trim();
  }

  const title = slugToSearchTitle(id);
  const tmdbOrImdbId = await searchTmdbTvId(title);

  return tmdbOrImdbId;
}

export default async function TvEpisodeWatchPage({ params }) {
  const { id, season, episode } = await params;

  const safeSeason = Number(season) || 1;
  const safeEpisode = Number(episode) || 1;

  const vidsrcId = await resolveTvVidSrcId(id);
  const servers = createVidSrcEpisodeServers(vidsrcId, safeSeason, safeEpisode);

  const title = `Series ${id} - S${safeSeason}E${safeEpisode}`;
  const playbackStatus = servers.length > 0 ? "available" : "missing_source";

  return (
    <main className="min-h-screen bg-black p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white"
        >
          Back to home
        </Link>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-black md:text-4xl">{title}</h1>

          <span className="rounded-sm border border-zinc-800 px-3 py-1 text-xs font-black uppercase tracking-widest text-zinc-400">
            {playbackStatus}
          </span>
        </div>

        <UniversalPlayer
          servers={servers}
          directSources={[]}
          title={title}
          sourceUrl=""
        />
      </div>
    </main>
  );
}
