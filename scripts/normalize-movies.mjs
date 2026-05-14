import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { MongoClient, ServerApiVersion } from "mongodb";

const VALID_TYPES = new Set(["movie", "series", "kdrama", "anime"]);
const ALLOWED_EMBED_HOSTS = [
  "short.icu",
  "streamtape.com",
  "emturbovid.com",
  "turbovidhls.com",
  "vidoza.net",
  "mxdrop.to",
];
const SERVER_PRIORITY = ["ST", "TVP", "VDZ", "MD", "HYDRAX"];

const CONCURRENCY = 8;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseServers(html) {
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

function hostnameMatches(hostname, allowedHost) {
  return hostname === allowedHost || hostname.endsWith(`.${allowedHost}`);
}

function sanitizeEmbedUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase();
    const allowed = ALLOWED_EMBED_HOSTS.some((host) =>
      hostnameMatches(hostname, host)
    );

    return allowed ? url.href : null;
  } catch {
    return null;
  }
}

function getServerRank(name) {
  const rank = SERVER_PRIORITY.indexOf(String(name).toUpperCase());
  return rank === -1 ? SERVER_PRIORITY.length : rank;
}

function sanitizeServers(servers) {
  return servers
    .map((server) => ({
      name: String(server?.name || "SERVER").replace(/[^\w -]/g, "").slice(0, 24) || "SERVER",
      embedUrl: sanitizeEmbedUrl(server?.embedUrl),
    }))
    .filter((server) => server.embedUrl)
    .sort((a, b) => getServerRank(a.name) - getServerRank(b.name));
}

function normalizeType(type) {
  const normalized = String(type || "movie").trim().toLowerCase();
  return VALID_TYPES.has(normalized) ? normalized : "movie";
}

function requiredFieldsFor(movie) {
  const title = String(
    movie.title ||
      movie.titleOriginal ||
      movie.bookName ||
      movie.name ||
      "Untitled Film"
  ).trim();

  const targetId = String(
    movie.target_id ||
      movie.targetId ||
      movie.id ||
      movie.bookId ||
      movie.tmdbId ||
      movie._id
  ).trim();

  const slug = String(movie.slug || slugify(title) || slugify(targetId)).trim();

  return {
    target_id: targetId,
    slug,
    title,
    type: normalizeType(movie.type),
    source: String(movie.source || "idflix").trim(),
    poster: String(movie.poster || movie.coverWap || "/placeholder.jpg").trim(),
  };
}

async function checkMoviePlayback(movie) {
  if (movie.type !== "movie" || movie.source !== "idflix") {
    return {
      playable: false,
      playbackStatus: "missing_source",
      playbackServers: [],
      playbackSourceUrl: null,
    };
  }

  const sourceUrl = `https://idflix.my.id/watch/movie/${movie.target_id}`;

  try {
    const response = await fetch(sourceUrl, {
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
        playbackSourceUrl: sourceUrl,
      };
    }

    const html = await response.text();
    const servers = parseServers(html);
    const playbackServers = sanitizeServers(servers);

    if (servers.length === 0) {
      return {
        playable: false,
        playbackStatus: "no_server",
        playbackServers: [],
        playbackSourceUrl: sourceUrl,
      };
    }

    if (playbackServers.length === 0) {
      return {
        playable: false,
        playbackStatus: "blocked",
        playbackServers: [],
        playbackSourceUrl: sourceUrl,
      };
    }

    return {
      playable: true,
      playbackStatus: "available",
      playbackServers,
      playbackSourceUrl: sourceUrl,
    };
  } catch {
    return {
      playable: false,
      playbackStatus: "unknown",
      playbackServers: [],
      playbackSourceUrl: sourceUrl,
    };
  }
}

async function worker(queue, collection, summary) {
  while (queue.length > 0) {
    const movie = queue.shift();
    const fields = requiredFieldsFor(movie);
    const playback = await checkMoviePlayback(fields);
    const update = {
      ...fields,
      ...playback,
      lastCheckedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: movie._id },
      { $set: update }
    );

    summary.checked += 1;
    summary.modified += result.modifiedCount;
    summary.byStatus[update.playbackStatus] =
      (summary.byStatus[update.playbackStatus] || 0) + 1;
    summary.byType[update.type] = (summary.byType[update.type] || 0) + 1;
  }
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI belum diatur.");
  }

  const dbName = process.env.MONGODB_DB;
  const collectionName = process.env.MONGODB_COLLECTION || "movies";

  if (!dbName) {
    throw new Error("MONGODB_DB belum diatur.");
  }

  dns.setServers(
    (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean)
  );

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();

    const collection = client.db(dbName).collection(collectionName);
    const movies = await collection.find({}).toArray();
    const queue = [...movies];
    const summary = {
      total: movies.length,
      checked: 0,
      modified: 0,
      byStatus: {},
      byType: {},
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, movies.length) }, () =>
        worker(queue, collection, summary)
      )
    );

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
