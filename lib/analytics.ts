/**
 * Advanced analytics and insights generation.
 * Provides deeper analytics beyond basic stats.
 */

import type { Task, PomodoroSession } from "@/components/local-data-provider"

export interface DailyStats {
  date: string
  tasksCompleted: number
  focusMinutes: number
  focusSessions: number
  completionRate: number // 0-100
}

export interface WeeklyStats extends DailyStats {
  week: number
  year: number
  totalDays: number
}

export interface MonthlyStats extends DailyStats {
  month: number
  year: number
  totalDays: number
}

export interface YearlyStats extends DailyStats {
  year: number
}

export interface ProductivityPattern {
  bestDay: string // Day of week
  bestTime: string // Hour (e.g., "09:00")
  bestCategory: string
  bestPriority: string
  averageDailyCompletion: number
}

export interface StreakInfo {
  current: number
  longest: number
  lastActiveDate: string
  isActiveToday: boolean
  nextMilestone: number
}

export interface InsightSuggestion {
  type: "achievement" | "warning" | "tip" | "pattern"
  title: string
  message: string
  action?: string
  priority: "low" | "medium" | "high"
}

/**
 * Calculate stats for a specific day
 */
export function calculateDailyStats(
  date: string,
  tasks: Task[],
  pomodoros: PomodoroSession[],
): DailyStats {
  const dayTasks = tasks.filter((t) => t.dueDate === date)
  const completedTasks = dayTasks.filter((t) => t.completed).length
  const daySessions = pomodoros.filter((p) => p.startTime.startsWith(date) && p.completed)
  const focusMinutes = daySessions.reduce((sum, p) => sum + p.duration, 0)

  return {
    date,
    tasksCompleted: completedTasks,
    focusMinutes,
    focusSessions: daySessions.length,
    completionRate: dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0,
  }
}

/**
 * Calculate stats for a specific week
 */
export function calculateWeeklyStats(
  weekStart: string,
  tasks: Task[],
  pomodoros: PomodoroSession[],
): WeeklyStats {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const weekTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const taskDate = new Date(t.dueDate)
    return taskDate >= start && taskDate < end
  })

  const completedTasks = weekTasks.filter((t) => t.completed).length
  const weekSessions = pomodoros.filter((p) => {
    const pomDate = new Date(p.startTime)
    return pomDate >= start && pomDate < end && p.completed
  })

  const focusMinutes = weekSessions.reduce((sum, p) => sum + p.duration, 0)
  const [year, month, day] = weekStart.split("-")
  const weekNum = Math.ceil((parseInt(day) / 7))

  return {
    date: weekStart,
    week: weekNum,
    year: parseInt(year),
    tasksCompleted: completedTasks,
    focusMinutes,
    focusSessions: weekSessions.length,
    completionRate: weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0,
    totalDays: weekTasks.length,
  }
}

/**
 * Calculate stats for a specific month
 */
export function calculateMonthlyStats(
  year: number,
  month: number,
  tasks: Task[],
  pomodoros: PomodoroSession[],
): MonthlyStats {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  const monthTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const taskDate = new Date(t.dueDate)
    return taskDate >= start && taskDate < end
  })

  const completedTasks = monthTasks.filter((t) => t.completed).length
  const monthSessions = pomodoros.filter((p) => {
    const pomDate = new Date(p.startTime)
    return pomDate >= start && pomDate < end && p.completed
  })

  const focusMinutes = monthSessions.reduce((sum, p) => sum + p.duration, 0)
  const daysInMonth = new Date(year, month, 0).getDate()

  return {
    date: `${year}-${String(month).padStart(2, "0")}-01`,
    month,
    year,
    tasksCompleted: completedTasks,
    focusMinutes,
    focusSessions: monthSessions.length,
    completionRate: monthTasks.length > 0 ? Math.round((completedTasks / monthTasks.length) * 100) : 0,
    totalDays: daysInMonth,
  }
}

/**
 * Calculate yearly stats
 */
export function calculateYearlyStats(
  year: number,
  tasks: Task[],
  pomodoros: PomodoroSession[],
): YearlyStats {
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)

  const yearTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const taskDate = new Date(t.dueDate)
    return taskDate >= start && taskDate < end
  })

  const completedTasks = yearTasks.filter((t) => t.completed).length
  const yearSessions = pomodoros.filter((p) => {
    const pomDate = new Date(p.startTime)
    return pomDate >= start && pomDate < end && p.completed
  })

  const focusMinutes = yearSessions.reduce((sum, p) => sum + p.duration, 0)

  return {
    date: `${year}-01-01`,
    year,
    tasksCompleted: completedTasks,
    focusMinutes,
    focusSessions: yearSessions.length,
    completionRate: yearTasks.length > 0 ? Math.round((completedTasks / yearTasks.length) * 100) : 0,
  }
}

/**
 * Detect productivity patterns
 */
export function detectProductivityPattern(
  tasks: Task[],
  pomodoros: PomodoroSession[],
): ProductivityPattern {
  const dayStats = new Map<string, number[]>() // Map of day name to completion rates
  const timeStats = new Map<string, number[]>() // Map of hour to completion rates
  const categoryStats = new Map<string, number>() // Category to completion count
  const priorityStats = new Map<string, number>() // Priority to completion count

  // Analyze tasks by day of week
  tasks.forEach((task) => {
    if (!task.dueDate) return
    const date = new Date(task.dueDate)
    const day = date.toLocaleDateString("en-US", { weekday: "long" })
    const hour = String(date.getHours()).padStart(2, "0") + ":00"

    if (!dayStats.has(day)) dayStats.set(day, [])
    dayStats.get(day)!.push(task.completed ? 1 : 0)

    if (!timeStats.has(hour)) timeStats.set(hour, [])
    timeStats.get(hour)!.push(task.completed ? 1 : 0)

    categoryStats.set(task.category, (categoryStats.get(task.category) || 0) + (task.completed ? 1 : 0))
    priorityStats.set(task.priority, (priorityStats.get(task.priority) || 0) + (task.completed ? 1 : 0))
  })

  // Calculate averages
  const dayAverages = Array.from(dayStats.entries()).map(([day, rates]) => ({
    day,
    avg: rates.reduce((a, b) => a + b, 0) / rates.length,
  }))

  const timeAverages = Array.from(timeStats.entries()).map(([time, rates]) => ({
    time,
    avg: rates.reduce((a, b) => a + b, 0) / rates.length,
  }))

  const bestDay = dayAverages.length > 0
    ? dayAverages.reduce((best, current) => (current.avg > best.avg ? current : best)).day
    : "Unknown"

  const bestTime = timeAverages.length > 0
    ? timeAverages.reduce((best, current) => (current.avg > best.avg ? current : best)).time
    : "Unknown"

  const bestCategory = Array.from(categoryStats.entries()).reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ["Unknown", 0],
  )[0]

  const bestPriority = Array.from(priorityStats.entries()).reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ["Unknown", 0],
  )[0]

  const averageDailyCompletion =
    tasks.length > 0
      ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      : 0

  return {
    bestDay,
    bestTime,
    bestCategory,
    bestPriority,
    averageDailyCompletion,
  }
}

/**
 * Calculate streak information
 */
export function calculateStreak(
  tasks: Task[],
  lastActiveDate: string,
): StreakInfo {
  const today = new Date().toISOString().split("T")[0]
  const tasksByDate = new Map<string, number>()

  // Count completed tasks by date
  tasks.forEach((task) => {
    if (!task.completedAt) return
    const date = task.completedAt.split("T")[0]
    tasksByDate.set(date, (tasksByDate.get(date) || 0) + 1)
  })

  // Calculate current streak
  let current = 0
  let checkDate = new Date(today)
  while (tasksByDate.has(checkDate.toISOString().split("T")[0])) {
    current++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Calculate longest streak
  const dates = Array.from(tasksByDate.keys()).sort()
  let longest = 0
  let currentStreak = 0
  let prevDate: string | null = null

  dates.forEach((date) => {
    const currDate = new Date(date)
    if (prevDate === null) {
      currentStreak = 1
    } else {
      const prevDateObj = new Date(prevDate)
      const daysDiff = Math.floor((currDate.getTime() - prevDateObj.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        currentStreak++
      } else {
        longest = Math.max(longest, currentStreak)
        currentStreak = 1
      }
    }
    prevDate = date
  })
  longest = Math.max(longest, currentStreak)

  const isActiveToday = today === lastActiveDate
  const nextMilestone = Math.ceil((current + 1) / 10) * 10

  return {
    current,
    longest,
    lastActiveDate,
    isActiveToday,
    nextMilestone,
  }
}

/**
 * Generate insights based on usage patterns
 */
export function generateInsights(
  tasks: Task[],
  pomodoros: PomodoroSession[],
  stats: any,
  streak: StreakInfo,
): InsightSuggestion[] {
  const insights: InsightSuggestion[] = []
  const pattern = detectProductivityPattern(tasks, pomodoros)

  // Achievement insights
  if (streak.current >= 7) {
    insights.push({
      type: "achievement",
      title: "7-Day Streak! 🔥",
      message: `You've maintained a ${streak.current}-day streak. Keep it up!`,
      priority: "low",
    })
  }

  if (streak.current >= streak.nextMilestone) {
    insights.push({
      type: "achievement",
      title: `${streak.nextMilestone}-Day Milestone!`,
      message: `Incredible consistency! You're at ${streak.current} days.`,
      priority: "low",
    })
  }

  // Productivity warnings
  if (stats.completionRate < 30) {
    insights.push({
      type: "warning",
      title: "Low Completion Rate",
      message: `Your completion rate is ${stats.completionRate}%. Try setting smaller, more achievable goals.`,
      priority: "high",
    })
  }

  if (pomodoros.length < 2) {
    insights.push({
      type: "tip",
      title: "Start Using Focus Sessions",
      message: "The Pomodoro Technique can help you stay focused. Try starting a 25-minute session!",
      priority: "medium",
    })
  }

  // Pattern insights
  if (pattern.bestTime !== "Unknown") {
    insights.push({
      type: "pattern",
      title: "Your Productive Hour",
      message: `You're most productive around ${pattern.bestTime}. Schedule important tasks then!`,
      priority: "low",
    })
  }

  if (pattern.bestDay !== "Unknown") {
    insights.push({
      type: "pattern",
      title: `Best Day: ${pattern.bestDay}`,
      message: `You tend to complete more tasks on ${pattern.bestDay}s. Plan accordingly!`,
      priority: "low",
    })
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Calculate productivity score (0-100)
 */
export function calculateProductivityScore(
  dailyStats: DailyStats[],
  streak: StreakInfo,
): number {
  if (dailyStats.length === 0) return 0

  const avgCompletion = dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / dailyStats.length
  const streakBonus = Math.min(streak.current * 2, 30) // Max 30 point bonus
  const consistencyBonus = (dailyStats.filter((d) => d.completionRate > 50).length / dailyStats.length) * 20

  return Math.min(100, Math.round(avgCompletion * 0.5 + streakBonus + consistencyBonus))
}
