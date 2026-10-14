import { getStore, persistStore } from "@/lib/store";
import type { ResourceItem, BulletinRecord } from "@/lib/types";

export function listResourceKit(): ResourceItem[] {
  return getStore().resourceItems.map((r) => ({ ...r }));
}

export function getResourceById(id: string): ResourceItem | undefined {
  return getStore().resourceItems.find((r) => r.id === id);
}

export function incrementDownload(id: string): number {
  const store = getStore();
  const item = store.resourceItems.find((r) => r.id === id);
  if (!item) return 0;
  item.downloads += 1;
  persistStore(store);
  return item.downloads;
}

export function listBulletins(): BulletinRecord[] {
  const all = getStore().bulletins;
  return [...all].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
  );
}