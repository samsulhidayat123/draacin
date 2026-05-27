const VIDSRC_DOMAINS = [
  "https://vidsrc-embed.ru",
  "https://vidsrc-embed.su",
  "https://vidsrcme.ru",
  "https://vidsrcme.su",
  "https://vidsrc-me.ru",
  "https://vidsrc-me.su",
  "https://vsrc.su",
];

function isValidExternalId(id) {
  if (!id) return false;

  const value = String(id).trim();

  if (/^tt\d+$/i.test(value)) return true;
  if (/^\d+$/.test(value)) return true;

  return false;
}

export function createVidSrcMovieServers(id) {
  if (!isValidExternalId(id)) return [];

  const safeId = encodeURIComponent(String(id).trim());

  return VIDSRC_DOMAINS.map((domain, index) => ({
    name: `VIDSRC ${index + 1}`,
    embedUrl: `${domain}/embed/movie/${safeId}?autoplay=0`,
  }));
}

export function createVidSrcEpisodeServers(id, season = 1, episode = 1) {
  if (!isValidExternalId(id)) return [];

  const safeId = encodeURIComponent(String(id).trim());
  const safeSeason = Number(season) || 1;
  const safeEpisode = Number(episode) || 1;

  return VIDSRC_DOMAINS.map((domain, index) => ({
    name: `VIDSRC ${index + 1}`,
    embedUrl: `${domain}/embed/tv/${safeId}/${safeSeason}-${safeEpisode}?autoplay=0&autonext=1`,
  }));
}
