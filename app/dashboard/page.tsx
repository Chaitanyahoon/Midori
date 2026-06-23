"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'

import { TaskCalendar } from "@/components/dashboard/task-calendar"
import { TaskList } from "@/components/dashboard/task-list"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { MotivationalQuote } from "@/components/dashboard/motivational-quote"
import { useData } from "@/components/local-data-provider"
import { useAuth } from "@/components/auth-provider"
import { Icons } from "@/components/icons"
import { useWeather } from "@/hooks/use-weather"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const VisualGarden = dynamic(() => import('@/components/garden/visual-garden').then(mod => mod.VisualGarden), {
  ssr: false,
  loading: () => <div className="w-full h-72 sm:h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
})

const getWeatherEmoji = (condition: string) => {
  switch (condition?.toLowerCase()) {
    case "clear": return "☀️"
    case "rain": return "🌧️"
    case "snow": return "❄️"
    case "cloudy": return "☁️"
    default: return "☀️"
  }
}

const getWeatherDescription = (condition: string) => {
  switch (condition?.toLowerCase()) {
    case "clear":
      return "Sunny skies warm the soil. Growth rates are accelerated by 10% today! ☀️"
    case "rain":
      return "Soft rain is falling. Hydration is auto-replenishing, no watering needed! 🌧️"
    case "snow":
      return "A peaceful chill covers the garden. Plants are resting, winter beauty abounds. ❄️"
    case "cloudy":
      return "Overcast skies keep the soil cool. A perfect day for quiet concentration and steady growth. ☁️"
    default:
      return "The environment is calm and balanced. Your garden is thriving under gentle care. 🌿"
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const { tasks, pomodoros, stats, settings } = useData()
  const { user } = useAuth()
  const userName = settings.userName || user?.displayName || user?.email?.split('@')[0] || ""

  const weatherData = useWeather()
  const weatherLoading = weatherData.loading
  const weatherCondition = weatherData.weather.condition
  const weatherTemp = weatherData.weather.temperature

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Close quick actions when clicking outside on mobile
  useEffect(() => {
    if (!isQuickActionsOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.quick-actions-menu')) {
        setIsQuickActionsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isQuickActionsOpen])

  const todayTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return !task.completed && (!task.dueDate || task.dueDate === today)
  }).length

  const todayPomodoros = pomodoros.filter((p) => {
    const today = new Date().toISOString().split("T")[0]
    return p.completed && p.startTime.split("T")[0] === today
  }).length

  const todayStr = new Date().toISOString().split("T")[0]
  const todayCompletedTasksList = tasks.filter(t => t.completed && t.completedAt?.startsWith(todayStr))
  const todaySunlightEarned = todayCompletedTasksList.length * 10

  const todayCompletedPomodorosList = pomodoros.filter(p => p.completed && p.startTime?.startsWith(todayStr))
  const todayWaterdropsEarned = todayCompletedPomodorosList.reduce((acc, p) => acc + (Math.floor(p.duration / 60) || 1), 0)

  return (
    <div className="w-full h-full ambient-bg">
      {/* Welcome Header Section */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-2">
        <div className="backdrop-blur-md bg-white/20 dark:bg-emerald-950/10 border border-white/20 dark:border-emerald-800/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl animate-bloom">
          <div className="space-y-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent leading-tight">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
                {userName && (
                  <span className="text-emerald-600 dark:text-emerald-400">, {userName}</span>
                )}
              </h1>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                Ready to nurture your ideas today? 🌿
              </p>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide flex items-center gap-2">
                <span>{currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
                <span>·</span>
                <span>{currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
            
            {/* Weather Ticker */}
            {!weatherLoading && (
              <div className="pt-2 border-t border-slate-500/10 flex items-center gap-2 text-xs text-emerald-700/80 dark:text-emerald-300/80 font-medium animate-[pulse_3s_ease-in-out_infinite]">
                <span className="text-sm leading-none">{getWeatherEmoji(weatherCondition)}</span>
                <span>{getWeatherDescription(weatherCondition)}</span>
              </div>
            )}
          </div>

          {/* Weather & Balances Widget */}
          <div className="flex flex-wrap items-center gap-4 select-none">
            {!weatherLoading && (
              <div className="flex items-center gap-2 bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-3.5 py-2 rounded-2xl border border-sky-500/20 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105">
                <span className="text-base leading-none">{getWeatherEmoji(weatherCondition)}</span>
                <span className="capitalize">{weatherCondition}</span>
                <span className="opacity-50">·</span>
                <span>{Math.round(weatherTemp)}°C</span>
              </div>
            )}

            {/* Sunlight pill */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-3 bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-700 dark:text-amber-300 pl-2 pr-4 py-1.5 rounded-2xl border border-amber-400/30 text-sm font-bold shadow-md hover:shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50">
                  <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 group-hover:bg-amber-500/25 transition-all duration-300">
                    <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse pointer-events-none" />
                    <Icons.sun className="w-4 h-4 text-amber-500 animate-[spin_12s_linear_infinite] group-hover:scale-110 transition-transform relative z-10" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs uppercase font-bold tracking-wider opacity-60">Sunlight</span>
                    <span className="text-base mt-0.5">{settings?.sunlight ?? 0}</span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-amber-500/20 rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2">
                    <Icons.sun className="w-5 h-5 text-amber-500 animate-[spin_10s_linear_infinite]" />
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Sunlight Ledger</h4>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Today&apos;s Earnings:</span>
                      <span className="text-amber-600 dark:text-amber-400">+{todaySunlightEarned} Sun</span>
                    </div>
                    {todayCompletedTasksList.length > 0 ? (
                      <ul className="max-h-24 overflow-y-auto space-y-1 pl-2 border-l border-amber-500/20 mt-1 scrollbar-thin">
                        {todayCompletedTasksList.map(t => (
                          <li key={t.id} className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="truncate max-w-[150px]">{t.title}</span>
                            <span className="font-medium text-amber-500/80">+10 Sun</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No tasks completed yet today.</p>
                    )}
                  </div>

                  <div className="border-t border-slate-500/10 pt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-500">☀️</span>
                      <span><strong>Earn:</strong> Complete tasks to gain <strong>+10 Sunlight</strong>.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-500">🌱</span>
                      <span><strong>Spend:</strong> Purchase/plant seeds in the Botanical Nursery.</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Water drops pill */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-3 bg-gradient-to-r from-sky-400/20 to-blue-400/20 text-sky-700 dark:text-sky-300 pl-2 pr-4 py-1.5 rounded-2xl border border-sky-400/30 text-sm font-bold shadow-md hover:shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50">
                  <div className="relative w-6 h-9 border-2 border-sky-400/40 rounded-b-xl rounded-t-sm overflow-hidden bg-sky-950/10 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-sky-500/80 to-sky-400/80 transition-all duration-1000 ease-out" 
                      style={{ height: `${Math.min(100, Math.max(10, ((settings?.waterdrops ?? 0) / 100) * 100))}%` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-sky-300/50 animate-pulse rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex justify-around items-end pb-1 pointer-events-none opacity-40">
                      <span className="w-0.5 h-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs uppercase font-bold tracking-wider opacity-60">Water</span>
                    <span className="text-base mt-0.5">{settings?.waterdrops ?? 0}</span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-sky-500/20 rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-sky-500/10 pb-2">
                    <Icons.droplets className="w-5 h-5 text-sky-500 animate-[pulse_2s_ease-in-out_infinite]" />
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Water Ledger</h4>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Today&apos;s Focus:</span>
                      <span className="text-sky-600 dark:text-sky-400">+{todayWaterdropsEarned} Drops</span>
                    </div>
                    {todayCompletedPomodorosList.length > 0 ? (
                      <ul className="max-h-24 overflow-y-auto space-y-1 pl-2 border-l border-sky-500/20 mt-1 scrollbar-thin">
                        {todayCompletedPomodorosList.map((p, idx) => {
                          const associatedTask = tasks.find(t => t.id === p.taskId)
                          const displayName = associatedTask ? `Focus: ${associatedTask.title}` : 'Focus Session'
                          return (
                            <li key={p.id || idx} className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="truncate max-w-[150px]">{displayName}</span>
                              <span className="font-medium text-sky-500/80">+{Math.floor(p.duration / 60) || 1} Drops</span>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No focus sessions completed today.</p>
                    )}
                  </div>

                  <div className="border-t border-slate-500/10 pt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-start gap-1.5">
                      <span className="text-sky-500">💧</span>
                      <span><strong>Earn:</strong> Complete focus sessions (<strong>1 Drop/min</strong>).</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-500">🚿</span>
                      <span><strong>Spend:</strong> Water your personal garden plants (+20% growth).</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-10">
        {/* Motivational Quote */}
        <div className="animate-stagger-1">
          <MotivationalQuote />
        </div>

        {/* Section: Your Progress */}
        <div className="space-y-4 animate-stagger-2">
          <div className="section-label">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-xs font-bold">
              <Icons.insights className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <span>Your Progress</span>
            </div>
          </div>
          <QuickStats />
        </div>

        {/* Section: Your Garden */}
        <div className="space-y-4 animate-stagger-3">
          <div className="section-label">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-xs font-bold">
              <Icons.sprout className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Your Garden</span>
            </div>
          </div>
          <VisualGarden onAddPlant={() => router.push("/dashboard/tasks")} />
        </div>

        {/* Section: Today's Plan */}
        <div className="space-y-4 animate-stagger-4">
          <div className="section-label">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-xs font-bold">
              <Icons.calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Today&apos;s Plan</span>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
            {/* Row 1: TaskList (2 cols) & PomodoroTimer (1 col) */}
            <div className="xl:col-span-2 min-w-0">
              <TaskList />
            </div>
            <div className="xl:col-span-1 min-w-0">
              <PomodoroTimer />
            </div>

            {/* Row 2: TaskCalendar (2 cols) & RecentActivity (1 col) */}
            <div className="xl:col-span-2 min-w-0">
              <TaskCalendar />
            </div>
            <div className="xl:col-span-1 min-w-0">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Menu (raised on mobile to clear bottom nav) */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 quick-actions-menu">
        <div className="relative">
          {/* Main Toggle Button */}
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center active:scale-95 touch-manipulation ${
              isQuickActionsOpen ? 'rotate-45' : ''
            }`}
            title="Toggle Quick Actions"
          >
            <Icons.plus className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300" />
          </button>

          {/* Unified Action Menu */}
          <div 
            className={`absolute bottom-14 sm:bottom-16 right-0 transition-all duration-300 transform origin-bottom-right ${
              isQuickActionsOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                : 'opacity-0 translate-y-4 pointer-events-none scale-95'
            }`}
          >
            <div className="flex flex-col space-y-2 items-end">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap backdrop-blur-sm">
                  Plant Seed
                </span>
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false)
                    router.push("/dashboard/tasks")
                  }}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <Icons.leaf className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap backdrop-blur-sm">
                  Focus Grove
                </span>
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false)
                    router.push("/dashboard/pomodoro")
                  }}
                  className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <Icons.timer className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap backdrop-blur-sm">
                  Time Planner
                </span>
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false)
                    router.push("/dashboard/calendar")
                  }}
                  className="w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <Icons.calendar className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
