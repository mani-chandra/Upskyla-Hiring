import { getPrisma } from "../src/server/db";

async function main() {
  await getPrisma();
  console.log("seed: ready");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "seed failed");
  process.exit(1);
});
