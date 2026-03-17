/**
 * Unit tests for lib/analytics.ts
 * Tests analytics calculations and pattern detection
 */

describe('Analytics Functions', () => {
  // Mock data
  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      completed: true,
      priority: 'high',
      category: 'work',
      createdAt: '2024-01-15T08:00:00Z',
      completedAt: '2024-01-15T10:00:00Z',
      dueDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Task 2',
      completed: false,
      priority: 'medium',
      category: 'personal',
      createdAt: '2024-01-15T08:00:00Z',
      dueDate: '2024-01-15',
    },
  ]

  const mockPomodoros = [
    {
      id: '1',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T09:25:00Z',
      duration: 25,
      completed: true,
    },
    {
      id: '2',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T10:25:00Z',
      duration: 25,
      completed: true,
    },
  ]

  describe('calculateDailyStats', () => {
    it('should calculate daily statistics correctly', () => {
      const stats = calculateDailyStats('2024-01-15', mockTasks, mockPomodoros)

      expect(stats.date).toBe('2024-01-15')
      expect(stats.tasksCompleted).toBe(1) // Only task 1
      expect(stats.focusMinutes).toBe(50) // Two 25-min sessions
      expect(stats.focusSessions).toBe(2)
      expect(stats.completionRate).toBe(50) // 1 of 2 tasks
    })

    it('should return 0% completion for days with no tasks', () => {
      const stats = calculateDailyStats('2024-01-16', mockTasks, mockPomodoros)

      expect(stats.tasksCompleted).toBe(0)
      expect(stats.completionRate).toBe(0)
    })
  })

  describe('detectProductivityPattern', () => {
    it('should detect productivity patterns', () => {
      const pattern = detectProductivityPattern(mockTasks, mockPomodoros)

      expect(pattern.bestDay).toBeDeDefined()
      expect(pattern.bestTime).toBeDefined()
      expect(pattern.bestCategory).toBeDefined()
      expect(pattern.bestPriority).toBeDefined()
      expect(typeof pattern.averageDailyCompletion).toBe('number')
    })

    it('should handle empty data', () => {
      const pattern = detectProductivityPattern([], [])

      expect(pattern.bestDay).toBe('Unknown')
      expect(pattern.bestTime).toBe('Unknown')
      expect(pattern.averageDailyCompletion).toBe(0)
    })
  })

  describe('calculateStreak', () => {
    const tasksWithCompletedDates = [
      {
        id: '1',
        title: 'Task 1',
        completed: true,
        priority: 'high',
        category: 'work',
        createdAt: '2024-01-13T08:00:00Z',
        completedAt: '2024-01-15T10:00:00Z',
        dueDate: '2024-01-15',
      },
      {
        id: '2',
        title: 'Task 2',
        completed: true,
        priority: 'high',
        category: 'work',
        createdAt: '2024-01-14T08:00:00Z',
        completedAt: '2024-01-16T10:00:00Z',
        dueDate: '2024-01-16',
      },
    ]

    it('should calculate consecutive day streaks', () => {
      const today = new Date().toISOString().split('T')[0]
      const streak = calculateStreak(tasksWithCompletedDates, today)

      expect(typeof streak.current).toBe('number')
      expect(typeof streak.longest).toBe('number')
      expect(streak.isActiveToday).toBe(false) // No completed task today - expect(typeof streak.nextMilestone).toBe('number')
    })

    it('should calculate longest streak', () => {
      const streak = calculateStreak(tasksWithCompletedDates, '2024-01-16')

      expect(streak.longest).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateProductivityScore', () => {
    it('should calculate productivity score 0-100', () => {
      const dailyStats = [
        { ...new mock DailyStats(), completionRate: 100 },
        { ...new mock DailyStats(), completionRate: 80 },
        { ...new mock DailyStats(), completionRate: 60 },
      ]

      const streak = { current: 5, longest: 10, lastActiveDate: '2024-01-15', isActiveToday: true, nextMilestone: 10 }

      const score = calculateProductivityScore(dailyStats, streak)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should return 0 for empty data', () => {
      const score = calculateProductivityScore([], { current: 0, longest: 0, lastActiveDate: '2024-01-15', isActiveToday: false, nextMilestone: 10 })

      expect(score).toBe(0)
    })

    it('should reward streaks', () => {
      const dailyStats = [
        { date: '2024-01-15', tasksCompleted: 1, focusMinutes: 60, focusSessions: 2, completionRate: 50 },
      ]

      const streakNoBonus = { current: 0, longest: 0, lastActiveDate: '2024-01-15', isActiveToday: false, nextMilestone: 10 }
      const streakWithBonus = { current: 10, longest: 20, lastActiveDate: '2024-01-15', isActiveToday: true, nextMilestone: 20 }

      const scoreNoBonus = calculateProductivityScore(dailyStats, streakNoBonus)
      const scoreWithBonus = calculateProductivityScore(dailyStats, streakWithBonus)

      expect(scoreWithBonus).toBeGreaterThan(scoreNoBonus)
    })
  })

  describe('generateInsights', () => {
    it('should generate insights', () => {
      const streak = { current: 7, longest: 10, lastActiveDate: '2024-01-15', isActiveToday: true, nextMilestone: 10 }
      const stats = { completionRate: 80, totalFocusTime: 300 }

      const insights = generateInsights(mockTasks, mockPomodoros, stats, streak)

      expect(Array.isArray(insights)).toBe(true)
      expect(insights.every((i) => i.type && i.title && i.message)).toBe(true)
    })

    it('should warn on low completion rate', () => {
      const streak = { current: 0, longest: 0, lastActiveDate: '2024-01-15', isActiveToday: false, nextMilestone: 10 }
      const stats = { completionRate: 20, totalFocusTime: 50 }

      const insights = generateInsights([], [], stats, streak)
      const warningInsight = insights.find((i) => i.type === 'warning')

      expect(warningInsight).toBeDefined()
    })

    it('should celebrate high streaks', () => {
      const streak = { current: 30, longest: 30, lastActiveDate: '2024-01-15', isActiveToday: true, nextMilestone: 30 }
      const stats = { completionRate: 90, totalFocusTime: 500 }

      const insights = generateInsights(mockTasks, mockPomodoros, stats, streak)
      const achievementInsight = insights.find((i) => i.type === 'achievement')

      expect(achievementInsight).toBeDefined()
    })
  })
})

/* To run these tests:

1. Create file at __tests__/lib/analytics.test.ts
2. Import the functions:

import {
  calculateDailyStats,
  detectProductivityPattern,
  calculateStreak,
  calculateProductivityScore,
  generateInsights,
  type DailyStats,
  type StreakInfo,
} from '@/lib/analytics'

3. Run: npm run test -- __tests__/lib/analytics.test.ts
*/
