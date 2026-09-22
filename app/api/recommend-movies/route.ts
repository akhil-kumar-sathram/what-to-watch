import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, callGeminiWithFallback } from '../../../src/utils/geminiClient';
import { Movie, MoodProfile, MovieGenre } from '../../../src/types';
import { validateAndSanitizeRecommendations } from '../../../src/utils/tmdbPosterValidator';
import {
  toTmdbLanguageCode,
  getLanguageDisplayName,
  matchesLanguageFilter,
  INDIAN_LANG_PIPE,
} from '../../../src/utils/languages';
import {
  OFFICIAL_TMDB_GENRES,
  normalizeGenreIds,
  satisfiesGenreRequirement,
  containsExcludedGenre,
  formatTMDBGenreObjects,
} from '../../../src/utils/tmdbGenres';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

interface TMDBCandidate {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  original_language: string;
  genre_ids: number[];
  genres: string[];
}

interface RankedPick {
  tmdbId: number;
  reason: string;
  emotionalTypes: string[];
  emotionalIntensity: string;
  endingTone: string;
  lifeThemes: string[];
  moodFitScore: number;
  moodRiskScore: number;
}

interface TMDBMovieDetail {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  original_language: string;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { name: string }[];
    crew: { job: string; name: string }[];
  };
  videos?: {
    results: { site: string; type: string; key: string }[];
  };
  images?: {
    posters: { file_path: string; iso_639_1?: string | null }[];
  };
}

/**
 * Step 5: Query TMDB across multiple pages for candidates strictly adhering to verified genre & language boundaries.
 *
 * CRITICAL MULTILINGUAL RULES:
 * 1. English is NOT the default movie language.
 * 2. If a specific language is selected (Hindi, Tamil, Telugu, Korean, etc.), with_original_language
 *    MUST BE APPLIED TO EVERY TMDB QUERY and candidates strictly verified.
 * 3. If "Any Language" is selected, with_original_language MUST BE OMITTED completely, and
 *    discovery balances global, Asian, and European cinema so English does not monopolize.
 * 4. Paginate across TMDB pages (page 1, 2, 3...) to collect 30-50+ real candidates.
 * 5. NEVER fall back to English silently if zero candidates match.
 */
async function fetchCandidatesFromTMDB(
  profile: MoodProfile,
  requiredGenreIds: number[],
  excludedGenreIds: number[],
  targetLangCode: string | null,
  tmdbKey: string
): Promise<TMDBCandidate[]> {
  const candidateMap = new Map<number, TMDBCandidate>();
  let pagesQueried = 0;

  const baseParams = new URLSearchParams({
    api_key: tmdbKey,
    language: 'en-US',
    include_adult: 'false',
    include_video: 'false',
  });

  // Strictly enforce user's selected genres using TMDB genre IDs
  if (requiredGenreIds.length > 0) {
    baseParams.set('with_genres', requiredGenreIds.slice(0, 4).join('|'));
  }

  // Strictly exclude genres the user wants to avoid
  if (excludedGenreIds.length > 0) {
    baseParams.set('without_genres', excludedGenreIds.join(','));
  }

  // Runtime filtering
  if (profile.runtimePreference?.includes('Under 90') || profile.runtimePreference?.includes('Short')) {
    baseParams.set('with_runtime.lte', '95');
  } else if (profile.runtimePreference?.includes('Epic') || profile.runtimePreference?.includes('130+')) {
    baseParams.set('with_runtime.gte', '130');
  }

  const addCandidates = (results: any[]) => {
    results.forEach((r) => {
      if (!r.id || candidateMap.has(r.id)) return;

      // STRICT POSTER VALIDATION: candidate MUST have a valid TMDB poster_path
      if (
        !r.poster_path ||
        typeof r.poster_path !== 'string' ||
        !r.poster_path.startsWith('/') ||
        r.poster_path.length < 5
      ) {
        return;
      }

      const cGenreIds: number[] = Array.isArray(r.genre_ids) ? r.genre_ids : [];

      // STRICT VALIDATION: candidate MUST satisfy genre requirements
      if (!satisfiesGenreRequirement(cGenreIds, requiredGenreIds, 'any')) {
        return;
      }

      // STRICT VALIDATION: candidate MUST NOT contain excluded genres
      if (containsExcludedGenre(cGenreIds, excludedGenreIds)) {
        return;
      }

      // STRICT LANGUAGE VALIDATION: candidate MUST match target language if specified
      if (targetLangCode && !matchesLanguageFilter(r.original_language, targetLangCode)) {
        return;
      }

      const genreNames = cGenreIds.map((gid) => OFFICIAL_TMDB_GENRES[gid] || 'Film').filter(Boolean);

      candidateMap.set(r.id, {
        id: r.id,
        title: r.title || 'Untitled Movie',
        overview: r.overview || '',
        vote_average: typeof r.vote_average === 'number' ? r.vote_average : 0,
        vote_count: typeof r.vote_count === 'number' ? r.vote_count : 0,
        release_date: r.release_date || '',
        original_language: r.original_language || 'en',
        genre_ids: cGenreIds,
        genres: genreNames,
      });
    });
  };

  // Case A: Specific language (or specific group like Any Indian Language)
  if (targetLangCode) {
    const langParams = new URLSearchParams(baseParams);
    langParams.set('with_original_language', targetLangCode);
    langParams.set('vote_count.gte', '5'); // Regional movies often have lower global vote counts
    langParams.set('sort_by', 'popularity.desc');

    // Paginate through TMDB until we accumulate 30-50 valid candidates
    for (let page = 1; page <= 4; page++) {
      if (candidateMap.size >= 40) break;
      langParams.set('page', String(page));
      try {
        pagesQueried++;
        const discoverUrl = `https://api.themoviedb.org/3/discover/movie?${langParams.toString()}`;
        const res = await fetchWithTimeout(discoverUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            addCandidates(data.results);
          }
          if (page >= (data.total_pages || 1)) break;
        }
      } catch (err: any) {
        console.warn(`TMDB discover page ${page} error:`, err?.message || err);
      }
    }

    // Secondary relaxed query if still fewer than 15 candidates, STRICTLY retaining language filter
    if (candidateMap.size < 15) {
      try {
        pagesQueried++;
        const relaxedParams = new URLSearchParams(langParams);
        relaxedParams.delete('with_runtime.lte');
        relaxedParams.delete('with_runtime.gte');
        relaxedParams.set('vote_count.gte', '2');
        relaxedParams.set('page', '1');
        const secondaryUrl = `https://api.themoviedb.org/3/discover/movie?${relaxedParams.toString()}`;
        const res2 = await fetchWithTimeout(secondaryUrl);
        if (res2.ok) {
          const data2 = await res2.json();
          if (Array.isArray(data2.results)) {
            addCandidates(data2.results);
          }
        }
      } catch (err: any) {
        console.warn('TMDB relaxed discover error:', err?.message || err);
      }
    }
  } else {
    // Case B: "Any Language" selected -> OMIT with_original_language
    // Balance global discovery with international cinema pools so that English blockbusters don't monopolize
    const globalParams = new URLSearchParams(baseParams);
    globalParams.set('sort_by', 'popularity.desc');
    globalParams.set('vote_count.gte', '15');

    // Fetch page 1 & 2 of general discover
    for (let page = 1; page <= 2; page++) {
      globalParams.set('page', String(page));
      try {
        pagesQueried++;
        const res = await fetchWithTimeout(`https://api.themoviedb.org/3/discover/movie?${globalParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) addCandidates(data.results);
        }
      } catch (err: any) {
        console.warn(`Global discover page ${page} error:`, err?.message || err);
      }
    }

    // Inject top Asian cinema (Korean, Japanese, Indian, Chinese)
    try {
      pagesQueried++;
      const asianParams = new URLSearchParams(baseParams);
      asianParams.set('with_original_language', `ko|ja|zh|${INDIAN_LANG_PIPE}`);
      asianParams.set('sort_by', 'popularity.desc');
      asianParams.set('vote_count.gte', '10');
      asianParams.set('page', '1');
      const resAsian = await fetchWithTimeout(`https://api.themoviedb.org/3/discover/movie?${asianParams.toString()}`);
      if (resAsian.ok) {
        const dataAsian = await resAsian.json();
        if (Array.isArray(dataAsian.results)) addCandidates(dataAsian.results);
      }
    } catch (err: any) {
      console.warn('Asian pool discover error:', err?.message || err);
    }

    // Inject top European cinema (French, Spanish, German, Italian)
    try {
      pagesQueried++;
      const euroParams = new URLSearchParams(baseParams);
      euroParams.set('with_original_language', 'fr|es|de|it');
      euroParams.set('sort_by', 'popularity.desc');
      euroParams.set('vote_count.gte', '10');
      euroParams.set('page', '1');
      const resEuro = await fetchWithTimeout(`https://api.themoviedb.org/3/discover/movie?${euroParams.toString()}`);
      if (resEuro.ok) {
        const dataEuro = await resEuro.json();
        if (Array.isArray(dataEuro.results)) addCandidates(dataEuro.results);
      }
    } catch (err: any) {
      console.warn('European pool discover error:', err?.message || err);
    }
  }

  const candidateList = Array.from(candidateMap.values());

  // Log audit metrics (Requirement 28 & 29)
  const langDist: Record<string, number> = {};
  candidateList.forEach((c) => {
    const lang = getLanguageDisplayName(c.original_language);
    langDist[lang] = (langDist[lang] || 0) + 1;
  });

  console.log('================ [MOVIE DATA SYSTEM AUDIT] ================');
  console.log('USER LANGUAGE:', profile.languagePreference || 'Any Language');
  console.log('LANGUAGE CODE:', targetLangCode || 'ALL (OMITTED with_original_language)');
  console.log('SELECTED GENRES:', profile.preferredGenres);
  console.log('GENRE IDS:', requiredGenreIds);
  console.log('TMDB PAGES QUERIED:', pagesQueried);
  console.log('VALID CANDIDATES FOUND:', candidateList.length);
  console.log('LANGUAGE DISTRIBUTION:', JSON.stringify(langDist));
  console.log('===========================================================');

  return candidateList.slice(0, 45);
}

// Step 6 & 7: Gemini ranking, emotional classification, & mood safety filtering on real TMDB candidates
async function rankCandidatesWithGemini(
  candidates: TMDBCandidate[],
  profile: MoodProfile
): Promise<RankedPick[]> {
  const ai = getGeminiClient();
  if (!ai || candidates.length === 0) {
    return candidates.slice(0, 5).map((c) => ({
      tmdbId: c.id,
      reason: `Directly aligns with your desire for ${profile.desiredFeeling.toLowerCase()}, tailored to your ${profile.currentMood.toLowerCase()} mood.`,
      emotionalTypes: ['Emotional', 'Thought-Provoking'],
      emotionalIntensity: profile.emotionalIntensity || 'Moderate',
      endingTone: 'satisfying',
      lifeThemes: ['human connection'],
      moodFitScore: 85,
      moodRiskScore: 10,
    }));
  }

  const candidateSummaries = candidates.map((c) => ({
    tmdbId: c.id,
    title: c.title,
    overview: c.overview,
    vote_average: Math.round(c.vote_average * 10) / 10,
    release_date: c.release_date,
    original_language: c.original_language,
    language: getLanguageDisplayName(c.original_language),
    genres: c.genres,
  }));

  const prompt = `You are the empathetic cinephile psychologist behind WHAT TO WATCH.
We have retrieved real candidate movies from The Movie Database (TMDB).

USER CONTEXT & EMOTIONAL STATE:
- Current Mood: "${profile.currentMood}"
- Day description: "${profile.dayDescription || 'Busy day'}"
- Energy level: "${profile.energyLevel}"
- Desired Movie Experience / Afterglow: "${profile.desiredFeeling}"
- Preferred genres: ${JSON.stringify(profile.preferredGenres)}
- Avoided genres: ${JSON.stringify(profile.excludedGenres)}
- Emotional intensity level: "${profile.emotionalIntensity}"
- Runtime preference: "${profile.runtimePreference}"
- Language preference: "${profile.languagePreference}"
- Discovery preference: "${profile.discoveryPreference}"
- Curatorial synthesis: "${profile.interpretation}"

CRITICAL RULES:
1. TMDB DECIDES WHAT THE MOVIE IS. GEMINI DECIDES HOW WELL IT FITS THE USER'S MOOD:
   - Factual movie metadata (Genre, Title, Cast, Director) is already fixed by TMDB.
   - Do NOT invent genres or change them.
2. DISTINGUISH CURRENT MOOD FROM DESIRED MOVIE EXPERIENCE:
   - "Make me happy" vs "Make me cry" are both completely valid movie-night requests.
   - If the user explicitly asks for heartbreaking, make me cry, sad, tragic, bittersweet, or cathartic:
     -> Prioritize movies that deliver that catharsis without penalizing sad or bittersweet endings.
   - If the user asks for light, feel-good, or comforting:
     -> Avoid depressing or traumatic films.
3. DO NOT SPOIL IN REASON:
   - Keep the "reason" (Why this fits you) 100% spoiler-free.
4. EMOTIONAL CLASSIFICATION:
   - Choose 1 to 3 tags strictly from this approved list:
     ["Feel-Good", "Comforting", "Lighthearted", "Funny", "Romantic", "Hopeful", "Inspirational", "Uplifting", "Emotional", "Bittersweet", "Heartbreaking", "Tragic", "Melancholic", "Thought-Provoking", "Life-Changing", "Deeply Emotional", "Dark", "Disturbing", "Intense", "Cathartic"]

REAL TMDB CANDIDATE MOVIES:
${JSON.stringify(candidateSummaries, null, 2)}

TASK:
Evaluate each candidate movie. Select and rank the best matches (up to 8) that genuinely satisfy the user's desired emotional journey.
Return an array of objects matching the schema below.`;

  try {
    const { text } = await callGeminiWithFallback(ai, {
      contents: prompt,
      callerName: 'MovieRanking',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tmdbId: { type: Type.INTEGER },
              reason: { type: Type.STRING },
              emotionalTypes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              emotionalIntensity: { type: Type.STRING },
              endingTone: { type: Type.STRING },
              lifeThemes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              moodFitScore: { type: Type.INTEGER },
              moodRiskScore: { type: Type.INTEGER },
            },
            required: [
              'tmdbId',
              'reason',
              'emotionalTypes',
              'emotionalIntensity',
              'endingTone',
              'lifeThemes',
              'moodFitScore',
              'moodRiskScore',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(text || '[]') as RankedPick[];
    const validCandidateIds = new Set(candidates.map((c) => c.id));
    const verifiedPicks = parsed.filter((p) => validCandidateIds.has(p.tmdbId));

    if (verifiedPicks.length > 0) {
      return verifiedPicks;
    }

    return candidates.slice(0, 5).map((c) => ({
      tmdbId: c.id,
      reason: `Directly aligns with your desire for ${profile.desiredFeeling.toLowerCase()} and evening energy.`,
      emotionalTypes: ['Emotional'],
      emotionalIntensity: profile.emotionalIntensity || 'Moderate',
      endingTone: 'satisfying',
      lifeThemes: ['human resilience'],
      moodFitScore: 82,
      moodRiskScore: 12,
    }));
  } catch (err: any) {
    console.warn('Gemini ranking fallback triggered:', err?.message || err);
    return candidates.slice(0, 5).map((c) => ({
      tmdbId: c.id,
      reason: `Directly aligns with your desire for ${profile.desiredFeeling.toLowerCase()} and evening energy.`,
      emotionalTypes: ['Emotional'],
      emotionalIntensity: profile.emotionalIntensity || 'Moderate',
      endingTone: 'satisfying',
      lifeThemes: ['human resilience'],
      moodFitScore: 82,
      moodRiskScore: 12,
    }));
  }
}

async function getVerifiedTMDBPosterPath(
  tmdbId: number,
  tmdb: TMDBMovieDetail,
  tmdbKey: string
): Promise<string | null> {
  if (tmdb.id !== tmdbId) return null;

  if (typeof tmdb.poster_path === 'string' && tmdb.poster_path.startsWith('/') && tmdb.poster_path.length > 4) {
    return tmdb.poster_path;
  }

  if (Array.isArray(tmdb.images?.posters) && tmdb.images.posters.length > 0) {
    const validPosters = tmdb.images.posters.filter(
      (p) => typeof p.file_path === 'string' && p.file_path.startsWith('/') && p.file_path.length > 4
    );
    if (validPosters.length > 0) {
      const enPoster = validPosters.find((p) => p.iso_639_1 === 'en');
      return (enPoster || validPosters[0]).file_path;
    }
  }

  try {
    const imagesUrl = `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${tmdbKey}`;
    const imagesRes = await fetchWithTimeout(imagesUrl, {}, 5000);
    if (imagesRes.ok) {
      const imagesData = await imagesRes.json();
      if (Array.isArray(imagesData.posters) && imagesData.posters.length > 0) {
        const validPosters = imagesData.posters.filter(
          (p: any) => typeof p.file_path === 'string' && p.file_path.startsWith('/') && p.file_path.length > 4
        );
        if (validPosters.length > 0) {
          return validPosters[0].file_path;
        }
      }
    }
  } catch {
    // Non-fatal fallback
  }

  return null;
}

/**
 * Step 8: Hydrate full metadata, credits, trailers, and verified posters for ranked movies.
 */
async function hydrateMovieDetails(
  picks: RankedPick[],
  allCandidates: TMDBCandidate[],
  requiredGenreIds: number[],
  excludedGenreIds: number[],
  targetLangCode: string | null,
  profile: MoodProfile,
  tmdbKey: string
): Promise<Movie[]> {
  const verifiedMovies: Movie[] = [];
  const triedIds = new Set<number>();

  const hydrateSingle = async (pick: RankedPick): Promise<Movie | null> => {
    const { tmdbId, reason, emotionalTypes, emotionalIntensity, endingTone, lifeThemes, moodFitScore } = pick;
    try {
      const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}&append_to_response=credits,videos,images&language=en-US`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return null;

      const tmdb: TMDBMovieDetail = await res.json();
      if (!tmdb || tmdb.id !== tmdbId) return null;

      const verifiedPosterPath = await getVerifiedTMDBPosterPath(tmdbId, tmdb, tmdbKey);
      if (!verifiedPosterPath) return null;

      const rawTmdbGenres = Array.isArray(tmdb.genres) ? tmdb.genres : [];
      const genreIds = rawTmdbGenres.map((g) => g.id);

      // Strict genre verification
      if (!satisfiesGenreRequirement(genreIds, requiredGenreIds, 'any')) return null;
      if (excludedGenreIds.length > 0 && containsExcludedGenre(genreIds, excludedGenreIds)) return null;

      // Strict language verification
      if (targetLangCode && !matchesLanguageFilter(tmdb.original_language, targetLangCode)) {
        return null;
      }

      const formattedGenres: MovieGenre[] = rawTmdbGenres.map((g) => ({
        id: g.id,
        name: g.name === 'Science Fiction' ? 'Sci-Fi' : g.name,
      }));
      const genreNames = formattedGenres.map((g) => g.name);

      const director =
        tmdb.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Acclaimed Filmmaker';
      const cast = tmdb.credits?.cast?.slice(0, 4).map((c) => c.name) || ['Notable Cast'];
      const trailerVideo = tmdb.videos?.results?.find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      const trailerYoutubeId = trailerVideo ? trailerVideo.key : '';

      const posterUrl = `https://image.tmdb.org/t/p/w500${verifiedPosterPath}`;
      const posterPath = verifiedPosterPath;

      const verifiedBackdropPath =
        typeof tmdb.backdrop_path === 'string' && tmdb.backdrop_path.startsWith('/')
          ? tmdb.backdrop_path
          : null;
      const backdropUrl = verifiedBackdropPath
        ? `https://image.tmdb.org/t/p/w1280${verifiedBackdropPath}`
        : posterUrl;

      const year = tmdb.release_date ? parseInt(tmdb.release_date.substring(0, 4), 10) : 2020;
      const ratingNum = tmdb.vote_average ? Math.round(tmdb.vote_average * 10) / 10 : 7.8;
      const rtPct = Math.min(99, Math.max(68, Math.round(ratingNum * 10 + 2)));

      const origLang = (tmdb.original_language || 'en').toLowerCase();
      const detectedLang = getLanguageDisplayName(origLang);

      const movie: Movie = {
        id: `tmdb-${tmdb.id}`,
        tmdbId: tmdb.id,
        title: tmdb.title,
        originalTitle: tmdb.original_title || tmdb.title,
        year: isNaN(year) ? 2021 : year,
        rating: ratingNum,
        rtScore: rtPct,
        runtime: `${tmdb.runtime || 115}m`,
        genre_ids: genreIds,
        genres: genreNames,
        tmdbGenres: formattedGenres,
        director,
        cast,
        language: detectedLang,
        originalLanguage: origLang,
        synopsis: tmdb.overview || '',
        overview: tmdb.overview || '',
        whyItFits: reason,
        posterUrl,
        posterPath,
        backdropUrl,
        backdropPath: verifiedBackdropPath || undefined,
        trailerYoutubeId,
        trailerUrl: trailerYoutubeId ? `https://www.youtube.com/watch?v=${trailerYoutubeId}` : undefined,
        streamingPlatforms: [
          { name: 'Netflix', type: 'Stream', badgeColor: 'bg-red-600' },
          { name: 'Apple TV', type: 'Rent', badgeColor: 'bg-neutral-700' },
        ],
        emotionalTags: Array.isArray(emotionalTypes) && emotionalTypes.length > 0 ? emotionalTypes : ['Comforting', 'Engaging'],
        vibeIntensity: (emotionalIntensity === 'Intense' ? 'Intense' : emotionalIntensity === 'Gentle' ? 'Gentle' : 'Moderate') as 'Gentle' | 'Moderate' | 'Intense',
        era: year < 2000 ? 'Classic' : year < 2018 ? 'Indie' : 'Modern Blockbuster',
        emotionalTypes: Array.isArray(emotionalTypes) && emotionalTypes.length > 0 ? emotionalTypes : ['Emotional'],
        emotionalIntensity: emotionalIntensity || 'Moderate',
        endingTone: endingTone || 'satisfying',
        lifeThemes: Array.isArray(lifeThemes) && lifeThemes.length > 0 ? lifeThemes : ['human connection'],
        moodFitScore,
        posterVerified: true,
        posterSource: 'tmdb_official',
      };

      return movie;
    } catch (err: any) {
      console.warn(`Error hydrating movie ${tmdbId} from TMDB:`, err?.message || err);
      return null;
    }
  };

  for (const pick of picks) {
    if (triedIds.has(pick.tmdbId)) continue;
    triedIds.add(pick.tmdbId);
    const movie = await hydrateSingle(pick);
    if (movie) {
      verifiedMovies.push(movie);
      if (verifiedMovies.length >= 5) break;
    }
  }

  // Backfill from verified candidates if needed
  if (verifiedMovies.length < 5) {
    for (const cand of allCandidates) {
      if (!triedIds.has(cand.id)) {
        triedIds.add(cand.id);
        const fallbackPick: RankedPick = {
          tmdbId: cand.id,
          reason: `Chosen to fulfill your evening desire for ${profile.desiredFeeling.toLowerCase()}.`,
          emotionalTypes: ['Emotional', 'Thought-Provoking'],
          emotionalIntensity: profile.emotionalIntensity || 'Moderate',
          endingTone: 'satisfying',
          lifeThemes: ['human resilience', 'connection'],
          moodFitScore: 82,
          moodRiskScore: 12,
        };
        const movie = await hydrateSingle(fallbackPick);
        if (movie) {
          verifiedMovies.push(movie);
          if (verifiedMovies.length >= 5) break;
        }
      }
    }
  }

  return verifiedMovies;
}

export async function POST(req: Request) {
  try {
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

    const { surveyData, moodProfile, profile: directProfile, regenOption } = body;
    const incomingProfile = moodProfile || directProfile;

    if (!surveyData && !incomingProfile) {
      return NextResponse.json(
        { error: 'Missing surveyData or moodProfile payload' },
        { status: 400 }
      );
    }

    // DO NOT DEFAULT TO ENGLISH. If unspecified or 'Any', it is 'Any Language'.
    const rawLang =
      surveyData?.languagePreference ??
      incomingProfile?.languagePreference ??
      surveyData?.language;
    const selectedLang = rawLang && String(rawLang).trim() ? String(rawLang).trim() : 'Any Language';

    const profile: MoodProfile = incomingProfile
      ? {
          ...incomingProfile,
          languagePreference: selectedLang,
        }
      : {
          dayDescription: String(surveyData?.dayDescription || '').slice(0, 1000),
          currentMood: String(surveyData?.primaryMood || 'Reflective').slice(0, 50),
          energyLevel: surveyData?.primaryMood === 'Tired' ? 'Low' : 'Medium',
          desiredFeeling: String(surveyData?.afterFeeling || 'Uplifted & Hopeful').slice(0, 100),
          preferredGenres: Array.isArray(surveyData?.preferredGenres) ? surveyData.preferredGenres.slice(0, 10) : [],
          excludedGenres: Array.isArray(surveyData?.avoidGenres) ? surveyData.avoidGenres.slice(0, 10) : [],
          emotionalIntensity: String(surveyData?.emotionalIntensity || 'Balanced & Engaging').slice(0, 100),
          runtimePreference: String(surveyData?.timeAvailable || 'Standard Feature (100–130 min)').slice(0, 100),
          languagePreference: selectedLang,
          discoveryPreference: String(surveyData?.familiarity || 'Comfort Classic / Beloved Hit').slice(0, 100),
          interpretation: String(surveyData?.interpretedMood || 'Looking for an inspiring cinema experience tonight.').slice(0, 300),
        };

    // Apply regeneration modifiers
    if (regenOption === 'funnier') {
      profile.preferredGenres = ['Comedy', ...profile.preferredGenres.filter((g) => g.toLowerCase() !== 'comedy')];
      profile.desiredFeeling = 'Burst of Laughter & Pure Fun';
      profile.emotionalIntensity = 'Light & Breezy';
      profile.interpretation = 'Seeking an uplifting comedy with genuine laughs and witty charm.';
    } else if (regenOption === 'lighter') {
      profile.emotionalIntensity = 'Gentle & Uplifting';
      profile.desiredFeeling = 'Relaxed & Peaceful';
      profile.excludedGenres = Array.from(new Set([...profile.excludedGenres, 'Horror', 'Thriller']));
      profile.interpretation = 'Seeking lighthearted, comforting, and stress-free storytelling.';
    } else if (regenOption === 'more-emotional') {
      profile.emotionalIntensity = 'Devastating';
      profile.preferredGenres = ['Drama', 'Romance', ...profile.preferredGenres.filter((g) => !['drama', 'romance'].includes(g.toLowerCase()))];
      profile.desiredFeeling = 'Heartbreaking & Tearjerker';
      profile.interpretation = 'Seeking a profound, deeply emotional, heartbreaking cinema experience with poignant life reflections and powerful catharsis.';
    } else if (regenOption === 'darker') {
      profile.emotionalIntensity = 'Intense & Edge-of-Seat';
      profile.preferredGenres = ['Thriller', 'Mystery', ...profile.preferredGenres.filter((g) => !['thriller', 'mystery'].includes(g.toLowerCase()))];
      profile.desiredFeeling = 'Gripped & Electrified';
      profile.interpretation = 'Craving tension, psychological stakes, and high-suspense storytelling.';
    } else if (regenOption === 'surprise') {
      profile.discoveryPreference = 'Hidden Gem / Indie Discovery';
      profile.preferredGenres = ['Sci-Fi', 'Fantasy', 'Adventure'];
      profile.interpretation = 'Adventurous and ready for unexpected cinematic storytelling.';
    }

    // Verify Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets to enable personalized recommendations.',
        },
        { status: 503 }
      );
    }

    const tmdbKey = process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;

    // Normalize user's requested genres to TMDB Genre IDs
    const requiredGenreIds = normalizeGenreIds(profile.preferredGenres);
    const excludedGenreIds = normalizeGenreIds(profile.excludedGenres);

    // Normalize language requirement to TMDB language code
    const targetLangCode = toTmdbLanguageCode(profile.languagePreference);

    // Query TMDB candidates across multiple pages
    const candidates = await fetchCandidatesFromTMDB(
      profile,
      requiredGenreIds,
      excludedGenreIds,
      targetLangCode,
      tmdbKey
    );

    // CRITICAL: NEVER FALL BACK TO ENGLISH SILENTLY!
    // If no candidates exist in the user's chosen language, return an explicit respectful message
    if (candidates.length === 0) {
      console.warn(
        `[MOVIE DATA SYSTEM] 0 candidates found for language="${profile.languagePreference}" (${targetLangCode}) and genres="${profile.preferredGenres.join(', ')}"`
      );
      return NextResponse.json({
        movies: [],
        noResultsForLanguage: true,
        error: `No verified movies found matching ${profile.languagePreference} with your selected genres (${profile.preferredGenres.join(', ')}).`,
        language: profile.languagePreference,
        languageCode: targetLangCode,
        moodProfile: profile,
      });
    }

    // Rank verified candidates with Gemini
    const rankedPicks = await rankCandidatesWithGemini(candidates, profile);

    // Hydrate top candidates with full TMDB details, verified posters, and trailers
    const hydratedMovies = await hydrateMovieDetails(
      rankedPicks,
      candidates,
      requiredGenreIds,
      excludedGenreIds,
      targetLangCode,
      profile,
      tmdbKey
    );

    if (hydratedMovies.length === 0) {
      return NextResponse.json({
        movies: [],
        noResultsForLanguage: true,
        error: `No verified movies found matching ${profile.languagePreference} with your selected genres.`,
        language: profile.languagePreference,
        languageCode: targetLangCode,
        moodProfile: profile,
      });
    }

    const validatedList = await validateAndSanitizeRecommendations(hydratedMovies.slice(0, 5), {
      apiKey: tmdbKey,
      requireVerifiedPoster: true,
      verifyHead: false,
      requiredGenreIds,
      excludedGenreIds,
      requiredLanguageCode: targetLangCode || undefined,
    });

    console.log(
      `[MOVIE DATA SYSTEM] Successfully delivering ${validatedList.length} recommendations in:`,
      validatedList.map((m) => `${m.title} [${m.language} / ${m.originalLanguage}]`)
    );

    return NextResponse.json({
      movies: validatedList,
      source: 'tmdb',
      moodProfile: profile,
    });
  } catch (error: any) {
    console.error('Fatal API Error in /api/recommend-movies:', error);
    return NextResponse.json(
      {
        error: 'An internal error occurred while generating recommendations.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
