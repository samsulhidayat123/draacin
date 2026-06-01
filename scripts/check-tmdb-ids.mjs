import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { getMongoClient } = await import("../lib/mongodb.js");

  const DB_NAME = process.env.MONGODB_DB;
  const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "movies";

  try {
    const client = await getMongoClient();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const movies = await collection
      .find({ type: "movie", playbackStatus: "available" })
      .project({ title: 1, tmdbId: 1, imdbId: 1, vidsrcId: 1, tmdb_id: 1, imdb_id: 1 })
      .toArray();

    let hasId = 0;
    let noId = 0;

    movies.forEach(m => {
      if (m.tmdbId || m.imdbId || m.vidsrcId || m.tmdb_id || m.imdb_id) {
        hasId++;
      } else {
        noId++;
      }
    });

    console.log(`\n=== STATUS ID TMDB/IMDb PADA ${movies.length} FILM ===\n`);
    console.log(`✅ Sudah punya ID di database : ${hasId} film`);
    console.log(`⚠️ Belum punya ID di database : ${noId} film`);
    console.log(`\n(Catatan: Film yang belum punya ID akan otomatis dicari via TMDB API saat player dibuka)`);
    
    process.exit(0);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    process.exit(1);
  }
}

run();