// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-expect-error vitest types are provided via tsconfig "types"
import { describe, test, expect } from 'vitest'
import processEntries from '../src/lib/sampleFunction'
import { mockVoiceEntries } from '../src/lib/mockData'

describe('processEntries()', () => {
  test('should count the "reflection" tag accurately', async () => {
    const result = await processEntries(mockVoiceEntries)
    const expected = mockVoiceEntries.filter(e => e.tags_user.includes('reflection')).length
    expect(result.tagFrequencies.reflection).toBe(expected)
  })

  test('should handle an empty entry array', async () => {
    const result = await processEntries([])
    expect(result.tasks).toEqual([])
    expect(result.tagFrequencies).toEqual({})
    expect(result.summary).toContain('0 entries')
  })

  test('should extract tasks with status and category', async () => {
    const result = await processEntries(mockVoiceEntries)
    for (const task of result.tasks) {
      expect(task.status).toBe('pending')
      expect(typeof task.category).toBe('string')
      expect(task.task_text.length).toBeGreaterThan(0)
    }
  })

  test('should assign due dates when time phrases are present', async () => {
    const customMock = [
      {
        id: '1',
        user_id: 'u',
        created_at: '2025-06-23T12:00:00Z',
        transcript_user: 'Submit the assignment by tomorrow',
        tags_user: [],
      },
    ]
    const result = await processEntries(customMock)
    expect(result.tasks[0].due_date?.toLowerCase()).toContain('tomorrow')
  })

  test('should sort tasks by score when a query is provided', async () => {
    const result = await processEntries(mockVoiceEntries, 'schedule health task')
    if (result.tasks.length >= 2) {
      const scores = result.tasks.map(t => t.score ?? 0)
      expect(scores).toEqual([...scores].sort((a, b) => b - a))
    }
  })
})
