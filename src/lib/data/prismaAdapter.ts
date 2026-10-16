import { Prisma } from "@prisma/client";

import type { StoreShape } from "@/lib/store";
import type { DataAdapter } from "./types";

const STATE_ID = 1;

/**
 * Postgres adapter: the whole store lives in a single JSONB row
 * (`AppState.data`). Prisma is imported lazily so the JSON dev mode never
 * loads a database client.
 */
export class PrismaAdapter implements DataAdapter {
  readonly kind = "postgres" as const;

  async load(): Promise<Partial<StoreShape> | null> {
    const { prisma } = await import("./prisma");
    const row = await prisma.appState.findUnique({ where: { id: STATE_ID } });
    if (!row) return null;
    return row.data as unknown as Partial<StoreShape>;
  }

  async save(store: StoreShape): Promise<void> {
    const { prisma } = await import("./prisma");
    // Round-trip through JSON so `undefined` values never reach Prisma's Json type.
    const data = JSON.parse(JSON.stringify(store)) as Prisma.InputJsonValue;
    await prisma.appState.upsert({
      where: { id: STATE_ID },
      create: { id: STATE_ID, data },
      update: { data },
    });
  }
}
