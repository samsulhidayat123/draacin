import { sortServers } from "@/lib/playerSecurity";

export function getIdflixMovieSourceUrl(targetId) {
  return `https://idflix.my.id/watch/movie/${targetId}`;
}

export function getIdflixDetailUrl(item) {
  if (!item?.slug || !item?.type) return null;
  if (!["anime", "kdrama", "series"].includes(item.type)) return null;

  return `https://idflix.my.id/${item.type}/${item.slug}`;
}

export function getIdflixEpisodeWatchPath(type, episodeId) {
  if (type === "series") return `/watch/episode/${episodeId}`;
  if (type === "kdrama") return `/watch/kdrama/episode/${episodeId}`;
  if (type === "anime") return `/watch/anime/episode/${episodeId}`;
  return null;
}

export function getIdflixEpisodeWatchUrl(type, episodeId) {
  const path = getIdflixEpisodeWatchPath(type, episodeId);
  return path ? `https://idflix.my.id${path}` : null;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function parseIdflixServers(html) {
  const servers = [];
  const patterns = [
    /\\"name\\":\\"([^"]+)\\"[^{]+?\\"embedUrl\\":\\"([^"]+)\\"/g,
    /"name":"([^"]+)"[^{]+?"embedUrl":"([^"]+)"/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      servers.push({
        name: decodeHtml(match[1].replaceAll("\\/", "/")),
        embedUrl: decodeHtml(match[2].replaceAll("\\/", "/")),
      });
    }

    if (servers.length > 0) return servers;
  }

  const iframe = html.match(/<iframe[^>]+src="([^"]+)"/);
  if (iframe) {
    return [{ name: "SERVER", embedUrl: decodeHtml(iframe[1]) }];
  }

  return servers;
}

export function parseIdflixTitle(html) {
  const title = html.match(/<title>(.*?)<\/title>/);
  if (!title) return null;

  return decodeHtml(title[1])
    .replace(/^Watch\s+/i, "")
    .replace(/\s+\|\s+IDFLIX$/i, "");
}

export function parseIdflixEpisodes(html, type) {
  const pattern =
    type === "series"
      ? /watch\/episode\/(\d+)/g
      : new RegExp(`watch/${type}/episode/(\\d+)`, "g");
  const seen = new Set();
  const episodes = [];

  for (const match of html.matchAll(pattern)) {
    const episodeId = match[1];
    if (seen.has(episodeId)) continue;

    seen.add(episodeId);
    episodes.push({
      episodeId,
      episodeNumber: episodes.length + 1,
      seasonNumber: 1,
      title: `Episode ${episodes.length + 1}`,
      watchPath: getIdflixEpisodeWatchPath(type, episodeId),
      playable: null,
      playbackStatus: "unknown",
      playbackServers: [],
    });
  }

  return episodes;
}

export async function getIdflixEpisodes(item) {
  const sourceUrl = getIdflixDetailUrl(item);

  if (!sourceUrl) {
    return {
      episodes: [],
      episodeStatus: "missing_source",
      episodeSourceUrl: null,
    };
  }

  try {
    const response = await fetch(sourceUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://idflix.my.id/",
      },
    });

    if (!response.ok) {
      return {
        episodes: [],
        episodeStatus: "missing_source",
        episodeSourceUrl: sourceUrl,
      };
    }

    const html = await response.text();
    const episodes = parseIdflixEpisodes(html, item.type);

    return {
      episodes,
      episodeStatus: episodes.length > 0 ? "available" : "no_episode",
      episodeSourceUrl: sourceUrl,
    };
  } catch {
    return {
      episodes: [],
      episodeStatus: "unknown",
      episodeSourceUrl: sourceUrl,
    };
  }
}

export async function checkIdflixEpisodePlayback(type, episodeId) {
  const sourceUrl = getIdflixEpisodeWatchUrl(type, episodeId);

  if (!sourceUrl) {
    return {
      playable: false,
      playbackStatus: "missing_source",
      playbackServers: [],
      title: null,
      sourceUrl: null,
    };
  }

  try {
    const response = await fetch(sourceUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://idflix.my.id/",
      },
    });

    if (!response.ok) {
      return {
        playable: false,
        playbackStatus: "missing_source",
        playbackServers: [],
        title: null,
        sourceUrl,
      };
    }

    const html = await response.text();
    const rawServers = parseIdflixServers(html);
    const playbackServers = sortServers(rawServers);

    if (rawServers.length === 0) {
      return {
        playable: false,
        playbackStatus: "no_server",
        playbackServers: [],
        title: parseIdflixTitle(html),
        sourceUrl,
      };
    }

    if (playbackServers.length === 0) {
      return {
        playable: false,
        playbackStatus: "blocked",
        playbackServers: [],
        title: parseIdflixTitle(html),
        sourceUrl,
      };
    }

    return {
      playable: true,
      playbackStatus: "available",
      playbackServers,
      title: parseIdflixTitle(html),
      sourceUrl,
    };
  } catch {
    return {
      playable: false,
      playbackStatus: "unknown",
      playbackServers: [],
      title: null,
      sourceUrl,
    };
  }
}

export async function checkIdflixMoviePlayback(targetId) {
  if (!targetId) {
    return {
      playable: false,
      playbackStatus: "missing_source",
      playbackServers: [],
      title: null,
      sourceUrl: null,
    };
  }

  const sourceUrl = getIdflixMovieSourceUrl(targetId);

  try {
    const response = await fetch(sourceUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://idflix.my.id/",
      },
    });

    if (!response.ok) {
      return {
        playable: false,
        playbackStatus: "missing_source",
        playbackServers: [],
        title: null,
        sourceUrl,
      };
    }

    const html = await response.text();
    const rawServers = parseIdflixServers(html);
    const playbackServers = sortServers(rawServers);

    if (rawServers.length === 0) {
      return {
        playable: false,
        playbackStatus: "no_server",
        playbackServers: [],
        title: parseIdflixTitle(html),
        sourceUrl,
      };
    }

    if (playbackServers.length === 0) {
      return {
        playable: false,
        playbackStatus: "blocked",
        playbackServers: [],
        title: parseIdflixTitle(html),
        sourceUrl,
      };
    }

    return {
      playable: true,
      playbackStatus: "available",
      playbackServers,
      title: parseIdflixTitle(html),
      sourceUrl,
    };
  } catch {
    return {
      playable: false,
      playbackStatus: "unknown",
      playbackServers: [],
      title: null,
      sourceUrl,
    };
  }
}
