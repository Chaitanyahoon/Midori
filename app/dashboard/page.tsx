"use client"
import { TaskCalendar } from "@/components/dashboard/task-calendar"
import { TaskList } from "@/components/dashboard/task-list"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { MotivationalQuote } from "@/components/dashboard/motivational-quote"

import { VisualGarden } from "@/components/garden/visual-garden"
import { Icons } from "@/components/icons"
import { useState, useEffect } from "react"
import { useData } from "@/components/local-data-provider"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const { tasks, pomodoros, stats, settings } = useData()
  const { userName } = settings

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
    <div className="w-full h-full">
      {/* Welcome Header Section */}
      <div className="p-4 sm:p-8 pb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Welcome Section */}
          <div className="flex-1 w-full animate-bloom">
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent flex items-center gap-3">
                {`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},`}
                {userName && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{userName}</span>
                )}
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-xl font-medium">
                Ready to nurture your ideas today? 🌿
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="badge-organic bg-emerald-100/50 text-emerald-700 border-emerald-200">
                <Icons.seedling className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{todayTasks} Tasks Today</span>
                <span className="sm:hidden">{todayTasks}</span>
              </Badge>
              <Badge className="badge-organic bg-amber-100/50 text-amber-700 border-amber-200">
                <Icons.timer className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{todayPomodoros} Sessions</span>
                <span className="sm:hidden">{todayPomodoros}</span>
              </Badge>
              {stats.streak > 0 && (
                <Badge className="badge-organic bg-orange-100/50 text-orange-700 border-orange-200">
                  <span className="hidden sm:inline">🔥 {stats.streak} Day Streak</span>
                  <span className="sm:hidden">🔥 {stats.streak}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Time Widget (Glass) */}
          <div className="glass-light px-6 py-4 rounded-2xl shadow-sm border border-white/40 dark:border-white/10 w-full sm:w-auto hover:scale-105 transition-transform duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                <Icons.sun className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto">
        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Quick Stats */}
        <QuickStats />



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Top Row: Visual Garden (New) */}
          <div className="xl:col-span-3">
            <VisualGarden onAddPlant={() => window.location.href = "/dashboard/tasks"} />
          </div>

          {/* Left Column */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">

            <TaskCalendar />
            <RecentActivity />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            <PomodoroTimer />
            <TaskList />
          </div>
        </div>
      </div>

      {/* Quick Action Menu */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 quick-actions-menu">
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
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => (window.location.href = "/dashboard/tasks")}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
                title="Add Task"
              >
                <Icons.leaf className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard/pomodoro")}
                className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
                title="Start Focus Session"
              >
                <Icons.timer className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard/calendar")}
                className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
                title="Schedule Task"
              >
                <Icons.calendar className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile: Toggleable action buttons */}
          <div className={`absolute bottom-14 right-0 sm:hidden transition-all duration-300 ${isQuickActionsOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false)
                  window.location.href = "/dashboard/tasks"
                }}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
                title="Add Task"
              >
                <Icons.leaf className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false)
                  window.location.href = "/dashboard/pomodoro"
                }}
                className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
                title="Start Focus Session"
              >
                <Icons.timer className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false)
                  window.location.href = "/dashboard/calendar"
                }}
                className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
                title="Schedule Task"
              >
                <Icons.calendar className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
