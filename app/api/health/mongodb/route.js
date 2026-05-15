import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function redactMongoHost(uri) {
  if (!uri) return null;

  try {
    const withoutCredentials = uri.includes("@") ? uri.split("@").pop() : uri;
    return withoutCredentials.split("/")[0] || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const dbName = process.env.MONGODB_DB;
  const collectionName = process.env.MONGODB_COLLECTION || "movies";
  const startedAt = Date.now();

  try {
    const client = await getMongoClient();
    const count = await client
      .db(dbName)
      .collection(collectionName)
      .countDocuments({});

    return Response.json({
      ok: true,
      dbConfigured: Boolean(dbName),
      collection: collectionName,
      host: redactMongoHost(process.env.MONGODB_URI),
      count,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("MongoDB health check error:", error);

    return Response.json(
      {
        ok: false,
        dbConfigured: Boolean(dbName),
        collection: collectionName,
        host: redactMongoHost(process.env.MONGODB_URI),
        errorName: error.name,
        errorMessage: error.message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}
