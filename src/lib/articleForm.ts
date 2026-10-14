export interface ArticleFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const INITIAL_ARTICLE_STATE: ArticleFormState = { ok: false };
