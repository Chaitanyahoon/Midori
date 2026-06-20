"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function DailyProgressTracker() {
  const { tasks, pomodoros, stats, loading } = useData()

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="h-3 w-10 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  // Calculate today's data
  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter((t) => t.completedAt && t.completedAt.split("T")[0] === today)
  const todayPomodoros = pomodoros.filter((p) => p.completed && p.startTime && p.startTime.split("T")[0] === today)
  const todayFocusTime = todayPomodoros.reduce((sum, p) => sum + p.duration, 0) / 60

  // Calculate streak and patterns
  const getConsecutiveDays = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter((t) => t.completedAt && t.completedAt.split("T")[0] === dateString).length
      const dayPomodoros = pomodoros.filter((p) => p.completed && p.startTime && p.startTime.split("T")[0] === dateString).length

      days.push({
        date: dateString,
        day: date.toLocaleDateString("en", { weekday: "short" }),
        tasks: dayTasks,
        pomodoros: dayPomodoros,
        active: dayTasks > 0 || dayPomodoros > 0,
        isToday: dateString === today,
      })
    }
    return days
  }

  const weekDays = getConsecutiveDays()
  const activeStreak = weekDays.filter((d) => d.active).length

  // Daily goals
  const dailyGoals = {
    tasks: 3,
    pomodoros: 4,
    focusHours: 2,
  }

  // Progress percentages
  const taskProgress = Math.min((todayTasks.length / dailyGoals.tasks) * 100, 100)
  const pomodoroProgress = Math.min((todayPomodoros.length / dailyGoals.pomodoros) * 100, 100)
  const focusProgress = Math.min((todayFocusTime / dailyGoals.focusHours) * 100, 100)

  // Smart recommendations
  const getRecommendations = () => {
    const recommendations = []
    const currentHour = new Date().getHours()

    if (todayTasks.length === 0 && currentHour < 18) {
      recommendations.push({
        icon: Icons.target,
        title: "Start with a quick task",
        description: "Complete one small task to build momentum for the day.",
        action: "View Tasks",
        color: "emerald",
      })
    }

    if (todayPomodoros.length === 0 && currentHour < 20) {
      recommendations.push({
        icon: Icons.timer,
        title: "Begin your first focus session",
        description: "A 25-minute Pomodoro session can help you get into flow state.",
        action: "Start Pomodoro",
        color: "blue",
      })
    }

    if (todayPomodoros.length >= 2 && todayTasks.length < 2) {
      recommendations.push({
        icon: Icons.sparkles,
        title: "Great focus! Complete some tasks",
        description: "You've been focused - now turn that energy into completed tasks.",
        action: "Check Tasks",
        color: "purple",
      })
    }

    if (todayTasks.length >= 3 && todayPomodoros.length < 2) {
      recommendations.push({
        icon: Icons.zap,
        title: "You're productive! Add focus time",
        description: "Balance your task completion with dedicated focus sessions.",
        action: "Start Focus",
        color: "orange",
      })
    }

    return recommendations.slice(0, 2) // Show max 2 recommendations
  }

  const recommendations = getRecommendations()

  return (
    <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Icons.calendar className="w-5 h-5 mr-2 text-emerald-600" />
            Today's Progress
          </div>
          <Badge className={`${activeStreak >= 5 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
            {activeStreak}/7 active days
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Daily Goals Progress */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray={`${taskProgress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{todayTasks.length}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Tasks</p>
            <p className="text-xs text-emerald-600 font-medium">Goal: {dailyGoals.tasks}</p>
          </div>

          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray={`${pomodoroProgress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{todayPomodoros.length}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Focus</p>
            <p className="text-xs text-blue-600 font-medium">Goal: {dailyGoals.pomodoros}</p>
          </div>

          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray={`${focusProgress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{todayFocusTime.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Hours</p>
            <p className="text-xs text-purple-600 font-medium">Goal: {dailyGoals.focusHours}h</p>
          </div>
        </div>

        {/* Weekly Activity Pattern */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">7-Day Activity</h4>
          <div className="flex items-center justify-between">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                    day.isToday
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-200"
                      : day.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {day.tasks + day.pomodoros}
                </div>
                <p className="text-xs text-gray-500">{day.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Smart Suggestions</h4>
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border bg-${rec.color}-50 border-${rec.color}-200`}>
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 bg-${rec.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <rec.icon className={`w-4 h-4 text-${rec.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{rec.title}</h5>
                    <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {todayTasks.length === 0 && todayPomodoros.length === 0
              ? "Ready to make today productive? 🚀"
              : todayTasks.length >= dailyGoals.tasks
                ? "Amazing! You've hit your daily task goal! 🎉"
                : todayPomodoros.length >= dailyGoals.pomodoros
                  ? "Great focus today! Keep the momentum going! 💪"
                  : "You're making progress! Keep going! ⭐"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
