import { getStore, persistStore } from "@/lib/store";
import type { ResourceItem, BulletinRecord } from "@/lib/types";

export async function listResourceKit(): Promise<ResourceItem[]> {
  return (await getStore()).resourceItems.map((r) => ({ ...r }));
}

export async function getResourceById(id: string): Promise<ResourceItem | undefined> {
  return (await getStore()).resourceItems.find((r) => r.id === id);
}

export async function incrementDownload(id: string): Promise<number> {
  const store = await getStore();
  const item = store.resourceItems.find((r) => r.id === id);
  if (!item) return 0;
  item.downloads += 1;
  await persistStore(store);
  return item.downloads;
}

export async function listBulletins(): Promise<BulletinRecord[]> {
  const all = (await getStore()).bulletins;
  return [...all].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
  );
}
