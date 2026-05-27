import Link from "next/link";
import UniversalPlayer from "@/components/UniversalPlayer";
import { checkIdflixEpisodePlayback } from "@/lib/idflixPlayback";
import { getContentByTargetIdAndType } from "@/lib/movies";

function findEpisode(item, seasonNumber, episodeNumber) {
  const episodes = Array.isArray(item?.episodes) ? item.episodes : [];

  return episodes.find((episode) => {
    const sameEpisode = Number(episode.episodeNumber) === Number(episodeNumber);
    const sameSeason = Number(episode.seasonNumber || 1) === Number(seasonNumber || 1);
    return sameEpisode && sameSeason;
  });
}

export default async function EpisodePlayerPage({
  type,
  id,
  season = 1,
  episode,
}) {
  const item = await getContentByTargetIdAndType(id, type).catch((error) => {
    console.error(`Fetch ${type} from MongoDB error:`, error.message);
    return null;
  });

  if (!item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <h1 className="mb-3 text-3xl font-black uppercase">Konten tidak ditemukan</h1>
        <Link
          href="/"
          className="rounded-sm bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-red-500"
        >
          Kembali
        </Link>
      </main>
    );
  }

  const episodeData = findEpisode(item, season, episode);
  const playback = episodeData?.episodeId
    ? await checkIdflixEpisodePlayback(type, episodeData.episodeId)
    : {
        playable: false,
        playbackStatus: "missing_source",
        playbackServers: [],
        sourceUrl: null,
      };
  const backHref = `/${type}/${item.slug}`;
  const title = `${item.title} Episode ${episode}`;

  return (
    <main className="min-h-screen bg-black p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={backHref}
          className="mb-6 inline-flex text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white"
        >
          Back to details
        </Link>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-black md:text-4xl">{title}</h1>
          <span className="rounded-sm border border-zinc-800 px-3 py-1 text-xs font-black uppercase tracking-widest text-zinc-400">
            {playback.playbackStatus}
          </span>
        </div>

        <UniversalPlayer
          servers={playback.playbackServers}
          directSources={[]}
          title={title}
          sourceUrl={playback.sourceUrl}
        />
      </div>
    </main>
  );
}
