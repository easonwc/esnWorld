import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcPath = path.join(root, "src/persistence/seed/tennis-golf-venues.data.ts");
const src = fs.readFileSync(srcPath, "utf8");
const golfStart = src.indexOf("  // Golf majors");
const tennisBody = src.slice(src.indexOf("[") + 1, golfStart).trim().replace(/,\s*$/, "");
const golfBody = src.slice(golfStart, src.lastIndexOf("]")).trim();

const stripKind = (body, kind) =>
  body.replace(new RegExp(`    kind: "${kind}",\\r?\\n`, "g"), "");

const tennisEntries = stripKind(tennisBody, "tennis");
const golfEntries = stripKind(golfBody, "golf");

fs.writeFileSync(
  path.join(root, "src/persistence/seed/tennis-venues.data.ts"),
  `import type { TennisVenueSeedEntry } from "./tennis-venue-types";\n\n/** Professional tennis multi_resource venues (courts). */\nexport const TENNIS_VENUE_SEED_DATA: readonly TennisVenueSeedEntry[] = [\n${tennisEntries}\n] as const;\n`,
);

fs.writeFileSync(
  path.join(root, "src/persistence/seed/golf-venues.data.ts"),
  `import type { GolfVenueSeedEntry } from "./golf-venue-types";\n\n/** Professional golf multi_resource venues (tee groups). Shared by PGA, future LPGA, and DP World catalog seeds. */\nexport const GOLF_VENUE_SEED_DATA: readonly GolfVenueSeedEntry[] = [\n${golfEntries}\n] as const;\n`,
);

console.log(
  "split complete:",
  tennisEntries.split("venueName").length - 1,
  "tennis,",
  golfEntries.split("venueName").length - 1,
  "golf",
);
