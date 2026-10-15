export interface FormState {
  ok: boolean;
  message?: string;
  trackingCode?: string;
  errors?: Record<string, string>;
}

export const INITIAL_FORM_STATE: FormState = { ok: false };
