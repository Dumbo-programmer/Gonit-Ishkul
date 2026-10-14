import bcrypt from "bcryptjs";
import { getStore, persistStore, uid } from "@/lib/store";
import type { UserRecord, Role } from "@/lib/types";

export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return getStore().users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): UserRecord | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function verifyPassword(user: UserRecord, password: string): boolean {
  if (!user.passwordHash) return false;
  return bcrypt.compareSync(password, user.passwordHash);
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}): UserRecord {
  const store = getStore();
  const user: UserRecord = {
    id: uid("usr"),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: input.role ?? "STUDENT",
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  persistStore(store);
  return user;
}

export function getAmbassadorEmails(): string[] {
  return getStore()
    .users.filter((u) => u.role === "AMBASSADOR")
    .map((u) => u.email.toLowerCase());
}

export function listUsers(): UserRecord[] {
  return [...getStore().users].sort((a, b) => a.name.localeCompare(b.name));
}

export function updateUserRole(userId: string, role: Role): UserRecord | undefined {
  const store = getStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return undefined;
  user.role = role;
  persistStore(store);
  return user;
}