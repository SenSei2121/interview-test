// src/lib/tags_model.ts

export interface TagResult {
  text: string;
  tags: Record<string, number>;
}

/**
 * List of tags we detect.
 */
export const TAGS = [
  'sentiment_positive',
  'sentiment_negative',
  'self_doubt',
  'action_item',
  'future_intent',
  'reflection',
] as const;

/**
 * Classifying a single utterance into tags.
 */
export function tagText(text: string): TagResult {
  const lowered = text.toLowerCase();

  // initializing all tags to 0
  const tags: Record<string, number> = {};
  for (const t of TAGS) tags[t] = 0;

  // Sentiment detection
  const positiveWords = ['happy', 'excited', 'lighter', 'right call', 'smarter', 'love'];
  const negativeWords = ['guilty', 'worried', 'afraid', 'anxiety', 'overwhelmed', 'scared', 'doubts'];
  if (positiveWords.some(w => lowered.includes(w))) {
    tags.sentiment_positive = 1;
  }
  if (negativeWords.some(w => lowered.includes(w))) {
    tags.sentiment_negative = 1;
  }

  // Self‑doubt: "I ... but ..." or "I ... though ..."
  if (/\bi\b.*\bbut\b/.test(lowered) || /\bi\b.*\bthough\b/.test(lowered)) {
    tags.self_doubt = 1;
  }

  // Action items: imperative start or TODO style
  if (/^(buy|drop|backup|message|need to|don't forget)/.test(lowered)) {
    tags.action_item = 1;
  }

  // Future intent OR just words indicating future plans
  if (/\btomorrow\b/.test(lowered)
   || /\bplanning\b/.test(lowered)
   || /\bwill\b/.test(lowered)
   || /\bintend\b/.test(lowered)) {
    tags.future_intent = 1;
  }

  // Reflection: past-tense reflective verbs
  if (/\bI (had|walked|reflected|thought)\b/.test(text)) {
    tags.reflection = 1;
  }

  return { text, tags };
}
