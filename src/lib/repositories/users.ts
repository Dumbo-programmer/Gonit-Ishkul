import bcrypt from "bcryptjs";
import { getStore, persistStore, uid } from "@/lib/store";
import type { UserRecord, Role } from "@/lib/types";

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const normalized = email.trim().toLowerCase();
  return (await getStore()).users.find((u) => u.email.toLowerCase() === normalized);
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  return (await getStore()).users.find((u) => u.id === id);
}

export function verifyPassword(user: UserRecord, password: string): boolean {
  if (!user.passwordHash) return false;
  return bcrypt.compareSync(password, user.passwordHash);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<UserRecord> {
  const store = await getStore();
  const user: UserRecord = {
    id: uid("usr"),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: input.role ?? "STUDENT",
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  await persistStore(store);
  return user;
}

export async function getAmbassadorEmails(): Promise<string[]> {
  return (await getStore())
    .users.filter((u) => u.role === "AMBASSADOR")
    .map((u) => u.email.toLowerCase());
}

export async function listUsers(): Promise<UserRecord[]> {
  return [...(await getStore()).users].sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<UserRecord | undefined> {
  const store = await getStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return undefined;
  user.role = role;
  await persistStore(store);
  return user;
}
