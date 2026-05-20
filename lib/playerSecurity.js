export const SERVER_PRIORITY = ["ST", "TVP", "VDZ", "MD", "HYDRAX"];

const ALLOWED_EMBED_HOSTS = [
  "short.icu",
  "streamtape.com",
  "emturbovid.com",
  "turbovidhls.com",
  "vidoza.net",
  "mxdrop.to",
];

const ALLOWED_VIDEO_HOSTS = [
  "dramaboxdb.com",
];

function hostnameMatches(hostname, allowedHost) {
  return hostname === allowedHost || hostname.endsWith(`.${allowedHost}`);
}

function toSafeHttpsUrl(value, allowedHosts) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase();
    const allowed = allowedHosts.some((host) => hostnameMatches(hostname, host));

    return allowed ? url.href : null;
  } catch {
    return null;
  }
}

export function sanitizeEmbedUrl(value) {
  return toSafeHttpsUrl(value, ALLOWED_EMBED_HOSTS);
}

export function sanitizeVideoUrl(value) {
  return toSafeHttpsUrl(value, ALLOWED_VIDEO_HOSTS);
}

export function sanitizeSourceUrl(value) {
  return toSafeHttpsUrl(value, ["idflix.my.id", "themoviedb.org", "image.tmdb.org"]);
}

export function sanitizeServers(servers) {
  if (!Array.isArray(servers)) return [];

  return servers
    .map((server) => ({
      name: String(server?.name || "SERVER").replace(/[^\w -]/g, "").slice(0, 24) || "SERVER",
      embedUrl: sanitizeEmbedUrl(server?.embedUrl),
    }))
    .filter((server) => server.embedUrl);
}

export function getServerRank(name) {
  const rank = SERVER_PRIORITY.indexOf(String(name).toUpperCase());
  return rank === -1 ? SERVER_PRIORITY.length : rank;
}

export function sortServers(servers) {
  return [...sanitizeServers(servers)].sort(
    (a, b) => getServerRank(a.name) - getServerRank(b.name)
  );
}
