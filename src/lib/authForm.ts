export interface AuthFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const emptyAuthForm: AuthFormState = { ok: false };
