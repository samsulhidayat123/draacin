import { sanitizeVideoUrl } from "@/lib/playerSecurity";

const API_BASES = [
  process.env.DRAMABOX_API_BASE,
  "https://api.sansekai.my.id/api/dramabox",
  "https://dramabox.sansekai.my.id/api/dramabox",
].filter(Boolean);

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Referer: "https://dramabox.sansekai.my.id/",
  Accept: "application/json",
};

const VIDEO_KEYS = [
  "url",
  "video",
  "videoUrl",
  "video_url",
  "playUrl",
  "play_url",
  "stream",
  "streamUrl",
  "stream_url",
  "src",
  "link",
  "downloadUrl",
  "download_url",
  "mp4",
  "m3u8",
];

function isVideoUrl(value) {
  if (!sanitizeVideoUrl(value)) return false;

  const lower = value.toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/.test(lower)) return false;

  return (
    lower.includes(".mp4") ||
    lower.includes(".m3u8") ||
    lower.includes(".encrypt") ||
    lower.includes("video") ||
    lower.includes("dramaboxdb.com")
  );
}

function collectArrays(value, arrays = []) {
  if (!value || typeof value !== "object") return arrays;

  if (Array.isArray(value)) {
    arrays.push(value);
    value.forEach((item) => collectArrays(item, arrays));
    return arrays;
  }

  Object.values(value).forEach((item) => collectArrays(item, arrays));
  return arrays;
}

function findVideoUrl(value) {
  if (!value || typeof value !== "object") {
    return isVideoUrl(value) ? value : null;
  }

  for (const key of VIDEO_KEYS) {
    const found = value[key];
    if (isVideoUrl(found)) return found;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findVideoUrl(item);
      if (found) return found;
    }
    return null;
  }

  for (const item of Object.values(value)) {
    const found = findVideoUrl(item);
    if (found) return found;
  }

  return null;
}

function episodeNumberOf(item) {
  const candidates = [
    item?.episode,
    item?.episodeNo,
    item?.episodeNumber,
    item?.chapter,
    item?.chapterNo,
    item?.chapterNumber,
    item?.chapterIndex,
    item?.index,
    item?.number,
    item?.order,
  ];

  for (const candidate of candidates) {
    const number = Number(candidate);
    if (Number.isFinite(number)) return number;
  }

  return null;
}

function findEpisode(data, episode) {
  const target = Number(episode);
  const arrays = collectArrays(data);

  for (const list of arrays) {
    const exact = list.find((item) => episodeNumberOf(item) === target);
    if (exact) return exact;

    const zeroBased = list.find((item) => episodeNumberOf(item) === target - 1);
    if (zeroBased) return zeroBased;

    if (list[target - 1]) return list[target - 1];
  }

  return null;
}

async function fetchJson(path, params) {
  const errors = [];

  for (const base of API_BASES) {
    const url = new URL(`${base}${path}`);

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: REQUEST_HEADERS,
      });

      if (!res.ok) {
        errors.push(`${url.href}: ${res.status}`);
        continue;
      }

      return await res.json();
    } catch (error) {
      errors.push(`${url.href}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | ") || "Semua endpoint gagal");
}

async function decryptVideoUrl(url) {
  if (!url.includes(".encrypt")) return url;

  try {
    const data = await fetchJson("/decrypt", { url });
    return findVideoUrl(data) || url;
  } catch (error) {
    console.warn("[decryptVideoUrl] gagal decrypt:", error.message);
    return url;
  }
}

async function getEpisodeStream(id, episode) {
  try {
    const data = await fetchJson("/allepisode", { bookId: id });
    const item = findEpisode(data, episode);
    const url = findVideoUrl(item) || findVideoUrl(data);

    if (!url) return null;

    const decryptedUrl = await decryptVideoUrl(url);
    const safeUrl = sanitizeVideoUrl(decryptedUrl);

    if (!safeUrl) return null;

    return {
      url: safeUrl,
      raw: item || data,
    };
  } catch (error) {
    console.error("Fetch stream error:", error.message);
    return null;
  }
}

export default async function WatchPage({ params }) {
  const { id, episode } = await params;
  const stream = await getEpisodeStream(id, episode);
  const video = stream?.url;

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <h1 className="text-xl font-bold">
          Drama {id} Episode {episode}
        </h1>

        {video ? (
          <video
            src={video}
            className="aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-[#111] p-6 text-center">
            <p className="text-lg font-bold">Episode belum bisa diputar</p>
            <p className="max-w-xl text-sm text-gray-400">
              Stream tidak ditemukan atau API DramaBox sedang tidak tersedia.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
