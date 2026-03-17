"use client"

/**
 * React hooks for analytics functionality.
 * Provides easy access to productivity metrics and insights.
 */

import { useMemo } from "react"
import { useData } from "@/components/local-data-provider"
import {
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateYearlyStats,
  detectProductivityPattern,
  calculateStreak,
  generateInsights,
  calculateProductivityScore,
  type DailyStats,
  type WeeklyStats,
  type MonthlyStats,
  type YearlyStats,
  type ProductivityPattern,
  type StreakInfo,
  type InsightSuggestion,
} from "@/lib/analytics"

/**
 * Hook for calculating daily stats
 */
export function useDailyStats(date?: string) {
  const { tasks, pomodoros } = useData()
  const targetDate = date || new Date().toISOString().split("T")[0]

  return useMemo(() => {
    return calculateDailyStats(targetDate, tasks, pomodoros)
  }, [targetDate, tasks, pomodoros])
}

/**
 * Hook for calculating weekly stats
 */
export function useWeeklyStats(weekStart?: string) {
  const { tasks, pomodoros } = useData()
  const today = new Date()
  const dayOfWeek = today.getDay()
  const week = new Date(today)
  week.setDate(today.getDate() - dayOfWeek)
  const defaultWeekStart = weekStart || week.toISOString().split("T")[0]

  return useMemo(() => {
    return calculateWeeklyStats(defaultWeekStart, tasks, pomodoros)
  }, [defaultWeekStart, tasks, pomodoros])
}

/**
 * Hook for calculating monthly stats
 */
export function useMonthlyStats(year?: number, month?: number) {
  const { tasks, pomodoros } = useData()
  const now = new Date()
  const targetYear = year || now.getFullYear()
  const targetMonth = month || now.getMonth() + 1

  return useMemo(() => {
    return calculateMonthlyStats(targetYear, targetMonth, tasks, pomodoros)
  }, [targetYear, targetMonth, tasks, pomodoros])
}

/**
 * Hook for calculating yearly stats
 */
export function useYearlyStats(year?: number) {
  const { tasks, pomodoros } = useData()
  const targetYear = year || new Date().getFullYear()

  return useMemo(() => {
    return calculateYearlyStats(targetYear, tasks, pomodoros)
  }, [targetYear, tasks, pomodoros])
}

/**
 * Hook for detecting productivity patterns
 */
export function useProductivityPattern(): ProductivityPattern {
  const { tasks, pomodoros } = useData()

  return useMemo(() => {
    return detectProductivityPattern(tasks, pomodoros)
  }, [tasks, pomodoros])
}

/**
 * Hook for calculating streak
 */
export function useStreak(): StreakInfo {
  const { tasks, stats } = useData()

  return useMemo(() => {
    return calculateStreak(
      tasks,
      stats.lastActiveDate || new Date().toISOString().split("T")[0],
    )
  }, [tasks, stats])
}

/**
 * Hook for generating insights
 */
export function useInsights(): InsightSuggestion[] {
  const { tasks, pomodoros, stats } = useData()
  const streak = useStreak()

  return useMemo(() => {
    return generateInsights(tasks, pomodoros, stats, streak)
  }, [tasks, pomodoros, stats, streak])
}

/**
 * Hook for productivity score
 */
export function useProductivityScore() {
  const { tasks, pomodoros } = useData()
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  return useMemo(() => {
    const dailyStatsList: DailyStats[] = []
    const current = new Date(thirtyDaysAgo)

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0]
      dailyStatsList.push(calculateDailyStats(dateStr, tasks, pomodoros))
      current.setDate(current.getDate() + 1)
    }

    const streak = calculateStreak(tasks, today.toISOString().split("T")[0])
    return calculateProductivityScore(dailyStatsList, streak)
  }, [tasks, pomodoros])
}

/**
 * Hook for time-range analytics
 */
export function useTimeRangeAnalytics(days: number = 30) {
  const { tasks, pomodoros } = useData()
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - days)

  return useMemo(() => {
    const dailyStats: DailyStats[] = []
    const current = new Date(startDate)

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0]
      dailyStats.push(calculateDailyStats(dateStr, tasks, pomodoros))
      current.setDate(current.getDate() + 1)
    }

    const totalCompleted = dailyStats.reduce((sum, day) => sum + day.tasksCompleted, 0)
    const totalFocusMinutes = dailyStats.reduce((sum, day) => sum + day.focusMinutes, 0)
    const averageCompletion =
      dailyStats.length > 0
        ? Math.round(dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / dailyStats.length)
        : 0

    return {
      dailyStats,
      totalCompleted,
      totalFocusMinutes,
      averageCompletion,
      daysAnalyzed: dailyStats.length,
    }
  }, [days, tasks, pomodoros])
}

/**
 * Hook for comparing periods
 */
export function usePeriodComparison(period: "week" | "month" = "week") {
  const { tasks, pomodoros } = useData()
  const currentStats =
    period === "week"
      ? useWeeklyStats()
      : useMonthlyStats()

  const previousStats = useMemo(() => {
    const now = new Date()
    if (period === "week") {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() - 7)
      return calculateWeeklyStats(
        weekStart.toISOString().split("T")[0],
        tasks,
        pomodoros,
      )
    } else {
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth()
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
      return calculateMonthlyStats(lastYear, lastMonth, tasks, pomodoros)
    }
  }, [period, tasks, pomodoros])

  return useMemo(() => {
    const completionChange = currentStats.completionRate - previousStats.completionRate
    const focusChange = currentStats.focusMinutes - previousStats.focusMinutes
    const sessionChange = currentStats.focusSessions - previousStats.focusSessions

    return {
      current: currentStats,
      previous: previousStats,
      completionChange,
      focusChange,
      sessionChange,
      isImproving: completionChange > 0,
    }
  }, [currentStats, previousStats])
}
