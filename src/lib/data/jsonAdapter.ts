import fs from "node:fs";
import path from "node:path";

import type { StoreShape } from "@/lib/store";
import type { DataAdapter } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

/** File-backed adapter: zero external dependencies, used in dev/test. */
export class JsonAdapter implements DataAdapter {
  readonly kind = "json" as const;

  async load(): Promise<Partial<StoreShape> | null> {
    if (!fs.existsSync(DATA_FILE)) return null;
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw) as Partial<StoreShape>;
    } catch {
      return null;
    }
  }

  async save(store: StoreShape): Promise<void> {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  }
}
