export interface ClubFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const INITIAL_CLUB_FORM_STATE: ClubFormState = { ok: false };
