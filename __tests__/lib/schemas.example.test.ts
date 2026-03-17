/**
 * Unit tests for lib/schemas.ts
 * Tests Zod schema validation
 */

describe('Validation Schemas', () => {
  describe('TaskSchema', () => {
    it('should validate a valid task', () => {
      const validTask = {
        id: 'task-1',
        title: 'My Task',
        completed: false,
        priority: 'high',
        category: 'work',
        createdAt: '2024-01-15T10:00:00Z',
      }

      const result = TaskSchema.safeParse(validTask)
      expect(result.success).toBe(true)
    })

    it('should reject task with invalid priority', () => {
      const invalidTask = {
        id: 'task-1',
        title: 'My Task',
        completed: false,
        priority: 'urgent', // Invalid
        category: 'work',
        createdAt: '2024-01-15T10:00:00Z',
      }

      const result = TaskSchema.safeParse(invalidTask)
      expect(result.success).toBe(false)
    })

    it('should reject task with empty title', () => {
      const invalidTask = {
        id: 'task-1',
        title: '', // Too short
        completed: false,
        priority: 'high',
        category: 'work',
        createdAt: '2024-01-15T10:00:00Z',
      }

      const result = TaskSchema.safeParse(invalidTask)
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const taskWithoutOptional = {
        id: 'task-1',
        title: 'My Task',
        completed: false,
        priority: 'high',
        category: 'work',
        createdAt: '2024-01-15T10:00:00Z',
        // description and dueDate are optional
      }

      const result = TaskSchema.safeParse(taskWithoutOptional)
      expect(result.success).toBe(true)
    })
  })

  describe('RecurrencePatternSchema', () => {
    it('should validate daily recurrence', () => {
      const pattern = { type: 'daily' }
      const result = RecurrencePatternSchema.safeParse(pattern)
      expect(result.success).toBe(true)
    })

    it('should validate monthly with dayOfMonth', () => {
      const pattern = { type: 'monthly', dayOfMonth: 15 }
      const result = RecurrencePatternSchema.safeParse(pattern)
      expect(result.success).toBe(true)
    })

    it('should reject invalid dayOfMonth', () => {
      const pattern = { type: 'monthly', dayOfMonth: 32 } // Invalid day
      const result = RecurrencePatternSchema.safeParse(pattern)
      expect(result.success).toBe(false)
    })

    it('should validate custom interval', () => {
      const pattern = { type: 'custom', interval: 5 }
      const result = RecurrencePatternSchema.safeParse(pattern)
      expect(result.success).toBe(true)
    })
  })

  describe('UserSettingsSchema', () => {
    it('should validate settings with defaults', () => {
      const settings = {
        userName: 'John Doe',
        userTone: 'casual',
        aiStyle: 'brief',
        notifications: 'frequent',
        dailyGoalTasks: 5,
        dailyGoalPomodoros: 6,
        dailyGoalHours: 3,
      }

      const result = UserSettingsSchema.safeParse(settings)
      expect(result.success).toBe(true)
    })

    it('should allow null values for optional fields', () => {
      const settings = {
        userName: null,
        userTone: null,
        aiStyle: null,
        notifications: null,
        dailyGoalTasks: 5,
        dailyGoalPomodoros: 6,
        dailyGoalHours: 3,
      }

      const result = UserSettingsSchema.safeParse(settings)
      expect(result.success).toBe(true)
    })

    it('should reject invalid dailyGoalTasks', () => {
      const settings = {
        dailyGoalTasks: 0, // Must be >= 1
        dailyGoalPomodoros: 6,
        dailyGoalHours: 3,
      }

      const result = UserSettingsSchema.safeParse(settings)
      expect(result.success).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    describe('validateTaskCreate', () => {
      it('should validate task creation data', () => {
        const taskData = {
          title: 'New Task',
          completed: false,
          priority: 'medium',
          category: 'personal',
        }

        const result = validateTaskCreate(taskData)
        expect(result.success).toBe(true)
      })

      it('should reject task without title', () => {
        const taskData = {
          completed: false,
          priority: 'medium',
          category: 'personal',
        }

        const result = validateTaskCreate(taskData)
        expect(result.success).toBe(false)
      })
    })

    describe('validateAiResponse', () => {
      it('should validate AI response structure', () => {
        const response = {
          response: 'Here is your schedule',
          taskSuggestions: [
            {
              title: 'Review Tasks',
              duration: 30,
              time: '09:00',
              priority: 'high',
              category: 'work',
            },
          ],
        }

        const result = validateAiResponse(response)
        expect(result.success).toBe(true)
      })

      it('should allow empty taskSuggestions', () => {
        const response = {
          response: 'No suggestions for now',
          taskSuggestions: [],
        }

        const result = validateAiResponse(response)
        expect(result.success).toBe(true)
      })

      it('should reject without response field', () => {
        const response = {
          taskSuggestions: [],
        }

        const result = validateAiResponse(response)
        expect(result.success).toBe(false)
      })
    })
  })
})

/* To run these tests:

1. Create file at __tests__/lib/schemas.test.ts
2. Import the schemas:

import {
  TaskSchema,
  RecurrencePatternSchema,
  UserSettingsSchema,
  validateTaskCreate,
  validateAiResponse,
} from '@/lib/schemas'

3. Run: npm run test -- __tests__/lib/schemas.test.ts
*/
