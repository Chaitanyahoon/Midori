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
    <div className="space-y-6 animate-fade-in">
      {/* Productivity Insights */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-purple-400/20 transition-colors duration-1000" />
        <CardHeader className="border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10 p-6">
          <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-purple-800 to-blue-600 dark:from-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
            <Icons.trendingUp className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 relative z-10">
          <div className="space-y-8">
            {/* Current Level */}
            <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-sm transition-transform hover:scale-[1.01] duration-300">
              <div
                className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-${insight.color}-500 to-${insight.color}-600 rounded-full flex items-center justify-center shadow-lg shadow-${insight.color}-500/30 animate-pulse-slow`}
              >
                <Icons.zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">{insight.level}</h3>
              <p className="text-base font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto">{insight.message}</p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-5 bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-inner">
              <div>
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Completion Rate</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}
                  className="h-2.5 bg-slate-200 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Focus Consistency</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {totalPomodorosThisWeek > 0 ? Math.min(Math.round((totalPomodorosThisWeek / weeklyPomodoroGoal) * 100), 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={totalPomodorosThisWeek > 0 ? Math.min((totalPomodorosThisWeek / weeklyPomodoroGoal) * 100, 100) : 0}
                  className="h-2.5 bg-slate-200 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Current Streak</span>
                  <span className="text-amber-600 dark:text-amber-400">{stats.streak} days</span>
                </div>
                <Progress value={Math.min((stats.streak / 7) * 100, 100)} className="h-2.5 bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">{(stats.totalFocusTime / 60).toFixed(1)}<span className="text-base font-bold text-slate-500">h</span></div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Focus</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">{stats.totalPomodoros}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Sessions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Daily Progress Insights */}
      {dailyInsights.length > 0 && (
        <div className="mt-8">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-4 flex items-center">
            <Icons.sparkles className="w-5 h-5 mr-2 text-emerald-500" /> Today's Insights
          </h4>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            {dailyInsights.map((insight, index) => (
              <div
                key={index}
                className={`flex-1 min-w-[220px] p-5 rounded-3xl border flex items-start gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer backdrop-blur-md
                  ${insight.type === "positive" || insight.type === "achievement"
                    ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                    : insight.type === "suggestion"
                      ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/20"
                      : "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/10 dark:border-blue-500/20"}
                `}
              >
                <div className="mt-1 text-2xl filter drop-shadow-sm">
                  {insight.type === "positive" || insight.type === "achievement"
                    ? "✨"
                    : insight.type === "suggestion"
                      ? "💡"
                      : "📈"}
                </div>
                <div>
                  <h5 className={`font-bold text-base mb-1 
                    ${insight.type === "positive" || insight.type === "achievement" ? "text-emerald-800 dark:text-emerald-300" :
                      insight.type === "suggestion" ? "text-amber-800 dark:text-amber-300" :
                        "text-blue-800 dark:text-blue-300"}
                  `}>{insight.title}</h5>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
