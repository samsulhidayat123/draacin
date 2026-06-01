import Link from "next/link";
import UniversalPlayer from "@/components/UniversalPlayer";
import {
  checkIdflixMoviePlayback,
  getIdflixMovieSourceUrl,
} from "@/lib/idflixPlayback";
import { getMovieByTargetId } from "@/lib/movies";
import { createVidSrcMovieServers } from "@/lib/vidsrc";
import { searchTmdbMovieId, slugToSearchTitle } from "@/lib/tmdb";
import { sortServers } from "@/lib/playerSecurity";

function isValidVidSrcId(id) {
  if (!id) return false;

  const value = String(id).trim();

  return /^tt\d+$/i.test(value) || /^\d+$/.test(value);
}

async function getVidSrcMovieId(id, movie, slug) {
  const candidates = [
    movie?.vidsrcId,
    movie?.vidsrc_id,
    movie?.vidsrcID,

    movie?.imdbId,
    movie?.imdb_id,
    movie?.imdbID,

    movie?.tmdbId,
    movie?.tmdb_id,
    movie?.tmdbID,

    movie?.themoviedbId,
    movie?.themoviedb_id,

    movie?.externalIds?.imdbId,
    movie?.externalIds?.tmdbId,
    movie?.externalIds?.imdb_id,
    movie?.externalIds?.tmdb_id,

    movie?.external_ids?.imdbId,
    movie?.external_ids?.tmdbId,
    movie?.external_ids?.imdb_id,
    movie?.external_ids?.tmdb_id,

    movie?.ids?.imdb,
    movie?.ids?.tmdb,

    id,
  ];

  const directId = candidates.find(isValidVidSrcId);

  if (directId) {
    return String(directId).trim();
  }

  const titleCandidates = [
    movie?.title,
    movie?.name,
    movie?.originalTitle,
    movie?.original_title,
    movie?.slug,
    slug,
    id,
  ]
    .map(slugToSearchTitle)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  for (const title of titleCandidates) {
    const tmdbId = await searchTmdbMovieId(title);

    if (tmdbId) {
      console.log("Resolved TMDB ID for VidSrc:", {
        title,
        tmdbId,
        routeId: id,
      });

      return tmdbId;
    }
  }

  console.warn("VidSrc/TMDB ID tidak ditemukan:", {
    routeId: id,
    slug,
    title: movie?.title,
    titleCandidates,
  });

  return null;
}

function directSourcesOf(movie) {
  if (!movie) return [];

  const candidates = [
    ["STREAM", movie.stream_url || movie.streamUrl],
    ["FILE", movie.file_url || movie.fileUrl],
    ["VIDEO", movie.video_url || movie.videoUrl],
    ["MP4", movie.mp4_url || movie.mp4Url],
    ["HLS", movie.hls_url || movie.hlsUrl],
  ];

  return candidates
    .filter(([, url]) => url)
    .map(([name, url]) => ({ name, url }));
}

function mergeServers(...serverGroups) {
  const seen = new Set();

  return serverGroups
    .flat()
    .filter(Boolean)
    .filter((server) => {
      const key = server.embedUrl || server.url || server.name;

      if (!key || seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

async function getLocalMovieByAny(id, slug) {
  const candidates = [id, slug].filter(Boolean);

  for (const candidate of candidates) {
    const movie = await getMovieByTargetId(candidate).catch((error) => {
      console.error("Fetch movie from MongoDB error:", error.message);
      return null;
    });

    if (movie) return movie;
  }

  return null;
}

async function getWatchData(id, movie, slug) {
  const storedServers = Array.isArray(movie?.playbackServers)
    ? movie.playbackServers
    : [];

  const vidsrcMovieId = await getVidSrcMovieId(id, movie, slug);
  const vidsrcServers = createVidSrcMovieServers(vidsrcMovieId);

  if (storedServers.length > 0) {
    const servers = sortServers(mergeServers(storedServers, vidsrcServers));

    return {
      servers,
      directSources: directSourcesOf(movie),
      playbackStatus: movie.playbackStatus || "available",
      title: movie.title || null,
      sourceUrl: movie.playbackSourceUrl || getIdflixMovieSourceUrl(id),
    };
  }

  const live = await checkIdflixMoviePlayback(id).catch((error) => {
    console.error("Check Idflix playback error:", error.message);

    return {
      playbackServers: [],
      playbackStatus: "fallback_vidsrc",
      title: null,
      sourceUrl: getIdflixMovieSourceUrl(id),
    };
  });

  const servers = sortServers(mergeServers(live.playbackServers || [], vidsrcServers));

  return {
    servers,
    directSources: directSourcesOf(movie),
    playbackStatus:
      servers.length > 0
        ? live.playbackStatus === "missing_source"
          ? "available"
          : live.playbackStatus || "available"
        : "missing_source",
    title: movie?.title || live.title,
    sourceUrl: live.sourceUrl || getIdflixMovieSourceUrl(id),
  };
}

export default async function MovieWatchPage({ params, searchParams }) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const slug = query?.slug;

  const movie = await getLocalMovieByAny(id, slug);
  const watchData = await getWatchData(id, movie, slug);

  const title = movie?.title || watchData.title || `Movie ${id}`;
  const backHref = movie?.slug ? `/film_indo/${movie.slug}` : "/";

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

        <UniversalPlayer
          servers={watchData.servers}
          directSources={watchData.directSources}
          title={title}
          sourceUrl={watchData.sourceUrl}
        />
      </div>
    </main>
  );
}
