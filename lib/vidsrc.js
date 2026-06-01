const VIDSRC_DOMAINS = [
  { url: "https://vidsrc-embed.ru", name: "VIDSRC RU" },
  { url: "https://vidsrc-embed.su", name: "VIDSRC SU" },
  { url: "https://vidsrcme.ru", name: "VIDSRCME RU" },
  { url: "https://vidsrcme.su", name: "VIDSRCME SU" },
  { url: "https://vidsrc-me.ru", name: "VIDSRC-ME RU" },
  { url: "https://vidsrc-me.su", name: "VIDSRC-ME SU" },
  { url: "https://vsrc.su", name: "VSRC SU" },
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

  return VIDSRC_DOMAINS.map(({ url, name }) => ({
    name,
    embedUrl: `${url}/embed/movie/${safeId}?autoplay=0`,
  }));
}

export function createVidSrcEpisodeServers(id, season = 1, episode = 1) {
  if (!isValidExternalId(id)) return [];

  const safeId = encodeURIComponent(String(id).trim());
  const safeSeason = Number(season) || 1;
  const safeEpisode = Number(episode) || 1;

  return VIDSRC_DOMAINS.map(({ url, name }) => ({
    name,
    embedUrl: `${url}/embed/tv/${safeId}/${safeSeason}-${safeEpisode}?autoplay=0&autonext=1`,
  }));
}
