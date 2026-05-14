const TYPE_FROM_PATH = {
  anime: "anime",
  kdrama: "kdrama",
  movie: "movie",
  series: "series",
};

function decodeJsonString(value) {
  return String(value || "")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\u0026/g, "&");
}

function slugFromUrl(url) {
  const parsed = new URL(url);
  const [, type, slug] = parsed.pathname.split("/");

  return {
    type: TYPE_FROM_PATH[type],
    slug,
  };
}

function parseJsonLd(html) {
  const match = html.match(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function parseTargetId(html, type) {
  const patterns = [
    type === "movie" ? /watch\/movie\/(\d+)/ : null,
    type === "series" ? /watch\/series\/(\d+)/ : null,
    type === "anime" ? /watch\/anime\/(\d+)/ : null,
    type === "kdrama" ? /watch\/kdrama\/episode\/(\d+)/ : null,
    /"id":(\d+)/,
    /\\"id\\":(\d+)/,
  ].filter(Boolean);

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function parseYear(value) {
  if (!value) return null;
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? year : null;
}

function parseRating(jsonLd) {
  const rating = Number(jsonLd?.aggregateRating?.ratingValue || 0);
  return Number.isFinite(rating) ? rating : 0;
}

function parseEpisodeCount(html) {
  const match =
    html.match(/\\"totalEpisodes\\":(\d+)/) ||
    html.match(/"totalEpisodes":(\d+)/) ||
    html.match(/Episodes \(<!-- -->(\d+)/);

  return match ? Number(match[1]) : null;
}

function parseSeasonCount(html) {
  const match =
    html.match(/\\"totalSeasons\\":(\d+)/) ||
    html.match(/"totalSeasons":(\d+)/) ||
    html.match(/\\"seasons\\":(\d+)/) ||
    html.match(/"seasons":(\d+)/);

  return match ? Number(match[1]) : null;
}

export async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://idflix.my.id/",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function scanIdflixSitemap() {
  const xml = await fetchText("https://idflix.my.id/sitemap.xml");
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  return urls
    .map((url) => {
      try {
        const parsed = slugFromUrl(url);
        if (!parsed.type || !parsed.slug) return null;

        return {
          source: "idflix",
          type: parsed.type,
          slug: parsed.slug,
          url,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function fetchIdflixCatalogItem(entry) {
  const html = await fetchText(entry.url);
  const jsonLd = parseJsonLd(html) || {};
  const targetId = parseTargetId(html, entry.type);

  if (!targetId) {
    throw new Error("target_id tidak ditemukan");
  }

  return {
    source: "idflix",
    type: entry.type,
    target_id: String(targetId),
    slug: entry.slug,
    title: decodeJsonString(jsonLd.name || entry.slug.replace(/-/g, " ")),
    titleOriginal: null,
    poster: decodeJsonString(jsonLd.image || "/placeholder.jpg"),
    releaseDate: jsonLd.datePublished ? new Date(jsonLd.datePublished) : null,
    year: parseYear(jsonLd.datePublished),
    genres: Array.isArray(jsonLd.genre) ? jsonLd.genre : [],
    rating: parseRating(jsonLd),
    quality: null,
    network: null,
    status: null,
    season: null,
    seasons: parseSeasonCount(html),
    totalEpisodes: parseEpisodeCount(html),
    catalogUrl: entry.url,
    catalogSyncedAt: new Date(),
  };
}
