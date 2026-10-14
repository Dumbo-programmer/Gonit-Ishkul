export interface AdminFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  createdId?: string;
}

export const INITIAL_ADMIN_FORM_STATE: AdminFormState = { ok: false };
