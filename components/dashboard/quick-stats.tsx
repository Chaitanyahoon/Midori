"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function QuickStats() {
  const { stats, tasks, pomodoros } = useData()

  const today = new Date().toISOString().split("T")[0]

  const todayTasks = tasks.filter((task) => {
    return task.completedAt && task.completedAt.split("T")[0] === today
  }).length

  const todayPomodoros = pomodoros.filter((session) => {
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  const todayFocusTime =
    pomodoros
      .filter((session) => {
        return session.startTime.split("T")[0] === today && session.completed
      })
      .reduce((sum, session) => sum + session.duration, 0) / 60

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  const statsData = [
    {
      title: "Tasks Bloomed",
      value: todayTasks.toString(),
      total: `${stats.completedTasks} total`,
      icon: Icons.flower,
      color: "emerald",
      progress: Math.min((todayTasks / 5) * 100, 100),
    },
    {
      title: "Focus Sessions",
      value: todayPomodoros.toString(),
      total: `${stats.totalPomodoros} total`,
      icon: Icons.tree,
      color: "blue",
      progress: Math.min((todayPomodoros / 8) * 100, 100),
    },
    {
      title: "Growth Time",
      value: `${todayFocusTime.toFixed(1)}h`,
      total: `${(stats.totalFocusTime / 60).toFixed(1)}h total`,
      icon: Icons.sun,
      color: "purple",
      progress: Math.min((todayFocusTime / 4) * 100, 100),
    },
    {
      title: "Success Rate",
      value: `${completionRate}%`,
      total: `${stats.streak} day streak`,
      icon: Icons.sprout,
      color: "orange",
      progress: completionRate,
    },
  ]

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      progress: "bg-emerald-500",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      border: "border-blue-200 dark:border-blue-800",
      icon: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      progress: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/10",
      border: "border-purple-200 dark:border-purple-800",
      icon: "bg-purple-500",
      text: "text-purple-700 dark:text-purple-400",
      progress: "bg-purple-500",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/10",
      border: "border-orange-200 dark:border-orange-800",
      icon: "bg-orange-500",
      text: "text-orange-700 dark:text-orange-400",
      progress: "bg-orange-500",
    },
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-bloom">
      {statsData.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses]
        return (
          <Card
            key={index}
            className={`${colors.bg} border ${colors.border} shadow-sm rounded-2xl hover:scale-105 transition-transform duration-300 group`}
          >
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 tracking-wide uppercase">
                    {stat.title}
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold ${colors.text} mb-1 tracking-tight`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                    {stat.total}
                  </p>
                </div>
                <div className={`w-9 h-9 sm:w-12 sm:h-12 ml-2 flex-shrink-0 ${colors.icon} rounded-xl shadow-md flex items-center justify-center group-hover:rotate-6 transition-transform duration-500`}>
                  <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className={`h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden`}>
                <div className={`h-full ${colors.progress} rounded-full transition-all duration-500`} style={{ width: `${stat.progress}%` }} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
