import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { MongoClient, ServerApiVersion } from "mongodb";

const TYPES = new Set(["series", "kdrama", "anime"]);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (!process.env[key]) {
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
}

function getDetailUrl(item) {
  return `https://idflix.my.id/${item.type}/${item.slug}`;
}

function getWatchPath(type, episodeId) {
  if (type === "series") return `/watch/episode/${episodeId}`;
  return `/watch/${type}/episode/${episodeId}`;
}

function parseEpisodes(html, type) {
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
      watchPath: getWatchPath(type, episodeId),
      playable: null,
      playbackStatus: "unknown",
      playbackServers: [],
    });
  }

  return episodes;
}

function parseSeriesEpisodeCount(html, fallbackCount) {
  const seasonCountsMatch = html.match(/\\"seasonCounts\\":(\{[^}]+\})/);
  if (!seasonCountsMatch) return fallbackCount;

  try {
    const counts = JSON.parse(seasonCountsMatch[1].replace(/\\"/g, '"'));
    const total = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0);
    return total > 0 ? total : fallbackCount;
  } catch {
    return fallbackCount;
  }
}

function expandSeriesEpisodes(html, seeds) {
  if (seeds.length === 0) return [];

  const firstId = Number(seeds[0].episodeId);
  const total = parseSeriesEpisodeCount(html, seeds.length);

  if (!Number.isFinite(firstId) || total <= seeds.length) {
    return seeds;
  }

  return Array.from({ length: total }, (_, index) => {
    const episodeId = String(firstId + index);

    return {
      episodeId,
      episodeNumber: index + 1,
      seasonNumber: 1,
      title: `Episode ${index + 1}`,
      watchPath: getWatchPath("series", episodeId),
      playable: null,
      playbackStatus: "unknown",
      playbackServers: [],
    };
  });
}

async function fetchEpisodes(item) {
  const episodeSourceUrl = getDetailUrl(item);

  try {
    const response = await fetch(episodeSourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://idflix.my.id/",
      },
    });

    if (!response.ok) {
      return {
        episodes: [],
        episodeStatus: "missing_source",
        episodeSourceUrl,
      };
    }

    const html = await response.text();
    const seeds = parseEpisodes(html, item.type);
    const episodes =
      item.type === "series"
        ? expandSeriesEpisodes(html, seeds)
        : seeds;

    return {
      episodes,
      episodeStatus: episodes.length > 0 ? "available" : "no_episode",
      episodeSourceUrl,
    };
  } catch {
    return {
      episodes: [],
      episodeStatus: "unknown",
      episodeSourceUrl,
    };
  }
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI belum diatur.");
  if (!process.env.MONGODB_DB) throw new Error("MONGODB_DB belum diatur.");

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
    const collection = client
      .db(process.env.MONGODB_DB)
      .collection(process.env.MONGODB_COLLECTION || "movies");
    const items = await collection.find({ type: { $in: [...TYPES] } }).toArray();
    const summary = {
      total: items.length,
      updated: 0,
      episodes: 0,
      byType: {},
      byStatus: {},
    };

    for (const item of items) {
      const result = await fetchEpisodes(item);
      await collection.updateOne(
        { _id: item._id },
        {
          $set: {
            episodes: result.episodes,
            episodeStatus: result.episodeStatus,
            episodeSourceUrl: result.episodeSourceUrl,
            episodesSyncedAt: new Date(),
          },
        }
      );

      summary.updated += 1;
      summary.episodes += result.episodes.length;
      summary.byType[item.type] = (summary.byType[item.type] || 0) + 1;
      summary.byStatus[result.episodeStatus] =
        (summary.byStatus[result.episodeStatus] || 0) + 1;
    }

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
