"use client"

import {
  useDailyStats,
  useWeeklyStats,
  useProductivityPattern,
  useStreak,
  useInsights,
  useProductivityScore,
  useTimeRangeAnalytics,
  usePeriodComparison,
} from "@/lib/hooks/useAnalytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

/**
 * Analytics summary component showing key metrics
 */
export function AnalyticsSummary() {
  const dailyStats = useDailyStats()
  const weeklyStats = useWeeklyStats()
  const score = useProductivityScore()
  const streak = useStreak()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Daily Completion */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Today</p>
            <p className="text-2xl font-bold text-emerald-600">{dailyStats.tasksCompleted}</p>
            <p className="text-xs text-muted-foreground">tasks completed</p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Focus */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">This Week</p>
            <p className="text-2xl font-bold text-amber-600">{Math.round(weeklyStats.focusMinutes / 60)}h</p>
            <p className="text-xs text-muted-foreground">focus time</p>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Streak</p>
            <p className="text-2xl font-bold text-orange-600">{streak.current}🔥</p>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </div>
        </CardContent>
      </Card>

      {/* Productivity Score */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Score</p>
            <p className="text-2xl font-bold text-blue-600">{score}/100</p>
            <p className="text-xs text-muted-foreground">productivity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Productivity pattern insights component
 */
export function ProductivityPatterns() {
  const pattern = useProductivityPattern()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Best Time to Work</span>
          <Badge variant="secondary">{pattern.bestTime}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Most Productive Day</span>
          <Badge variant="secondary">{pattern.bestDay}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Favorite Category</span>
          <Badge variant="secondary" className="capitalize">
            {pattern.bestCategory}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Average Completion</span>
          <Badge variant="secondary">{pattern.averageDailyCompletion}%</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Insights and suggestions component
 */
export function InsightsPanel() {
  const insights = useInsights()

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No insights available yet. Keep working to unlock recommendations!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Insights & Tips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 5).map((insight, i) => (
          <div key={i} className="border-l-2 border-emerald-400 pl-3 py-1">
            <p className="font-medium text-sm">{insight.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{insight.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * 30-day productivity trend chart
 */
export function ProductivityTrendChart() {
  const { dailyStats } = useTimeRangeAnalytics(30)

  const chartData = dailyStats.slice(-30).map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    completion: day.completionRate,
    focus: Math.round(day.focusMinutes / 60), // Convert to hours
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">30-Day Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: "12px" }} />
            <YAxis style={{ fontSize: "12px" }} />
            <Tooltip />
            <Line type="monotone" dataKey="completion" stroke="#10b981" name="Completion %" strokeWidth={2} />
            <Line type="monotone" dataKey="focus" stroke="#f59e0b" name="Focus Hours" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Period comparison component (week or month)
 */
export function PeriodComparison({ period = "week" }: { period?: "week" | "month" }) {
  const comparison = usePeriodComparison(period)
  const isWeek = period === "week"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isWeek ? "Weekly" : "Monthly"} Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{comparison.current.completionRate}%</span>
              <Badge
                variant={comparison.completionChange > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {comparison.completionChange > 0 ? "+" : ""}{comparison.completionChange}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Focus Time</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{Math.round(comparison.current.focusMinutes / 60)}h</span>
              <Badge
                variant={comparison.focusChange > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {comparison.focusChange > 0 ? "+" : ""}{Math.round(comparison.focusChange / 60)}h
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sessions</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{comparison.current.focusSessions}</span>
              <Badge
                variant={comparison.sessionChange > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {comparison.sessionChange > 0 ? "+" : ""}{comparison.sessionChange}
              </Badge>
            </div>
          </div>
        </div>

        {comparison.isImproving && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded p-2 text-xs text-emerald-900 dark:text-emerald-100">
            📈 You're improving compared to last {isWeek ? "week" : "month"}!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
