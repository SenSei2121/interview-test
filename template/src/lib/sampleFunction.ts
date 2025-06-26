import { embed } from './openai'
import { VoiceEntry, ProcessedResult, Task } from './types'

/**
 * processEntries
 * --------------
 * PURE function — no IO, no mutation, deterministic.
 */
export async function processEntries(entries: VoiceEntry[], query?: string): Promise<ProcessedResult> {
  const tags: Record<string, number> = {}
  const tasks: Task[] = []

  let queryVec: number[] | null = null
  if (query?.trim()) {
    queryVec = await embed(query)
  }

  for (const entry of entries) {
    // Track tag frequency
    entry.tags_user?.forEach(tag => {
      const clean = tag?.trim()
      if (clean) tags[clean] = (tags[clean] || 0) + 1
    })

    const text = entry.transcript_user?.toLowerCase() || ''
    if (!text.match(/\b(schedule|call|submit|organize|reply|clean|buy)\b/)) continue

    const task: Task = {
      task_text: entry.transcript_user || '',
      due_date: extractDueDate(text),
      status: 'pending',
      category: detectCategory(text),
    }

    if (queryVec && entry.embedding) {
      task.score = computeScore(queryVec, entry.embedding)
    }

    tasks.push(task)
  }

  if (queryVec) {
    tasks.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }

  return {
    summary: `Total: ${entries.length} entries, ${tasks.length} tasks extracted`,
    tagFrequencies: tags,
    tasks,
  }
}

function extractDueDate(text: string): string | null {
  const match = text.match(/\b(today|tomorrow|this week|next week)\b/)
  return match ? match[0] : null
}

function detectCategory(text: string): string {
  if (/work|email|meeting/.test(text)) return 'Work'
  if (/mom|friend|call/.test(text)) return 'Personal'
  if (/doctor|health|run/.test(text)) return 'Health'
  if (/clean|organize|garage/.test(text)) return 'Home'
  return 'Other'
}

function computeScore(a: number[], b: number[]): number {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0))
  const magB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0))
  return magA && magB ? dot / (magA * magB) : 0
}

export default processEntries