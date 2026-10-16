import type { DataAdapter, DataSourceKind } from "./types";
import { JsonAdapter } from "./jsonAdapter";

let adapterPromise: Promise<DataAdapter> | null = null;

/**
 * Resolve the active data source.
 *
 * - `DATA_SOURCE=postgres|prisma|db` → Postgres (Prisma)
 * - `DATA_SOURCE=json|file|memory`   → local JSON file
 * - unset → Postgres when `DATABASE_URL` is present, otherwise JSON
 *
 * Production therefore only needs `DATABASE_URL`; local dev/test needs nothing.
 */
export function resolveDataSource(): DataSourceKind {
  const explicit = process.env.DATA_SOURCE?.trim().toLowerCase();
  if (explicit === "postgres" || explicit === "prisma" || explicit === "db") {
    return "postgres";
  }
  if (explicit === "json" || explicit === "file" || explicit === "memory") {
    return "json";
  }
  return process.env.DATABASE_URL ? "postgres" : "json";
}

export async function getAdapter(): Promise<DataAdapter> {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      if (resolveDataSource() === "postgres") {
        const { PrismaAdapter } = await import("./prismaAdapter");
        return new PrismaAdapter();
      }
      return new JsonAdapter();
    })();
  }
  return adapterPromise;
}
