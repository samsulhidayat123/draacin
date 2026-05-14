import fs from "node:fs";
import path from "node:path";
import { scanIdflixSitemap } from "./lib/idflix-catalog.mjs";

async function main() {
  const entries = await scanIdflixSitemap();
  const byType = entries.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  const summary = {
    source: "idflix",
    scannedAt: new Date().toISOString(),
    total: entries.length,
    byType,
  };
  const logDir = path.join(process.cwd(), "logs");

  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(
    path.join(logDir, "idflix-scan.json"),
    JSON.stringify({ summary, entries }, null, 2)
  );

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
