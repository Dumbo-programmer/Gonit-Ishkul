"use server";

import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/repositories/users";
import { DEFAULT_ROLE } from "@/lib/rbac";
import type { AuthFormState } from "@/lib/authForm";

const signupSchema = z
  .object({
    name: z.string().trim().min(3, "নাম অন্তত ৩ অক্ষরের হতে হবে"),
    email: z.string().trim().email("সঠিক ইমেইল দিন"),
    password: z.string().min(8, "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "দুইবার দেওয়া পাসওয়ার্ড মিলছে না",
  });

/**
 * Public self-signup. Every new account starts as the base `STUDENT` ("User")
 * role. Campus Ambassador and Club Representative are requested through the
 * apply / club-register flows and promoted by an admin — never chosen here.
 */
export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };
  }

  const email = parsed.data.email.toLowerCase();
  if (await findUserByEmail(email)) {
    return {
      ok: false,
      message: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।",
      errors: { email: "এই ইমেইল ইতিমধ্যে নিবন্ধিত" },
    };
  }

  await createUser({
    name: parsed.data.name,
    email,
    password: parsed.data.password,
    role: DEFAULT_ROLE,
  });

  return { ok: true, message: "অ্যাকাউন্ট তৈরি হয়েছে!" };
}
