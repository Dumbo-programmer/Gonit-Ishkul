import type { StoreShape } from "@/lib/store";

export type DataSourceKind = "json" | "postgres";

/**
 * Storage backend for the application store.
 *
 * A single `StoreShape` document is loaded and persisted as a whole; the
 * repository layer performs all filtering/aggregation in memory. Two adapters
 * are provided:
 *
 *  - `json`     — a local file (`data/db.json`), used for development/testing
 *                 with no external dependencies.
 *  - `postgres` — a single JSONB row via Prisma, used in production. Requires
 *                 only `DATABASE_URL`.
 */
export interface DataAdapter {
  readonly kind: DataSourceKind;
  /** Load the persisted store, or `null` when nothing has been persisted yet. */
  load(): Promise<Partial<StoreShape> | null>;
  /** Persist the entire store (upsert semantics). */
  save(store: StoreShape): Promise<void>;
}
