import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";

export function loadEnvFile(filePath = path.join(process.cwd(), ".env.local")) {
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

export function configureDns() {
  dns.setServers(
    (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean)
  );
}
