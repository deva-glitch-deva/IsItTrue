import { PrismaClient } from "@prisma/client";
import { seededCacheRows } from "../src/lib/server/seed-results";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  for (const row of seededCacheRows(now)) {
    await prisma.analysis.upsert({
      where: { cacheKey: row.cacheKey },
      create: {
        id: row.result.id,
        cacheKey: row.cacheKey,
        normalized: row.result.rawInput.toLowerCase(),
        language: row.result.language,
        inputType: row.result.inputType,
        rawInput: row.result.rawInput,
        result: row.result as unknown as object,
        serious: row.result.serious,
        sensitive: row.result.sensitive,
        category: row.result.category,
        checks: row.checks,
        recentChecks: row.recentChecks,
        createdAt: row.createdAt,
        lastCheckedAt: row.lastCheckedAt,
      },
      update: {
        result: row.result as unknown as object,
        checks: row.checks,
        recentChecks: row.recentChecks,
        lastCheckedAt: row.lastCheckedAt,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
