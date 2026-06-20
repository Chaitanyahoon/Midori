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

const VisualGarden = dynamic(() => import('@/components/garden/visual-garden').then(mod => mod.VisualGarden), {
  ssr: false,
  loading: () => <div className="w-full h-72 sm:h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
})

const getWeatherEmoji = (condition: string) => {
  switch (condition) {
    case "clear": return "☀️"
    case "rain": return "🌧️"
    case "snow": return "❄️"
    case "cloudy": return "☁️"
    default: return "☀️"
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

  return (
    <div className="w-full h-full ambient-bg">
      {/* Welcome Header Section */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-bloom">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent leading-tight">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
              {userName && (
                <span className="text-emerald-600 dark:text-emerald-400">, {userName}</span>
              )}
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Ready to nurture your ideas today? 🌿
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              {" · "}
              {currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Weather & Balances Widget */}
        <div className="flex flex-wrap items-center gap-3 animate-bloom select-none">
          {!weatherLoading && (
            <div className="flex items-center gap-2 bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-3.5 py-1.5 rounded-2xl border border-sky-500/20 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <span className="text-base leading-none">{getWeatherEmoji(weatherCondition)}</span>
              <span className="capitalize">{weatherCondition}</span>
              <span className="opacity-50">·</span>
              <span>{Math.round(weatherTemp)}°C</span>
            </div>
          )}

          {/* Sunlight pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-2xl border border-amber-400/30 text-sm font-bold shadow-md hover:shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-default">
            <Icons.sun className="w-4 h-4 text-amber-500 animate-[spin_8s_linear_infinite] group-hover:scale-110 transition-transform" />
            <span>{settings?.sunlight ?? 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Sun</span>
          </div>

          {/* Water drops pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-400/20 to-blue-400/20 text-sky-700 dark:text-sky-300 px-4 py-2 rounded-2xl border border-sky-400/30 text-sm font-bold shadow-md hover:shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-default">
            <Icons.droplets className="w-4 h-4 text-sky-500 animate-[pulse_2s_ease-in-out_infinite] group-hover:scale-110 transition-transform" />
            <span>{settings?.waterdrops ?? 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Water</span>
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
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 quick-actions-menu group">
        <div className="relative">
          {/* Main Toggle Button */}
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation ${isQuickActionsOpen ? 'rotate-45' : ''
              }`}
          >
            <Icons.plus className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-200" />
          </button>

          {/* Desktop: Hover tooltip */}
          <div className="absolute bottom-full right-0 mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
            <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              Quick Actions
            </div>
          </div>

          {/* Desktop: Hover actions */}
          <div className="absolute bottom-14 sm:bottom-16 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-auto hidden sm:block">
            <div className="flex flex-col space-y-2 items-end">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
                  Plant Seed
                </span>
                <button
                  onClick={() => router.push("/dashboard/tasks")}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
                >
                  <Icons.leaf className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                  Focus Grove
                </span>
                <button
                  onClick={() => router.push("/dashboard/pomodoro")}
                  className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
                >
                  <Icons.timer className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150">
                  Time Planner
                </span>
                <button
                  onClick={() => router.push("/dashboard/calendar")}
                  className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
                >
                  <Icons.calendar className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Toggleable action buttons */}
          <div className={`absolute bottom-14 right-0 sm:hidden transition-all duration-300 ${isQuickActionsOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
            <div className="flex flex-col space-y-2 items-end">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                  Plant Seed
                </span>
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false)
                    router.push("/dashboard/tasks")
                  }}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
                >
                  <Icons.leaf className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                  Focus Grove
                </span>
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false)
                    router.push("/dashboard/pomodoro")
                  }}
                  className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
                >
                  <Icons.timer className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                  Time Planner
                </span>
                <button
                  onClick={() => {
                    setIsQuickActionsOpen(false)
                    router.push("/dashboard/calendar")
                  }}
                  className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
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
