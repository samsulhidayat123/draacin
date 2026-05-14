import fs from "node:fs";
import path from "node:path";
import { MongoClient, ServerApiVersion } from "mongodb";
import { configureDns, loadEnvFile } from "./lib/env.mjs";
import {
  fetchIdflixCatalogItem,
  scanIdflixSitemap,
} from "./lib/idflix-catalog.mjs";

const CONCURRENCY = 6;

async function worker(queue, collection, summary) {
  while (queue.length > 0) {
    const entry = queue.shift();

    try {
      const item = await fetchIdflixCatalogItem(entry);
      const result = await collection.updateOne(
        {
          source: item.source,
          type: item.type,
          target_id: item.target_id,
        },
        {
          $set: item,
          $setOnInsert: {
            createdAt: new Date(),
            playable: false,
            playbackStatus: "unknown",
            playbackServers: [],
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) summary.inserted += 1;
      else if (result.modifiedCount > 0) summary.updated += 1;
      else summary.unchanged += 1;

      summary.byType[item.type] = (summary.byType[item.type] || 0) + 1;
    } catch (error) {
      summary.failed += 1;
      summary.errors.push({
        type: entry.type,
        slug: entry.slug,
        url: entry.url,
        message: error.message,
      });
    }
  }
}

async function main() {
  loadEnvFile();
  configureDns();

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI belum diatur.");
  if (!process.env.MONGODB_DB) throw new Error("MONGODB_DB belum diatur.");

  const entries = await scanIdflixSitemap();
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
  });
  const summary = {
    source: "idflix",
    importedAt: new Date().toISOString(),
    found: entries.length,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    byType: {},
    errors: [],
  };

  try {
    await client.connect();

    const collection = client
      .db(process.env.MONGODB_DB)
      .collection(process.env.MONGODB_COLLECTION || "movies");

    await collection.createIndex(
      { source: 1, type: 1, target_id: 1 },
      { unique: true, name: "uniq_source_type_target_id" }
    );

    const queue = [...entries];
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () =>
        worker(queue, collection, summary)
      )
    );
  } finally {
    await client.close();
  }

  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(
    path.join(logDir, "idflix-import.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
