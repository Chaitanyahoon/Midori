"use client"

import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function QuickStats() {
  const { stats, tasks, pomodoros, loading } = useData()

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-zen p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    )
  }

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
      accent: "emerald",
      progress: Math.min((todayTasks / 5) * 100, 100),
    },
    {
      title: "Focus Sessions",
      value: todayPomodoros.toString(),
      total: `${stats.totalPomodoros} total`,
      icon: Icons.tree,
      accent: "blue",
      progress: Math.min((todayPomodoros / 8) * 100, 100),
    },
    {
      title: "Growth Time",
      value: `${todayFocusTime.toFixed(1)}h`,
      total: `${(stats.totalFocusTime / 60).toFixed(1)}h total`,
      icon: Icons.sun,
      accent: "purple",
      progress: Math.min((todayFocusTime / 4) * 100, 100),
    },
    {
      title: "Success Rate",
      value: `${completionRate}%`,
      total: `${stats.streak} day streak`,
      icon: Icons.sprout,
      accent: "orange",
      progress: completionRate,
    },
  ]

  const accentStyles = {
    emerald: {
      iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      iconShadow: "shadow-emerald-500/25",
      valueText: "text-emerald-700 dark:text-emerald-400",
      progressBar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      border: "accent-left-emerald",
    },
    blue: {
      iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      iconShadow: "shadow-blue-500/25",
      valueText: "text-blue-700 dark:text-blue-400",
      progressBar: "bg-gradient-to-r from-blue-400 to-blue-500",
      border: "accent-left-blue",
    },
    purple: {
      iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
      iconShadow: "shadow-purple-500/25",
      valueText: "text-purple-700 dark:text-purple-400",
      progressBar: "bg-gradient-to-r from-violet-400 to-purple-500",
      border: "accent-left-purple",
    },
    orange: {
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
      iconShadow: "shadow-orange-500/25",
      valueText: "text-orange-700 dark:text-orange-400",
      progressBar: "bg-gradient-to-r from-amber-400 to-orange-500",
      border: "accent-left-orange",
    },
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {statsData.map((stat, index) => {
        const styles = accentStyles[stat.accent as keyof typeof accentStyles]
        return (
          <div
            key={index}
            className={`card-zen ${styles.border} group p-4 sm:p-5`}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wide uppercase">
                  {stat.title}
                </p>
                <p className={`text-2xl sm:text-3xl font-black ${styles.valueText} tracking-tight leading-none`}>
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-1.5 truncate">
                  {stat.total}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ml-2 flex-shrink-0 ${styles.iconBg} rounded-xl shadow-lg ${styles.iconShadow} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${styles.progressBar} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

