import Link from "next/link";
import ServerPlayer from "@/components/ServerPlayer";
import { checkIdflixMoviePlayback, getIdflixMovieSourceUrl } from "@/lib/idflixPlayback";
import { getMovieByTargetId } from "@/lib/movies";

async function getLocalMovie(id) {
  return getMovieByTargetId(id).catch((error) => {
    console.error("Fetch movie from MongoDB error:", error.message);
    return null;
  });
}

async function getWatchData(id, movie) {
  const storedServers = Array.isArray(movie?.playbackServers)
    ? movie.playbackServers
    : [];

  if (storedServers.length > 0) {
    return {
      servers: storedServers,
      playbackStatus: movie.playbackStatus || "available",
      title: movie.title || null,
      sourceUrl: movie.playbackSourceUrl || getIdflixMovieSourceUrl(id),
    };
  }

  const live = await checkIdflixMoviePlayback(id);

  return {
    servers: live.playbackServers,
    playbackStatus: live.playbackStatus,
    title: live.title,
    sourceUrl: live.sourceUrl,
  };
}

export default async function MovieWatchPage({ params }) {
  const { id } = await params;
  const movie = await getLocalMovie(id);
  const watchData = await getWatchData(id, movie);

  const title = movie?.title || watchData.title || `Movie ${id}`;
  const backHref = movie?.slug ? `/movie/${movie.slug}` : "/";

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
            {watchData.playbackStatus}
          </span>
        </div>

        <ServerPlayer
          servers={watchData.servers}
          title={title}
          sourceUrl={watchData.sourceUrl}
        />
      </div>
    </main>
  );
}
