export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

export function getGeminiModelName(): string {
  return process.env.GOOGLE_GENERATIVE_AI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}
