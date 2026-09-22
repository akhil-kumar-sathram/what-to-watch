import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, callGeminiWithFallback } from '../../../src/utils/geminiClient';
import { generateMoodInterpretation } from '../../../src/utils/recommendationEngine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sanitizeText(val: unknown, maxLength = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

function sanitizeArray(val: unknown, maxItems = 15): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, maxItems);
}

function buildDeterministicProfile(inputs: {
  dayDescription: string;
  primaryMood: string;
  afterFeeling: string;
  experienceType: string;
  preferredGenres: string[];
  avoidGenres: string[];
  emotionalIntensity: string;
  timeAvailable: string;
  familiarity: string;
  languagePreference: string;
}) {
  const currentMood = inputs.primaryMood || 'Reflective';
  const desc = (inputs.dayDescription || '').toLowerCase();
  
  // Calculate energy level
  let energyLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  if (currentMood === 'Tired' || desc.includes('exhausted') || desc.includes('sleepy') || desc.includes('drain')) {
    energyLevel = 'Low';
  } else if (currentMood === 'Excited' || currentMood === 'Motivated' || desc.includes('hyped') || desc.includes('energy')) {
    energyLevel = 'High';
  }

  const interpretation = generateMoodInterpretation(
    (inputs.primaryMood as any) || null,
    inputs.dayDescription
  );

  return {
    dayDescription: inputs.dayDescription || 'Evening reflection',
    currentMood,
    energyLevel,
    desiredFeeling: inputs.afterFeeling || 'Uplifted & Hopeful',
    preferredGenres: inputs.preferredGenres.length > 0 ? inputs.preferredGenres : ['Drama', 'Comedy'],
    excludedGenres: inputs.avoidGenres || [],
    emotionalIntensity: inputs.emotionalIntensity || 'Moderate',
    runtimePreference: inputs.timeAvailable || 'Standard Feature (100–130 min)',
    languagePreference: inputs.languagePreference || 'Any Language',
    discoveryPreference: inputs.familiarity || 'Comfort Classic / Beloved Hit',
    interpretation,
  };
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request payload' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Malformed request body' },
      { status: 400 }
    );
  }

  const dayDescription = sanitizeText(body.dayDescription, 1000);
  const primaryMood = sanitizeText(body.primaryMood, 50);
  const afterFeeling = sanitizeText(body.afterFeeling, 100);
  const experienceType = sanitizeText(body.experienceType, 100);
  const preferredGenres = sanitizeArray(body.preferredGenres);
  const avoidGenres = sanitizeArray(body.avoidGenres);
  const emotionalIntensity = sanitizeText(body.emotionalIntensity, 100);
  const timeAvailable = sanitizeText(body.timeAvailable, 100);
  const familiarity = sanitizeText(body.familiarity, 100);
  const languagePreference = sanitizeText(body.languagePreference || body.language, 100) || 'Any Language';

  const inputs = {
    dayDescription,
    primaryMood,
    afterFeeling,
    experienceType,
    preferredGenres,
    avoidGenres,
    emotionalIntensity,
    timeAvailable,
    familiarity,
    languagePreference,
  };

  const ai = getGeminiClient();
  if (!ai) {
    // If API key is not configured, gracefully return deterministic profile
    const fallbackProfile = buildDeterministicProfile(inputs);
    return NextResponse.json({
      profile: fallbackProfile,
      source: 'synthesized',
    });
  }

  try {
    const prompt = `Analyze this user's day and movie viewing desires to create a structured psychological and cinematic mood profile.

CRITICAL EMOTIONAL UNDERSTANDING:
- Distinguish current mood from desired movie experience. These are two distinct dimensions.
- If current mood is "Sad" or "Stressed" and desired feeling is "Uplifted & Hopeful" or "Deeply Comforted", the recommendation strategy should be comforting, light, or feel-good.
- If current mood is "Sad" or "Reflective" and desired feeling is "Heartbreaking & Tearjerker", "Bittersweet & Life-Reflective", or "Emotionally Cathartic", the user is INTENTIONALLY looking for an emotional, heartbreaking, or tragic crying release with profound empathy and life lessons. Do NOT assume everyone wants a happy feel-good movie.
- Desired emotional experience MUST control the recommendation strategy. Never override the user's explicit emotional desires.

User Survey Inputs:
- Day description: "${dayDescription || 'Not specified'}"
- Current selected mood: "${primaryMood || 'Unspecified'}"
- Desired after feeling: "${afterFeeling}"
- Experience type: "${experienceType}"
- Preferred genres: ${JSON.stringify(preferredGenres)}
- Excluded / avoid genres: ${JSON.stringify(avoidGenres)}
- Emotional intensity: "${emotionalIntensity}"
- Runtime preference: "${timeAvailable}"
- Familiarity preference: "${familiarity}"
- Language preference: "${languagePreference}"

Return a single JSON object with these exact keys:
- dayDescription: string
- currentMood: string (the user's current psychological state)
- energyLevel: "Low" | "Medium" | "High"
- desiredFeeling: string (the exact emotional journey or afterglow they are seeking)
- preferredGenres: string[] (genre names)
- excludedGenres: string[] (genres to strictly avoid)
- emotionalIntensity: string ("Light" | "Moderate" | "Emotional" | "Intense" | "Devastating")
- runtimePreference: string
- languagePreference: string
- discoveryPreference: string
- interpretation: A warm, concise 1-2 sentence empathetic synthesis starting like "Sounds like..." explaining what the user's mind and heart need tonight, perfectly honoring whether they want laughter, comfort, or a heartbreaking cathartic cry.`;

    const { text, modelUsed } = await callGeminiWithFallback(ai, {
      contents: prompt,
      callerName: 'MoodAnalysis',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dayDescription: { type: Type.STRING },
            currentMood: { type: Type.STRING },
            energyLevel: { type: Type.STRING },
            desiredFeeling: { type: Type.STRING },
            preferredGenres: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            excludedGenres: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            emotionalIntensity: { type: Type.STRING },
            runtimePreference: { type: Type.STRING },
            languagePreference: { type: Type.STRING },
            discoveryPreference: { type: Type.STRING },
            interpretation: { type: Type.STRING },
          },
          required: [
            'dayDescription',
            'currentMood',
            'energyLevel',
            'desiredFeeling',
            'preferredGenres',
            'excludedGenres',
            'emotionalIntensity',
            'runtimePreference',
            'languagePreference',
            'discoveryPreference',
            'interpretation',
          ],
        },
      },
    });

    const parsed = JSON.parse(text.trim() || '{}');
    if (!parsed.interpretation || !parsed.currentMood) {
      throw new Error('Incomplete profile returned by Gemini');
    }

    return NextResponse.json({
      profile: parsed,
      source: 'gemini',
      model: modelUsed,
    });
  } catch (geminiErr: any) {
    console.warn('Gemini mood analysis fallback triggered:', geminiErr?.message || geminiErr);
    // Graceful fallback to rich deterministic profile - never fail with 502/503!
    const fallbackProfile = buildDeterministicProfile(inputs);
    return NextResponse.json({
      profile: fallbackProfile,
      source: 'synthesized',
    });
  }
}

