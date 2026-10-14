"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { updateUserRole } from "@/lib/repositories/users";
import type { Role } from "@/lib/types";

const ASSIGNABLE_ROLES: Role[] = [
  "STUDENT",
  "AMBASSADOR",
  "MENTOR",
  "INSTRUCTOR",
  "ADMIN",
];

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "ambassadors.manage")) {
    redirect("/auth/signin");
  }
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!ASSIGNABLE_ROLES.includes(role)) return;
  updateUserRole(userId, role);
  revalidatePath("/admin");
}
