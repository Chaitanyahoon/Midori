"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import getAppreciation from '@/lib/appreciation'
import { useState, useEffect } from "react"
import { DataInfoModal } from "@/components/data-info-modal"
import { SettingsDialog } from "@/components/dashboard/settings-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { useUIStore } from "@/lib/store"
import { useAuth } from "@/components/auth-provider"
import { usePathname, useRouter } from "next/navigation"

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { tasks, pomodoros, settings } = useData()
  const { user, signOut } = useAuth()
  const {
    setAIModalOpen,
    setSidebarOpen,
    notifications,
    markAllNotificationsAsRead,
    addNotification,
    markNotificationAsRead,
    removeNotification,
    clearNotifications,
  } = useUIStore()

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Growth Hub"
    if (path.startsWith("/dashboard/tasks")) return "Tasks Garden"
    if (path.startsWith("/dashboard/calendar")) return "Time Planner"
    if (path.startsWith("/dashboard/pomodoro")) return "Focus Grove"
    if (path.startsWith("/dashboard/insights")) return "Growth Insights"
    if (path.startsWith("/dashboard/coop")) return "Kyōei Co-op"
    return "Growth Hub"
  }
  const pageTitle = getPageTitle(pathname)

  const userName = settings.userName || user?.displayName || user?.email?.split('@')[0] || ""
  const userTone = settings.userTone
  const [isDataInfoOpen, setIsDataInfoOpen] = useState(false)

  const pendingTasks = tasks.filter((task) => !task.completed).length
  const todayTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate === today && !task.completed
  })

  const todayTasksCount = todayTasks.length

  const overdueTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate && task.dueDate < today && !task.completed
  })

  const recentCompletions = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.completedAt && task.completedAt.split("T")[0] === today
  })

  // Use shared appreciation generator (supports userName and tone)

  const todayPomodoros = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime && session.startTime.split("T")[0] === today && session.completed
  }).length

  // Sync generated notifications with store
  useEffect(() => {
    const generatedNotifs = [
      ...overdueTasks.map((task) => ({
        type: "warning" as const,
        title: "🍂 Wilting Task",
        message: `"${task.title}" needs attention - overdue since ${new Date(task.dueDate!).toLocaleDateString()}`,
        time: task.dueDate!,
        priority: task.priority,
        path: "/dashboard/tasks",
      })),
      ...todayTasks.map((task) => ({
        type: "info" as const,
        title: "🌱 Ready to Bloom",
        message: `"${task.title}" is ready for completion today`,
        time: task.dueDate!,
        priority: task.priority,
        path: "/dashboard/tasks",
      })),
      ...recentCompletions.slice(0, 3).map((task) => {
        const app = getAppreciation(task.title, { userName, tone: userTone || 'balanced' })
        return {
          type: "success" as const,
          title: app.title,
          message: app.message,
          time: task.completedAt!,
          priority: task.priority,
          path: "/dashboard/insights",
        }
      }),
    ]

    // Add Pomodoro milestone notifications
    if (todayPomodoros >= 4) {
      generatedNotifs.unshift({
        type: "success" as const,
        title: "🌳 Focus Forest Milestone!",
        message: `You've cultivated ${todayPomodoros} focus sessions today - your productivity forest is thriving!`,
        time: new Date().toISOString(),
        priority: "medium" as const,
        path: "/dashboard/pomodoro",
      })
    }

    // In a real app we'd only add new ones, but for now we'll just let the store handle it
    generatedNotifs.forEach(notif => {
      // Very basic deduping check
      const exists = notifications.some(n => n.title === notif.title && n.message === notif.message)
      if (!exists && notifications.length < 20) {
        addNotification(notif)
      }
    })
  }, [tasks, todayPomodoros, userName, userTone])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <Icons.droplets className="w-4 h-4 text-orange-500 animate-bounce" style={{ animationDuration: '3s' }} />
      case "info":
        return <Icons.sun className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '10s' }} />
      case "success":
        return <Icons.flower className="w-4 h-4 text-green-500" />
      default:
        return <Icons.bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-gradient-to-r from-orange-50/70 to-yellow-50/70 dark:from-amber-950/20 dark:to-orange-950/20 border-orange-200/50 dark:border-orange-900/30"
      case "info":
        return "bg-gradient-to-r from-blue-50/70 to-sky-50/70 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200/50 dark:border-blue-900/30"
      case "success":
        return "bg-gradient-to-r from-green-50/70 to-emerald-50/70 dark:from-emerald-950/20 dark:to-green-950/20 border-green-200/50 dark:border-green-900/30"
      default:
        return "bg-gradient-to-r from-gray-50/70 to-slate-50/70 dark:from-slate-800/40 dark:to-slate-900/40 border-gray-200/50 dark:border-slate-800/50"
    }
  }

  const formatNotificationTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <header className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-4 lg:px-8 py-3 lg:py-4 sticky top-0 z-50">
      {/* Subtle bottom gradient fade instead of hard border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 dark:via-slate-700/40 to-transparent" />
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden w-10 h-10 rounded-full text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30"
          aria-label="Open sidebar menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>

        {/* Mobile Breadcrumb (Dynamic page title) */}
        <span className="lg:hidden font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[120px] ml-1">
          {pageTitle}
        </span>

        {/* Status badges — only on mobile where QuickStats aren't immediately visible */}
        <div className="flex items-center space-x-1 flex-1 min-w-0 lg:hidden">
          {overdueTasks.length > 0 && (
            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {overdueTasks.length}
            </Badge>
          )}
          {todayTasksCount > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-semibold">
              {todayTasksCount} today
            </Badge>
          )}
        </div>
        {/* Spacer on desktop */}
        <div className="hidden lg:flex flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 lg:space-x-4 flex-shrink-0">
          {/* AI Assistant Button */}
          <Button
            onClick={() => setAIModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4 lg:px-6 py-2.5 lg:py-3 rounded-full font-medium text-white shadow-lg relative overflow-hidden group transition-all duration-300 text-xs lg:text-sm flex items-center gap-2"
          >
            <div className="relative w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 19c-2.8 2-5 2.5-7 2.5.5-3 1-5.5 3-7.5-2-3.5-2-7.5-2-9.5 4.5 2 6 4 7 7 1-3 2.5-5 7-7 0 2-.5 6-2 9.5 2 2 2.5 4.5 3 7.5-2 0-4.2-.5-7-2.5" />
              </svg>
            </div>
            <span className="hidden md:inline">BloomMind AI</span>
            <span className="hidden md:flex px-1.5 py-0.5 bg-white/20 text-[10px] rounded-full font-medium">
              2.0
            </span>
            <span className="md:hidden">AI</span>
          </Button>

          {/* Growth Stats Button */}
          <Button
            onClick={() => setIsDataInfoOpen(true)}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 hover:border-emerald-300 px-4 lg:px-5 py-2.5 lg:py-3 rounded-full font-medium text-emerald-700 transition-all duration-300 text-xs lg:text-sm hidden sm:flex items-center gap-2"
          >
            <div className="relative w-5 h-5 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full flex items-center justify-center">
              <Icons.seedling className="w-3 h-3 text-emerald-700" />
            </div>
            <span className="hidden lg:inline">Growth Stats</span>
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-10 h-10 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all duration-300 border border-transparent hover:border-emerald-200 dark:hover:border-slate-700"
              >
                <div className="w-5 h-5 text-emerald-600 dark:text-emerald-450">
                  <Icons.bell className="w-full h-full" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center shadow-lg border border-white dark:border-slate-900">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 rounded-3xl border-green-200/30 dark:border-slate-800 shadow-organic-xl dark:shadow-black/45 glass-heavy overflow-hidden bg-white/95 dark:bg-slate-950/95"
              align="end"
            >
              {/* Header */}
              <div className="p-6 border-b border-green-100/50 dark:border-slate-800/50 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-slate-900/50 dark:to-emerald-950/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                      <Icons.flower className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-800 dark:text-emerald-400 text-lg">Garden Updates</h3>
                      <p className="text-sm text-green-600 dark:text-emerald-500/80">{unreadCount} new growth notifications</p>
                    </div>
                  </div>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-full px-2.5 h-8 flex items-center gap-1 transition-all"
                      onClick={() => clearNotifications()}
                      title="Clear all notifications"
                    >
                      <Icons.trash className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Clear all</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-emerald-950/30 dark:to-green-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.seedling className="w-10 h-10 text-green-500 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-semibold text-green-700 dark:text-emerald-400 mb-2">Your garden is peaceful</h4>
                    <p className="text-sm text-green-600 dark:text-emerald-500/80">All tasks are growing beautifully 🌿</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification, index) => {
                      const isRead = notification.isRead
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-2xl border ${getNotificationBg(notification.type || "info")} hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 animate-grow-in cursor-pointer relative group ${isRead ? "opacity-60 hover:opacity-90" : ""
                            }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => {
                            markNotificationAsRead(notification.id)
                            if (notification.path) {
                              router.push(notification.path)
                            }
                          }}
                        >
                          {/* Unread status dot */}
                          {!isRead && (
                            <span className="absolute top-4 right-4 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          )}

                          <div className="flex items-start space-x-3 pr-4">
                            <div className="flex-shrink-0 mt-1 p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                              {getNotificationIcon(notification.type || "info")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">
                                  {notification.title}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                                {formatNotificationTime(notification.time)}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                                {notification.path ? (
                                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group/btn transition-colors duration-150">
                                    {notification.type === "warning" ? "Go Resolve" : notification.type === "success" ? "View Insights" : "Get Started"}
                                    <Icons.chevronRight className="w-3 h-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
                                  </span>
                                ) : (
                                  <span />
                                )}
                                {notification.priority && (
                                  <Badge
                                    className={`text-[9px] uppercase tracking-wider font-semibold rounded-lg px-2 py-0.5 border ${
                                      notification.priority === "high"
                                        ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                                        : notification.priority === "medium"
                                          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {notification.priority} priority
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dismiss button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-150"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            title="Dismiss notification"
                          >
                            <Icons.close className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-green-100/50 dark:border-slate-800/50 bg-gradient-to-r from-green-50/30 to-emerald-50/20 dark:from-slate-900/40 dark:to-emerald-950/10 rounded-b-3xl flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => markAllNotificationsAsRead()}
                    className="flex-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-full font-semibold py-2.5 transition-all duration-200"
                  >
                    Mark all as read
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ModeToggle />
          </div>

          {/* Settings */}
          <SettingsDialog>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full hover:bg-emerald-50 transition-all duration-300 border border-transparent hover:border-emerald-200"
              title="Settings"
            >
              <div className="w-5 h-5 text-emerald-600">
                <Icons.settings className="w-full h-full" />
              </div>
            </Button>
          </SettingsDialog>

          {/* Sign Out */}
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="w-10 h-10 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 border border-transparent hover:border-red-200 dark:hover:border-red-800"
            title={`Sign out (${user?.email})`}
          >
            <svg className="w-4 h-4 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>

        <DataInfoModal isOpen={isDataInfoOpen} onClose={() => setIsDataInfoOpen(false)} />
      </div>
    </header>
  )
}
