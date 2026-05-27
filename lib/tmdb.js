function getTmdbConfig() {
  return {
    apiKey:
      process.env.TMDB_API_KEY ||
      process.env.NEXT_PUBLIC_TMDB_API_KEY ||
      null,
  };
}

export function slugToSearchTitle(value) {
  if (!value) return null;

  return String(value)
    .trim()
    .replace(/^cineb-/i, "")
    .replace(/^movie-/i, "")
    .replace(/^film-/i, "")
    .replace(/^tv-/i, "")
    .replace(/^series-/i, "")
    .replace(/-[a-z0-9]{6,}$/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getTmdbMovieExternalIds(tmdbId) {
  const { apiKey } = getTmdbConfig();

  if (!tmdbId || !apiKey) return null;

  try {
    const url = new URL(
      `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids`
    );

    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error(
        "TMDB external_ids error:",
        response.status,
        response.statusText
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("TMDB external_ids failed:", error.message);
    return null;
  }
}

export async function searchTmdbMovieId(query) {
  const { apiKey } = getTmdbConfig();

  if (!query || !apiKey) return null;

  try {
    const url = new URL("https://api.themoviedb.org/3/search/movie");

    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error("TMDB search error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const firstResult = data?.results?.[0];

    if (!firstResult?.id) return null;

    const tmdbId = String(firstResult.id);
    const externalIds = await getTmdbMovieExternalIds(tmdbId);
    const imdbId = externalIds?.imdb_id;

    if (imdbId && /^tt\d+$/i.test(imdbId)) {
      console.log("TMDB resolved IMDb ID:", {
        query,
        tmdbId,
        imdbId,
      });

      return imdbId;
    }

    console.log("TMDB fallback uses TMDB ID:", {
      query,
      tmdbId,
    });

    return tmdbId;
  } catch (error) {
    console.error("TMDB search failed:", error.message);
    return null;
  }
}


async function getTmdbTvExternalIds(tmdbId) {
  const { apiKey } = getTmdbConfig();

  if (!tmdbId || !apiKey) return null;

  try {
    const url = new URL(
      `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids`
    );

    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error("TMDB TV external_ids error:", response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("TMDB TV external_ids failed:", error.message);
    return null;
  }
}

export async function searchTmdbTvId(query) {
  const { apiKey } = getTmdbConfig();

  if (!query || !apiKey) return null;

  try {
    const url = new URL("https://api.themoviedb.org/3/search/tv");

    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error("TMDB TV search error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const firstResult = data?.results?.[0];

    if (!firstResult?.id) return null;

    const tmdbId = String(firstResult.id);
    const externalIds = await getTmdbTvExternalIds(tmdbId);
    const imdbId = externalIds?.imdb_id;

    if (imdbId && /^tt\d+$/i.test(imdbId)) {
      console.log("TMDB TV resolved IMDb ID:", {
        query,
        tmdbId,
        imdbId,
      });

      return imdbId;
    }

    console.log("TMDB TV fallback uses TMDB ID:", {
      query,
      tmdbId,
    });

    return tmdbId;
  } catch (error) {
    console.error("TMDB TV search failed:", error.message);
    return null;
  }
}
