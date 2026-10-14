import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "./types";
import { findUserByEmail, verifyPassword } from "./repositories/users";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = findUserByEmail(credentials.email);
        if (!user || !verifyPassword(user, credentials.password)) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: Role }).role ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { uid: string }).uid = (token.uid as string) ?? "";
        (session.user as { role: Role }).role =
          (token.role as Role) ?? "STUDENT";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireRole(
  role: Role,
  session: { user?: { role?: Role } } | null,
): Promise<boolean> {
  if (!session?.user?.role) return false;
  if (role === "ADMIN") return session.user.role === "ADMIN";
  return session.user.role === role;
}