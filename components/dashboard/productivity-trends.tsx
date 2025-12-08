"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// Removed unused Badge import
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function ProductivityTrends() {
  const { tasks, pomodoros, stats, settings } = useData()

  // Calculate weekly trends with real data
  const getWeeklyData = () => {
    const today = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === dateString).length

      const dayPomodoros = pomodoros.filter(
        (session) => session.completed && session.startTime.split("T")[0] === dateString,
      ).length

      const dayFocusTime =
        pomodoros
          .filter((session) => session.completed && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60

      weekData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        date: dateString,
        tasks: dayTasks,
        pomodoros: dayPomodoros,
        focusTime: dayFocusTime,
        isToday: dateString === today.toISOString().split("T")[0],
      })
    }

    return weekData
  }

  const weeklyData = getWeeklyData()
  // derived stats for logic
  const totalTasksThisWeek = weeklyData.reduce((sum, day) => sum + day.tasks, 0)
  const totalPomodorosThisWeek = weeklyData.reduce((sum, day) => sum + day.pomodoros, 0)
  const avgTasksPerDay = totalTasksThisWeek / 7
  // const avgPomodorosPerDay = totalPomodorosThisWeek / 7 // Unused

  // Dynamic values from settings (fallback to defaults)
  const dailyGoalTasks = settings?.dailyGoalTasks || 3
  const dailyGoalPomodoros = settings?.dailyGoalPomodoros || 4

  // Get productivity insights
  const getProductivityInsight = () => {
    if (totalTasksThisWeek === 0)
      return { level: "Getting Started", color: "blue", message: "Complete your first task to start tracking!" }
    if (avgTasksPerDay >= dailyGoalTasks)
      return { level: "Highly Productive", color: "green", message: "Excellent! You're consistently hitting your goals." }
    if (avgTasksPerDay >= dailyGoalTasks * 0.5)
      return { level: "Good Progress", color: "emerald", message: "Good momentum! You're halfway to your daily targets." }
    if (avgTasksPerDay >= 0.5)
      return {
        level: "Building Habits",
        color: "yellow",
        message: "You're on the right track. Keep building momentum!",
      }
    return { level: "Just Starting", color: "gray", message: "Every expert was once a beginner. You've got this!" }
  }

  const insight = getProductivityInsight()

  // Add after the existing getProductivityInsight function
  const getDailyProgressInsights = () => {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const todayTasks = tasks.filter((t) => t.completedAt && t.completedAt.split("T")[0] === today).length
    const yesterdayTasks = tasks.filter((t) => t.completedAt && t.completedAt.split("T")[0] === yesterday).length

    const todayPomodoros = pomodoros.filter((p) => p.completed && p.startTime.split("T")[0] === today).length

    // Unused variable
    // const yesterdayPomodoros = pomodoros.filter((p) => p.completed && p.startTime.split("T")[0] === yesterday).length

    const insights = []

    // Task completion insights
    if (todayTasks > yesterdayTasks) {
      insights.push({
        type: "positive",
        title: "Great Progress! 📈",
        message: `You completed ${todayTasks - yesterdayTasks} more tasks than yesterday. Keep it up!`,
      })
    } else if (todayTasks < yesterdayTasks && yesterdayTasks > 0) {
      insights.push({
        type: "suggestion",
        title: "Room for Improvement 💪",
        message: `You completed ${yesterdayTasks - todayTasks} fewer tasks than yesterday. Try a quick 25-min focus session!`,
      })
    }

    // Focus session insights
    if (todayPomodoros >= dailyGoalPomodoros) {
      insights.push({
        type: "achievement",
        title: "Focus Master! 🎯",
        message: `${todayPomodoros} focus sessions today! You're crushing it.`,
      })
    } else if (todayPomodoros === 0) {
      insights.push({
        type: "motivation",
        title: "Start Your Focus Journey 🚀",
        message: "No focus sessions yet today. Even 25 minutes can make a big difference!",
      })
    }

    return insights
  }

  const dailyInsights = getDailyProgressInsights()
  const weeklyPomodoroGoal = dailyGoalPomodoros * 7

  return (
    <div className="space-y-6">
      {/* Productivity Insights */}
      <Card className="bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Icons.trendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Level */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
              <div
                className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-${insight.color}-500 to-${insight.color}-600 rounded-full flex items-center justify-center`}
              >
                <Icons.zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{insight.level}</h3>
              <p className="text-sm text-gray-600">{insight.message}</p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Focus Consistency</span>
                  <span className="font-medium">
                    {totalPomodorosThisWeek > 0 ? Math.min(Math.round((totalPomodorosThisWeek / weeklyPomodoroGoal) * 100), 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={totalPomodorosThisWeek > 0 ? Math.min((totalPomodorosThisWeek / weeklyPomodoroGoal) * 100, 100) : 0}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-medium">{stats.streak} days</span>
                </div>
                <Progress value={Math.min((stats.streak / 7) * 100, 100)} className="h-2" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 bg-white/60 rounded-2xl border border-purple-100">
                <div className="text-lg font-bold text-gray-900">{(stats.totalFocusTime / 60).toFixed(1)}h</div>
                <div className="text-xs text-gray-600">Total Focus</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-2xl border border-purple-100">
                <div className="text-lg font-bold text-gray-900">{stats.totalPomodoros}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Daily Progress Insights */}
      {dailyInsights.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Today's Insights</h4>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            {dailyInsights.map((insight, index) => (
              <div
                key={index}
                className={`flex-1 min-w-[220px] p-4 rounded-2xl border flex items-start gap-3 transition-shadow hover:shadow-md cursor-pointer
                  ${insight.type === "positive" || insight.type === "achievement"
                    ? "bg-green-50 border-green-200"
                    : insight.type === "suggestion"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"}
                `}
              >
                <span className="mt-1 mr-2 text-xl">
                  {insight.type === "positive" || insight.type === "achievement"
                    ? "✅"
                    : insight.type === "suggestion"
                      ? "💡"
                      : "📊"}
                </span>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">{insight.title}</h5>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
