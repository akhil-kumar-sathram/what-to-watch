import { Movie, MoodSurveyData, MoodType } from '../types';
import { MOVIE_DATABASE } from '../data/movies';

export function generateMoodInterpretation(mood: MoodType | null, dayDescription: string): string {
  const desc = (dayDescription || '').toLowerCase();

  if (mood === 'Stressed' || desc.includes('work') || desc.includes('boss') || desc.includes('deadline') || desc.includes('busy')) {
    return 'Sounds like you’ve been carrying the weight of the day and need a gentle, restorative escape tonight.';
  }

  if (mood === 'Tired' || desc.includes('exhausted') || desc.includes('drain') || desc.includes('sleepy')) {
    return 'Sounds like your energy is running on empty and you need pure, low-stakes comfort with zero stress.';
  }

  if (mood === 'Happy' || mood === 'Excited' || desc.includes('great') || desc.includes('fun') || desc.includes('celebrat')) {
    return 'Sounds like you have great positive momentum and need an energetic, vibrant cinematic celebration to match your high spirits.';
  }

  if (mood === 'Sad' || desc.includes('lonely') || desc.includes('cry') || desc.includes('heart') || desc.includes('rough')) {
    return 'Sounds like your heart needs gentle kindness, warm empathy, and an uplifting reminder that everything will be okay.';
  }

  if (mood === 'Heartbroken' || desc.includes('breakup') || desc.includes('heartbroken') || desc.includes('grief')) {
    return 'Sounds like you are carrying deep emotional pain and need a cathartic, poetic film that honors your feelings and gently guides you toward healing.';
  }

  if (mood === 'Bored' || desc.includes('nothing') || desc.includes('routine') || desc.includes('dull')) {
    return 'Sounds like you’re stuck in a rut and need a fast-paced, clever adventure to shake your brain awake.';
  }

  if (mood === 'Romantic' || desc.includes('date') || desc.includes('love') || desc.includes('partner') || desc.includes('crush')) {
    return 'Sounds like you are in the mood for poetic intimacy, warm conversations, and an authentic spark of romance.';
  }

  if (mood === 'Motivated' || desc.includes('workout') || desc.includes('goal') || desc.includes('dream') || desc.includes('build')) {
    return 'Sounds like your ambition is primed and you need an electrifying story of grit and relentless passion to stoke your fire.';
  }

  if (mood === 'Relaxed' || desc.includes('chill') || desc.includes('peace') || desc.includes('weekend')) {
    return 'Sounds like you’re already in a serene state of mind and want an atmospheric, beautifully crafted story to savor.';
  }

  return 'Sounds like you need a relaxing escape tonight.';
}

export function generatePersonalizedWhyItFits(movie: Movie, survey: MoodSurveyData): string {
  const mood = survey.primaryMood || 'your current mood';
  const feeling = survey.afterFeeling || 'comforted';
  const experience = survey.experienceType || 'escapism';

  const tailoredReasons: Record<string, string> = {
    'walter-mitty': `Since you're feeling ${mood.toLowerCase()} and seeking ${feeling.toLowerCase()}, Walter Mitty's awe-inspiring escape from mundane routine delivers the exact dose of visual freedom and courage you need.`,
    'spirited-away': `Because your moment calls for ${experience.toLowerCase()}, this hand-drawn masterpiece wraps you in a serene, stress-free dreamscape that lets your mind completely unwind.`,
    'knives-out': `Matching your desire for an engaging, fast-paced distraction, this whip-smart whodunnit absorbs your attention with witty dialogue and satisfying puzzle reveals.`,
    'before-sunrise': `Directly aligning with your romantic, reflective mindset, this film’s natural banter and atmospheric Vienna night offer a genuine, heart-soothing connection.`,
    'interstellar': `Chosen for your desire for a grand, mind-bending journey—its awe-inspiring cosmic scale and emotional heart will leave you deeply moved and grounded in what matters.`,
    'paddington-2': `Tailored specifically to alleviate any ${mood.toLowerCase()} tension, Paddington’s pure warmth and whimsical optimism provide unmatched cinematic comfort.`,
    'whiplash': `Synchronized with your craving for high adrenaline and motivation, its electrifying pace and intense rhythmic drive will leave you completely energized.`,
    'grand-budapest': `Its candy-colored pastels, razor-sharp wit, and symmetrical beauty act as the perfect palate-cleanser for your day.`,
    'arrival': `For an evening seeking thoughtful depth, this philosophical sci-fi honors your emotional intelligence with a profound, beautifully humane story.`,
    'little-miss-sunshine': `The perfect antidote to a demanding day—its dysfunctional yet deeply loving family journey will have you laughing through genuine emotional release.`,
    'amelie': `Its golden Parisian charm, playful optimism, and buoyant score are scientifically proven to dissolve daily blues and leave you smiling.`,
    'chef': `Low stakes, mouthwatering food, and soulful Latin rhythms make this the ultimate restorative comfort watch to help you decompress.`,
    'past-lives': `Honoring your introspective and tender headspace, this quiet masterpiece provides an exquisitely sensitive meditation on destiny and human affection.`,
    'everything-everywhere': `Delivers an exhilarating, mind-bending thrill that ultimately grounds you in warmth, profound family catharsis, and unconditional kindness.`,
    'la-la-land': `Infuses your evening with intoxicating musical romance, vibrant colors, and infectious passion to lift your spirits high into the stars.`,
    'ford-v-ferrari': `A high-octane celebration of human grit and unwavering friendship that will shake off any sluggishness and spark pure adrenaline.`,
    'eternal-sunshine': `Taps into your desire for emotional depth and mind-bending resonance, finding surreal beauty and reassurance even inside vulnerability.`,
    'hunt-for-wilderpeople': `Clever, laugh-out-loud funny, and set against breathtaking New Zealand mountains—guaranteed to turn your evening into pure joy.`,
  };

  return tailoredReasons[movie.id] || movie.whyItFits;
}

const INDIAN_LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Punjabi'];

export function isLanguageMatch(movieLang: string, targetLang: string): boolean {
  if (!targetLang) return true;
  const t = targetLang.trim().toLowerCase();
  if (t === 'any language' || t.includes('open to anything') || t === 'all' || t.includes('international')) {
    return true;
  }
  if (t === 'any indian language') {
    return INDIAN_LANGUAGES.some((il) => il.toLowerCase() === movieLang.toLowerCase());
  }
  return movieLang.toLowerCase() === t;
}

export function matchMovies(survey: MoodSurveyData): Movie[] {
  const selectedLang = (survey.languagePreference || survey.language || '').trim();
  const isUnrestrictedLang =
    !selectedLang ||
    selectedLang.toLowerCase() === 'any language' ||
    selectedLang.toLowerCase().includes('open to anything') ||
    selectedLang.toLowerCase().includes('international');

  // If specific language is requested, strictly restrict candidate pool to that language only
  let candidates = MOVIE_DATABASE;
  if (!isUnrestrictedLang) {
    const matchingLangMovies = MOVIE_DATABASE.filter((m) => isLanguageMatch(m.language, selectedLang));
    candidates = matchingLangMovies;
    if (candidates.length === 0) {
      return [];
    }
  }

  const scored = candidates.map((movie) => {
    let score = 50;

    // Mood alignment
    if (survey.primaryMood === 'Stressed' || survey.primaryMood === 'Tired') {
      if (movie.vibeIntensity === 'Gentle') score += 30;
      if (movie.emotionalTags.includes('Comforting') || movie.emotionalTags.includes('Stress-Relief') || movie.emotionalTags.includes('Low-Stress')) score += 35;
      if (movie.vibeIntensity === 'Intense') score -= 25;
    } else if (survey.primaryMood === 'Motivated' || survey.primaryMood === 'Excited') {
      if (movie.emotionalTags.includes('Electric') || movie.emotionalTags.includes('Electrifying') || movie.emotionalTags.includes('Motivated') || movie.emotionalTags.includes('Inspiring')) score += 35;
      if (movie.vibeIntensity === 'Intense' || movie.vibeIntensity === 'Moderate') score += 20;
    } else if (survey.primaryMood === 'Romantic') {
      if (movie.genres.includes('Romance')) score += 40;
      if (movie.emotionalTags.includes('Romantic') || movie.emotionalTags.includes('Intimate')) score += 30;
    } else if (survey.primaryMood === 'Bored') {
      if (movie.emotionalTags.includes('Clever') || movie.emotionalTags.includes('Exhilarating') || movie.genres.includes('Mystery')) score += 35;
    } else if (survey.primaryMood === 'Sad') {
      if (movie.emotionalTags.includes('Heartfelt') || movie.emotionalTags.includes('Uplifting') || movie.emotionalTags.includes('Comforting') || movie.emotionalTags.includes('Cathartic')) score += 35;
    }

    // After feeling
    if (survey.afterFeeling) {
      if (survey.afterFeeling.includes('Comforted') && (movie.emotionalTags.includes('Comforting') || movie.emotionalTags.includes('Soulful'))) score += 25;
      if (survey.afterFeeling.includes('Uplifted') && (movie.emotionalTags.includes('Uplifting') || movie.emotionalTags.includes('Triumphant'))) score += 25;
      if (survey.afterFeeling.includes('Electrified') && (movie.emotionalTags.includes('Electric') || movie.emotionalTags.includes('Electrifying') || movie.emotionalTags.includes('Motivated'))) score += 30;
      if (survey.afterFeeling.includes('Thoughtful') && (movie.emotionalTags.includes('Thoughtful') || movie.emotionalTags.includes('Mind-Bending') || movie.emotionalTags.includes('Poetic'))) score += 30;
      if (survey.afterFeeling.includes('Amused') && (movie.genres.includes('Comedy') || movie.emotionalTags.includes('Laughing') || movie.emotionalTags.includes('Hilarious'))) score += 25;
      if (survey.afterFeeling.includes('Cathartic') && movie.emotionalTags.includes('Cathartic')) score += 30;
    }

    // Preferred genres bonus
    if (survey.preferredGenres && survey.preferredGenres.length > 0) {
      const matchCount = survey.preferredGenres.filter((g) => movie.genres.includes(g)).length;
      score += matchCount * 20;
    }

    // Avoid genres penalty
    if (survey.avoidGenres && survey.avoidGenres.length > 0) {
      if (survey.avoidGenres.includes('Heavy Violence / Horror') && (movie.emotionalTags.includes('Visceral') || movie.emotionalTags.includes('Gritty'))) score -= 50;
      if (survey.avoidGenres.includes('High-Stress Tension') && movie.vibeIntensity === 'Intense') score -= 50;
      if (survey.avoidGenres.includes('Heartbreak / Tragedy') && movie.emotionalTags.includes('Bittersweet')) score -= 40;
      if (survey.avoidGenres.includes('Cheesy Romance') && movie.genres.includes('Romance')) score -= 20;
    }

    // Emotional intensity
    if (survey.emotionalIntensity) {
      if (survey.emotionalIntensity.includes('Gentle') && movie.vibeIntensity === 'Gentle') score += 25;
      if (survey.emotionalIntensity.includes('Deep & Gripping') && movie.vibeIntensity === 'Intense') score += 25;
      if (survey.emotionalIntensity.includes('Balanced') && movie.vibeIntensity === 'Moderate') score += 20;
    }

    // Familiarity / Era
    if (survey.familiarity) {
      if (survey.familiarity.includes('Classic') && movie.era === 'Classic') score += 20;
      if (survey.familiarity.includes('Indie') && movie.era === 'Indie') score += 20;
      if (survey.familiarity.includes('Blockbuster') && movie.era === 'Modern Blockbuster') score += 20;
    }

    // Language matching score weight
    if (!isUnrestrictedLang) {
      if (isLanguageMatch(movie.language, selectedLang)) {
        score += 300; // Prioritize selected language heavily
      } else {
        score -= 200; // Strong penalty if not matching language
      }
    }

    // Base score with RT score and Rating weight
    score += movie.rating * 2;

    return {
      movie: {
        ...movie,
        whyItFits: generatePersonalizedWhyItFits(movie, survey),
      },
      score,
    };
  });

  // Sort descending by score and pick exactly 5
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((item) => item.movie);
}
