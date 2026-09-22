import { GoogleGenAI } from '@google/genai';

/**
 * Validated modern Gemini models in order of resilience and capability:
 * - gemini-3.8-flash: Standard fast text reasoning and recommendation
 * - gemini-flash-latest: Canonical alias for latest available Flash instance
 * - gemini-3.1-flash-lite: High-availability lightweight fallback
 */
export const ALLOWED_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
] as const;

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

// Disallowed or discontinued models that must never be called
const DEPRECATED_MODEL_PREFIXES = [
  'gemini-2.5',
  'gemini-2.0',
  'gemini-1.5',
  'gemini-1.0',
  'gemini-pro',
];

export function resolveValidModel(preferredModel?: string): string {
  if (preferredModel) {
    const isDeprecated = DEPRECATED_MODEL_PREFIXES.some((dep) =>
      preferredModel.toLowerCase().includes(dep)
    );
    if (!isDeprecated) {
      return preferredModel;
    }
  }
  return DEFAULT_GEMINI_MODEL;
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface GeminiCallParams {
  contents: any;
  config?: any;
  preferredModel?: string;
  callerName?: string;
}

export async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: GeminiCallParams
): Promise<{ text: string; modelUsed: string }> {
  const primaryModel = resolveValidModel(
    params.preferredModel || process.env.GEMINI_MODEL
  );

  // Assemble list of candidate models without duplicates
  const candidateModels = [
    primaryModel,
    ...ALLOWED_GEMINI_MODELS.filter((m) => m !== primaryModel),
  ];

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const maxRetries = 2; // Retry transient 429/503 errors with backoff before switching models

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const text = response.text || '';
        return { text, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const statusCode = err?.status || err?.code || (err?.error && err.error.code);
        const isTransientOrUnavailable =
          statusCode === 503 ||
          statusCode === 429 ||
          statusCode === 404 ||
          statusCode === 500 ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('no longer available') ||
          err?.message?.includes('UNAVAILABLE');

        // If it's a permanent auth error (e.g. invalid API key 401/403), stop immediately
        if (statusCode === 401 || statusCode === 403) {
          throw err;
        }

        // If transient error and we have retry attempts remaining for this model, wait with backoff
        if (isTransientOrUnavailable && attempt < maxRetries) {
          const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
          console.warn(
            `[${params.callerName || 'Gemini'}] Model "${model}" hit code ${statusCode}. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})...`
          );
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        console.warn(
          `[${params.callerName || 'Gemini'}] Model "${model}" failed (code ${statusCode}). ${
            i < candidateModels.length - 1 ? `Trying fallback model "${candidateModels[i + 1]}"...` : 'No more fallbacks.'
          }`
        );

        // Break retry loop and proceed to next model in candidateModels
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini model fallbacks exhausted');
}
