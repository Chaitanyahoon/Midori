"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useData } from "@/components/local-data-provider"
import { InsightsDemoBanner } from "@/components/dashboard/insights-demo-banner"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { type Task, type PomodoroSession } from "@/components/local-data-provider"

const ProductivityCharts = dynamic(() => import("@/components/dashboard/productivity-charts").then(m => ({ default: m.ProductivityCharts })), { ssr: false })
const WeeklyStats = dynamic(() => import("@/components/dashboard/weekly-stats").then(m => ({ default: m.WeeklyStats })), { ssr: false })
const ProductivityTrends = dynamic(() => import("@/components/dashboard/productivity-trends").then(m => ({ default: m.ProductivityTrends })), { ssr: false })

export default function InsightsPage() {
  const { tasks, pomodoros, loading, settings, stats } = useData()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setIsActive(true)
  }, [])

  // 1. Calculate Peak Focus Hours / Days
  const getPeakFocusAnalytics = (sessions: PomodoroSession[]) => {
    const completed = sessions.filter(s => s.completed && s.startTime)
    if (completed.length === 0) {
      return {
        peakHourRange: "09:00 AM - 11:00 AM",
        peakDay: "Monday",
        totalCompleted: 0
      }
    }

    const hourCounts: Record<number, number> = {}
    const dayCounts: Record<number, number> = {}

    completed.forEach(s => {
      try {
        const date = new Date(s.startTime)
        const hour = date.getHours()
        const day = date.getDay() // 0 = Sunday, 1 = Monday, etc.
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
        dayCounts[day] = (dayCounts[day] || 0) + 1
      } catch (e) {}
    })

    let peakHour = 9
    let maxHourCount = 0
    Object.entries(hourCounts).forEach(([h, count]) => {
      if (count > maxHourCount) {
        maxHourCount = count
        peakHour = parseInt(h, 10)
      }
    })

    let peakDayNum = 1
    let maxDayCount = 0
    Object.entries(dayCounts).forEach(([d, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count
        peakDayNum = parseInt(d, 10)
      }
    })

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const peakDay = days[peakDayNum]

    const formatHourStr = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM"
      const displayH = h % 12 === 0 ? 12 : h % 12
      return `${displayH}:00 ${ampm}`
    }

    const peakHourRange = `${formatHourStr(peakHour)} - ${formatHourStr((peakHour + 2) % 24)}`

    return {
      peakHourRange,
      peakDay,
      totalCompleted: completed.length
    }
  }

  const analytics = getPeakFocusAnalytics(pomodoros)

  // 2. Evaluate Locked / Unlocked Achievement Badges
  const getBadges = (
    tList: Task[],
    pList: PomodoroSession[],
    activeSharedGardenId: string | null | undefined,
    currentSun: number,
    currentWater: number,
    streak: number
  ) => {
    const completedTasksCount = tList.filter(t => t.completed).length
    const completedPomodorosCount = pList.filter(p => p.completed).length

    const pomodoroDates = pList.filter(p => p.completed && p.startTime).map(p => {
      try {
        return new Date(p.startTime).toDateString()
      } catch (e) {
        return ""
      }
    }).filter(Boolean)
    
    const dateCounts: Record<string, number> = {}
    pomodoroDates.forEach(d => {
      dateCounts[d] = (dateCounts[d] || 0) + 1
    })
    
    const maxSessionsInADay = Object.keys(dateCounts).length > 0 ? Math.max(...Object.values(dateCounts)) : 0
    const hasThreeInADay = maxSessionsInADay >= 3

    const morningSessions = pList.filter(p => {
      if (!p.completed || !p.startTime) return false
      try {
        const hour = new Date(p.startTime).getHours()
        return hour >= 4 && hour < 12
      } catch (e) {
        return false
      }
    })
    const hasMorningSession = morningSessions.length >= 1

    return [
      {
        id: "first_bloom",
        name: "First Bloom 🌱",
        desc: "Complete your first task",
        unlocked: completedTasksCount >= 1,
        color: "from-emerald-400 to-teal-500",
        icon: "🌱",
        current: completedTasksCount,
        target: 1,
        unit: "task"
      },
      {
        id: "deep_roots",
        name: "Deep Roots 🌳",
        desc: "Complete 10 tasks in total",
        unlocked: completedTasksCount >= 10,
        color: "from-amber-400 to-orange-500",
        icon: "🌳",
        current: completedTasksCount,
        target: 10,
        unit: "tasks"
      },
      {
        id: "zen_master",
        name: "Zen Master 🧘‍♂️",
        desc: "Complete 5 focus sessions",
        unlocked: completedPomodorosCount >= 5,
        color: "from-indigo-400 to-violet-500",
        icon: "🧘‍♂️",
        current: completedPomodorosCount,
        target: 5,
        unit: "sessions"
      },
      {
        id: "super_satori",
        name: "Super Satori 🌸",
        desc: "Complete 3 focus sessions in a day",
        unlocked: hasThreeInADay,
        color: "from-cyan-400 to-blue-500",
        icon: "🌸",
        current: maxSessionsInADay,
        target: 3,
        unit: "sessions"
      },
      {
        id: "morning_dew",
        name: "Morning Dew ☀️",
        desc: "Complete a focus session before 12:00 PM",
        unlocked: hasMorningSession,
        color: "from-yellow-400 to-amber-500",
        icon: "☀️",
        current: hasMorningSession ? 1 : 0,
        target: 1,
        unit: "session"
      },
      {
        id: "sunlight_harvest",
        name: "Sunlight Harvest 🌞",
        desc: "Accumulate 100 Sunlight points",
        unlocked: currentSun >= 100,
        color: "from-amber-400 to-yellow-500",
        icon: "🌞",
        current: currentSun,
        target: 100,
        unit: "Sun"
      },
      {
        id: "sun_seeker",
        name: "Sun Seeker 🌻",
        desc: "Accumulate 500 Sunlight points",
        unlocked: currentSun >= 500,
        color: "from-yellow-500 to-orange-600",
        icon: "🌻",
        current: currentSun,
        target: 500,
        unit: "Sun"
      },
      {
        id: "communal_spirit",
        name: "Communal Spirit 🤝",
        desc: "Join or create a Co-op Garden",
        unlocked: !!activeSharedGardenId,
        color: "from-pink-400 to-rose-500",
        icon: "🤝",
        current: activeSharedGardenId ? 1 : 0,
        target: 1,
        unit: "garden"
      },
      {
        id: "consistent_gardener",
        name: "Consistent Gardener 📅",
        desc: "Reach a 3-day active productivity streak",
        unlocked: streak >= 3,
        color: "from-emerald-500 to-teal-600",
        icon: "📅",
        current: streak,
        target: 3,
        unit: "days"
      }
    ]
  }

  const evaluatedBadges = getBadges(
    tasks,
    pomodoros,
    settings?.activeSharedGardenId,
    settings?.sunlight ?? 0,
    settings?.waterdrops ?? 0,
    stats?.streak ?? 0
  )

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-emerald-600 font-medium animate-pulse">Analyzing growth insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full min-h-full ambient-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative overflow-hidden ${isActive ? "active" : ""}`}>
      {/* Decorative vertical text (Ma) */}
      <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-8 opacity-[0.05] select-none pointer-events-none z-0">
        <span className="vertical-text text-5xl font-serif text-slate-800 dark:text-emerald-100 reveal-staggered delay-2">成長の洞察</span>
        <div className="w-px h-24 bg-current" />
        <span className="text-[10px] tracking-[0.5em] uppercase font-bold">Insights</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-10">
        <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col space-y-2 reveal-staggered delay-1">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-3 leading-tight">
              Growth Insights
              <span className="text-xl font-serif text-slate-400/60 dark:text-emerald-300/30">成長</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest text-xs">Track your productivity journey — <span className="text-emerald-600 dark:text-emerald-400 italic">Satori</span></p>
          </div>



          <div className="grid grid-cols-1 gap-8">
            {/* 1. Habit Streak & Weekly Growth */}
            <div className="reveal-staggered delay-2">
              <WeeklyStats />
            </div>

            {/* Peak Focus & Achievements Card Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-staggered delay-2.5">
              {/* Peak Focus Periods */}
              <Card className="card-zen p-6 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Icons.zap className="w-4 h-4 text-amber-500" />
                  Peak Focus Periods
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-150/40 dark:bg-amber-950/40 flex items-center justify-center text-xl shadow-sm">
                      ☀️
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Peak Hour Range</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                        {analytics.peakHourRange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-150/40 dark:bg-emerald-950/40 flex items-center justify-center text-xl shadow-sm">
                      📅
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Peak Day of Week</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                        {analytics.peakDay}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
                    💡 Your focus is most sharp during these hours. Try scheduling your heaviest *Deep Focus Blocks* during this window for maximum harvest!
                  </div>
                </div>
              </Card>

              {/* Achievements Grid */}
              <Card className="card-zen p-6 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-1000" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Icons.sparkles className="w-4 h-4 text-emerald-500" />
                  Growth Achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {evaluatedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`relative overflow-hidden card-zen p-4 border flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                        badge.unlocked
                          ? 'border-emerald-500/20 dark:border-emerald-500/10'
                          : 'border-slate-200/50 dark:border-slate-800/40 opacity-75'
                      }`}
                    >
                      {/* Left: Badge Icon */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-110 ${
                            badge.unlocked
                              ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-md`
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40 grayscale'
                          }`}
                        >
                          {badge.icon}
                        </div>
                        {!badge.unlocked && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 dark:bg-slate-800 rounded-full border border-slate-700/50 flex items-center justify-center text-[8px] text-white">
                            🔒
                          </div>
                        )}
                      </div>

                      {/* Right: Info & Progress */}
                      <div className="flex-grow min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold truncate transition-colors ${
                            badge.unlocked
                              ? "text-slate-800 dark:text-slate-100"
                              : "text-slate-500 dark:text-slate-400"
                          }`}>{badge.name}</h4>
                          <span className={`text-[10px] font-black shrink-0 transition-colors ${
                            badge.unlocked
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400 dark:text-slate-500"
                          }`}>
                            {badge.current} / {badge.target}
                          </span>
                        </div>
                        
                        <p className={`text-[10px] leading-tight line-clamp-1 transition-colors ${
                          badge.unlocked
                            ? "text-slate-500 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500"
                        }`}>{badge.desc}</p>
                        
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${badge.color}`}
                            style={{ width: `${Math.min((badge.current / badge.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
                  🏆 Unlocking badges represents your continuous mental cultivation. Continue completing tasks and focus sessions to unlock all rewards!
                </div>
              </Card>
            </div>

            {/* 2. Qualitative Insights & Levels */}
            <div className="reveal-staggered delay-3">
              <ProductivityTrends />
            </div>

            {/* 3. Detailed Quantitative Charts */}
            <div className="reveal-staggered delay-4">
              <ProductivityCharts />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
