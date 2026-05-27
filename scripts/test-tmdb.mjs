import fs from "fs";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  console.error("❌ TMDB_API_KEY tidak ditemukan");
  process.exit(1);
}

const query = process.argv.slice(2).join(" ") || "Fight Club";

const url = new URL("https://api.themoviedb.org/3/search/movie");
url.searchParams.set("api_key", apiKey);
url.searchParams.set("query", query);
url.searchParams.set("language", "en-US");
url.searchParams.set("include_adult", "false");

const response = await fetch(url);
const data = await response.json();

console.log("Status:", response.status, response.statusText);
console.log("Query:", query);
console.log("Total results:", data.results?.length || 0);

for (const movie of (data.results || []).slice(0, 5)) {
  console.log({
    tmdbId: movie.id,
    title: movie.title,
    releaseDate: movie.release_date,
  });
}

if (response.ok && data.results?.length > 0) {
  console.log("✅ TMDB aktif dan berhasil dipakai");
} else {
  console.log("⚠️ TMDB tersambung, tapi film tidak ditemukan atau key bermasalah");
}
