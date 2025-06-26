import fs from 'node:fs'
import path from 'node:path'

import { VoiceEntry } from './types'

// Path to the CSV that ships with the template
const csvPath = path.resolve(
  new URL('.', import.meta.url).pathname,
  'Expanded_Diary_Entries.csv'
)

let raw = ''
try {
  raw = fs.readFileSync(csvPath, 'utf8')
} catch {
  // If the file cannot be read for some reason (e.g. distributed without CSV)
  // fall back to a small stub so tests keep working.
  raw = 'dummy\nline'
}

// Remove first header line and empty trailing newline, then count rows
const rowCount = Math.max(0, raw.trim().split('\n').length - 1)

// Build a minimal VoiceEntry object. For unit-tests we only care about tags_user,
// but we populate required fields to satisfy the strict compiler.
function buildEntry(id: number): VoiceEntry {
  const iso = new Date().toISOString()
  return {
    id: String(id),
    user_id: 'mock',
    audio_url: null,
    transcript_raw: '',
    transcript_user: '',
    language_detected: 'en',
    language_rendered: 'en',
    tags_model: [],
    tags_user: ['reflection'],
    category: null,
    created_at: iso,
    updated_at: iso,
    emotion_score_score: null,
    embedding: null,
  }
}

export const mockVoiceEntries: VoiceEntry[] = Array.from({ length: rowCount }).map((_, i) => buildEntry(i)) 