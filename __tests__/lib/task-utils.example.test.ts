/**
 * Unit tests for lib/task-utils.ts
 * Tests recurring task generation and pattern detection
 */

describe('task-utils', () => {
  describe('generateRecurrenceInstances', () => {
    it('should generate daily recurrence instances', () => {
      const instances = generateRecurrenceInstances(
        '2024-01-01',
        { type: 'daily' },
        '2024-01-01',
        7,
      )

      expect(instances).toHaveLength(7)
      expect(instances[0]).toBe('2024-01-01')
      expect(instances[6]).toBe('2024-01-07')
    })

    it('should generate weekly recurrence instances', () => {
      const instances = generateRecurrenceInstances(
        '2024-01-01',
        { type: 'weekly' },
        '2024-01-01',
        30,
      )

      expect(instances).toHaveLength(4) // ~4 weeks in 30 days
      expect(instances[1]).toBe('2024-01-08')
    })

    it('should stop recurrence at endDate', () => {
      const instances = generateRecurrenceInstances(
        '2024-01-01',
        { type: 'daily', endDate: '2024-01-05T00:00:00Z' },
        '2024-01-01',
        100,
      )

      expect(instances).toHaveLength(5)
      expect(instances[instances.length - 1]).toBe('2024-01-05')
    })

    it('should respect maxOccurrences limit', () => {
      const instances = generateRecurrenceInstances(
        '2024-01-01',
        { type: 'daily', maxOccurrences: 3 },
        '2024-01-01',
        100,
      )

      expect(instances).toHaveLength(3)
    })

    it('should handle custom intervals', () => {
      const instances = generateRecurrenceInstances(
        '2024-01-01',
        { type: 'custom', interval: 3 }, // Every 3 days
        '2024-01-01',
        10,
      )

      expect(instances[0]).toBe('2024-01-01')
      expect(instances[1]).toBe('2024-01-04')
      expect(instances[2]).toBe('2024-01-07')
    })
  })

  describe('getRecurrenceDescription', () => {
    it('should format daily recurrence', () => {
      const desc = getRecurrenceDescription({ type: 'daily' })
      expect(desc).toBe('Every day')
    })

    it('should format monthly recurrence with day', () => {
      const desc = getRecurrenceDescription({ type: 'monthly', dayOfMonth: 15 })
      expect(desc).toBe('Monthly on the 15th')
    })

    it('should format custom intervals', () => {
      const desc = getRecurrenceDescription({ type: 'custom', interval: 5 })
      expect(desc).toBe('Every 5 days')
    })
  })

  describe('dateMatchesRecurrence', () => {
    const originalDate = '2024-01-01'

    it('should match daily recurrence', () => {
      expect(dateMatchesRecurrence('2024-01-02', { type: 'daily' }, originalDate)).toBe(true)
      expect(dateMatchesRecurrence('2024-01-10', { type: 'daily' }, originalDate)).toBe(true)
    })

    it('should match weekly recurrence', () => {
      expect(dateMatchesRecurrence('2024-01-08', { type: 'weekly' }, originalDate)).toBe(true)
      expect(dateMatchesRecurrence('2024-01-02', { type: 'weekly' }, originalDate)).toBe(false)
    })

    it('should reject dates before original', () => {
      expect(dateMatchesRecurrence('2023-12-31', { type: 'daily' }, originalDate)).toBe(false)
    })
  })
})

/* To run these tests:

1. Create file at __tests__/lib/task-utils.test.ts
2. Import the test functions:

import {
  generateRecurrenceInstances,
  getRecurrenceDescription,
  dateMatchesRecurrence,
} from '@/lib/task-utils'

3. Run: npm run test -- __tests__/lib/task-utils.test.ts
*/
