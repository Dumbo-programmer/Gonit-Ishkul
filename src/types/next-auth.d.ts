import type { Role } from "@/lib/types";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      uid: string;
      role: Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: Role;
  }
}