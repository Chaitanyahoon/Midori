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
          <div key={i} className="bg-white/40 dark:bg-emerald-950/5 border border-white/20 dark:border-emerald-800/10 rounded-[2rem_0.5rem_2.5rem_0.75rem] p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem_0.25rem_1.25rem_0.4rem]" />
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
    return session.startTime && session.startTime.split("T")[0] === today && session.completed
  }).length

  const todayFocusTime =
    pomodoros
      .filter((session) => {
        return session.startTime && session.startTime.split("T")[0] === today && session.completed
      })
      .reduce((sum, session) => sum + session.duration, 0) / 60

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  const statsData = [
    {
      title: "Seeds Cultivated 🌱",
      value: todayTasks.toString(),
      total: `${stats.completedTasks} total`,
      icon: Icons.flower,
      accent: "emerald",
      progress: Math.min((todayTasks / 5) * 100, 100),
    },
    {
      title: "Zen Concentration 🧘",
      value: todayPomodoros.toString(),
      total: `${stats.totalPomodoros} total`,
      icon: Icons.tree,
      accent: "blue",
      progress: Math.min((todayPomodoros / 8) * 100, 100),
    },
    {
      title: "Incubation Hours ☀️",
      value: `${todayFocusTime.toFixed(1)}h`,
      total: `${(stats.totalFocusTime / 60).toFixed(1)}h total`,
      icon: Icons.sun,
      accent: "purple",
      progress: Math.min((todayFocusTime / 4) * 100, 100),
    },
    {
      title: "Vitality Index 📈",
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
      progressBar: "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse",
      border: "border-emerald-500/20 dark:border-emerald-500/10",
    },
    blue: {
      iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      iconShadow: "shadow-blue-500/25",
      valueText: "text-blue-700 dark:text-blue-400",
      progressBar: "bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse",
      border: "border-blue-500/20 dark:border-blue-500/10",
    },
    purple: {
      iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
      iconShadow: "shadow-purple-500/25",
      valueText: "text-purple-700 dark:text-purple-400",
      progressBar: "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse",
      border: "border-purple-500/20 dark:border-purple-500/10",
    },
    orange: {
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
      iconShadow: "shadow-orange-500/25",
      valueText: "text-orange-700 dark:text-orange-400",
      progressBar: "bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse",
      border: "border-orange-500/20 dark:border-orange-500/10",
    },
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {statsData.map((stat, index) => {
        const styles = accentStyles[stat.accent as keyof typeof accentStyles]
        return (
          <div
            key={index}
            className={`relative bg-white/50 dark:bg-emerald-950/5 border ${styles.border} rounded-[2rem_0.5rem_2.5rem_0.75rem] group p-4 sm:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-500 overflow-hidden`}
          >
            {/* Botanical background branch */}
            <svg 
              className="absolute bottom-0 right-0 w-28 h-28 text-emerald-600/[0.04] dark:text-emerald-400/[0.03] pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700" 
              viewBox="0 0 100 100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path d="M10,90 Q40,65 55,35 Q65,20 85,15" />
              <path d="M35,60 C25,50 20,40 18,35 C28,33 32,45 35,60 Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M50,43 C55,25 45,18 40,15 C43,23 48,35 50,43 Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M65,22 C78,15 82,8 85,2 C75,5 70,12 65,22 Z" fill="currentColor" fillOpacity="0.1" />
            </svg>

            <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider uppercase">
                  {stat.title}
                </p>
                <p className={`text-2xl sm:text-3xl font-black ${styles.valueText} tracking-tight leading-none`}>
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1.5 truncate">
                  {stat.total}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ml-2 flex-shrink-0 ${styles.iconBg} rounded-[1rem_0.25rem_1.25rem_0.4rem] shadow-lg ${styles.iconShadow} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden relative z-10">
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
