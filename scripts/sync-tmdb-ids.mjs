import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const { getMongoClient } = await import("../lib/mongodb.js");
  const { searchTmdbMovieId, slugToSearchTitle } = await import("../lib/tmdb.js");

  const DB_NAME = process.env.MONGODB_DB;
  const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "movies";

  try {
    const client = await getMongoClient();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    // Ambil semua film playable
    const allMovies = await collection
      .find({ type: "movie", playbackStatus: "available" })
      .toArray();

    // Filter yang belum punya ID
    const moviesToUpdate = allMovies.filter(m => 
      !m.tmdbId && !m.imdbId && !m.vidsrcId && !m.tmdb_id && !m.imdb_id
    );

    console.log(`\n=== MEMULAI SINKRONISASI ID UNTUK ${moviesToUpdate.length} FILM ===\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < moviesToUpdate.length; i++) {
      const movie = moviesToUpdate[i];
      const searchTitle = slugToSearchTitle(movie.title || movie.slug);

      console.log(`[${i + 1}/${moviesToUpdate.length}] Mencari ID untuk: "${searchTitle}"...`);

      const resolvedId = await searchTmdbMovieId(searchTitle);

      if (resolvedId) {
        await collection.updateOne(
          { _id: movie._id },
          { $set: { vidsrcId: resolvedId } }
        );
        console.log(`  -> ✅ Berhasil! Disimpan ID: ${resolvedId}`);
        successCount++;
      } else {
        console.log(`  -> ❌ Gagal menemukan ID di TMDB.`);
        failCount++;
      }

      // Jeda 1 detik antar pencarian agar tidak kena blokir TMDB (Rate Limit)
      await sleep(1000);
    }

    console.log(`\n=== SINKRONISASI SELESAI ===`);
    console.log(`✅ Berhasil diupdate : ${successCount} film`);
    console.log(`❌ Gagal/Tidak ketemu : ${failCount} film`);
    
    process.exit(0);
  } catch (error) {
    console.error("Gagal menjalankan script:", error);
    process.exit(1);
  }
}

run();