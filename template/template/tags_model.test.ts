// template/tags_model.test.ts

import { describe, it, expect } from 'vitest';
import { tagText, TAGS } from '../src/lib/tags_model';

describe('tags_model rule‑based tagger', () => {
  it('tags self-doubt correctly', () => {
    const txt = "I kind of don’t want to go to the party, but I also don’t want them to think I’m avoiding them.";
    const { tags } = tagText(txt);
    expect(tags.self_doubt).toBe(1);
    expect(tags.sentiment_negative).toBe(0);
  });

  it('tags an action item', () => {
    const { tags } = tagText("Buy groceries after work, running low on eggs and milk.");
    expect(tags.action_item).toBe(1);
  });

  it('tags future intent', () => {
    const { tags } = tagText("Tomorrow I’m going to the dentist in the morning.");
    expect(tags.future_intent).toBe(1);
  });

  it('tags reflection', () => {
    const { tags } = tagText("I had a long walk after work and reflected on how I react to feedback.");
    expect(tags.reflection).toBe(1);
  });

  it('detects sentiment positive', () => {
    const { tags } = tagText("I’m excited about the new project!");
    expect(tags.sentiment_positive).toBe(1);
  });

  it('detects sentiment negative', () => {
    const { tags } = tagText("I feel overwhelmed by all this work.");
    expect(tags.sentiment_negative).toBe(1);
  });

  it('always returns every tag with a 0 or 1 value', () => {
    const { tags } = tagText("Some random sentence without triggers.");
    const keys = Object.keys(tags).sort();
    expect(keys).toEqual([...TAGS].sort());
    for (const k of keys) {
      expect([0, 1]).toContain(tags[k]);
    }
  });
});
