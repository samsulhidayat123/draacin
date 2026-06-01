import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  // Panggil mongodb secara dinamis setelah env berhasil dimuat
  const { getMongoClient } = await import("../lib/mongodb.js");

  const DB_NAME = process.env.MONGODB_DB;
  const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "movies";

  try {
    const client = await getMongoClient();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const movies = await collection
      .find({ type: "movie", playbackStatus: "available" })
      .project({ title: 1, _id: 0 })
      .toArray();

    console.log(`\n=== DAFTAR ${movies.length} FILM TERSEDIA ===\n`);
    movies.forEach((m, i) => console.log(`${i + 1}. ${m.title}`));
    process.exit(0);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    process.exit(1);
  }
}

run();