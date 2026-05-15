import { MongoClient, ServerApiVersion } from "mongodb";
import dns from "node:dns";

const uri = process.env.MONGODB_URI;
const dnsServers = (process.env.MONGODB_DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 10000,
};

let client;
let clientPromise;

export function getMongoClient() {
  if (!uri) {
    throw new Error("MONGODB_URI belum diatur di environment.");
  }

  const cacheKey = `${uri}:${dnsServers.join(",")}`;

  if (uri.startsWith("mongodb+srv://") && dnsServers.length > 0) {
    dns.setServers(dnsServers);
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise || global._mongoClientCacheKey !== cacheKey) {
      client = new MongoClient(uri, options);
      global._mongoClientCacheKey = cacheKey;
      global._mongoClientPromise = client.connect().catch((error) => {
        global._mongoClientPromise = null;
        throw error;
      });
    }

    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}
