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
import { SettingsModal } from "@/components/dashboard/settings-modal"
import { ModeToggle } from "@/components/mode-toggle"

interface TopNavProps {
  onAIAssistantClick?: () => void
  onMenuClick?: () => void
}

export function TopNav({ onAIAssistantClick, onMenuClick }: TopNavProps) {
  const { tasks, pomodoros, userName, userTone } = useData()
  const [isDataInfoOpen, setIsDataInfoOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("readNotifications")
      if (saved) {
        const parsed = JSON.parse(saved)
        setReadNotifications(new Set(parsed))
      }
    } catch (error) {
      console.error("Error loading read notifications:", error)
    }
  }, [])

  // Save read notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("readNotifications", JSON.stringify(Array.from(readNotifications)))
    } catch (error) {
      console.error("Error saving read notifications:", error)
    }
  }, [readNotifications])

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
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  // Create notifications
  const notifications = [
    ...overdueTasks.map((task) => ({
      id: `overdue-${task.id}`,
      type: "warning" as const,
      title: "🍂 Wilting Task",
      message: `"${task.title}" needs attention - overdue since ${new Date(task.dueDate!).toLocaleDateString()}`,
      time: task.dueDate!,
      priority: task.priority,
    })),
    ...todayTasks.map((task) => ({
      id: `due-today-${task.id}`,
      type: "info" as const,
      title: "🌱 Ready to Bloom",
      message: `"${task.title}" is ready for completion today`,
      time: task.dueDate!,
      priority: task.priority,
    })),
    ...recentCompletions.slice(0, 3).map((task) => {
      const app = getAppreciation(task.title, { userName, tone: userTone || 'balanced' })
      return {
        id: `completed-${task.id}`,
        type: "success" as const,
        title: app.title,
        message: app.message,
        time: task.completedAt!,
        priority: task.priority,
      }
    }),
  ]

  // Add Pomodoro milestone notifications
  if (todayPomodoros >= 4) {
    notifications.unshift({
      id: "pomodoro-milestone",
      type: "success" as const,
      title: "🌳 Focus Forest Milestone!",
      message: `You've cultivated ${todayPomodoros} focus sessions today - your productivity forest is thriving!`,
      time: new Date().toISOString(),
      priority: "medium" as const,
    })
  }

  const unreadNotifications = notifications.filter((n) => !readNotifications.has(n.id))
  const unreadCount = unreadNotifications.length

  const handleMarkAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id))
    setReadNotifications(allIds)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <Icons.droplets className="w-4 h-4 text-orange-500" />
      case "info":
        return <Icons.sun className="w-4 h-4 text-blue-500" />
      case "success":
        return <Icons.flower className="w-4 h-4 text-green-500" />
      default:
        return <Icons.bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200/50"
      case "info":
        return "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200/50"
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50"
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200/50"
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
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-4 lg:px-8 py-3 lg:py-5 sticky top-0 z-50">
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        )}

        <div className="flex items-center space-x-2 lg:space-x-6 flex-1 min-w-0">
          {/* Greeting removed, name now shown in main header */}
          {/* Status Badges */}
          <div className="flex items-center space-x-1 lg:space-x-3 flex-wrap gap-1 lg:gap-0">
            {todayTasksCount > 0 && (
              <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm text-xs flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Icons.seedling className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="hidden sm:inline">{todayTasksCount} tasks blooming</span>
                <span className="sm:hidden">{todayTasksCount}</span>
              </Badge>
            )}

            {overdueTasks.length > 0 && (
              <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full shadow-sm text-xs flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Icons.clock className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="hidden sm:inline">{overdueTasks.length} need attention</span>
                <span className="sm:hidden">{overdueTasks.length}</span>
              </Badge>
            )}

            {pendingTasks > 0 && (
              <Badge className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full shadow-sm text-xs flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                  <Icons.tasks className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="hidden sm:inline">{pendingTasks} in progress</span>
                <span className="sm:hidden">{pendingTasks}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 lg:space-x-4 flex-shrink-0">
          {/* AI Assistant Button */}
          <Button
            onClick={onAIAssistantClick}
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
                className="relative w-10 h-10 rounded-full hover:bg-emerald-50 transition-all duration-300 border border-transparent hover:border-emerald-200"
              >
                <div className="w-5 h-5 text-emerald-600">
                  <Icons.bell className="w-full h-full" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center shadow-lg border border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 rounded-3xl border-green-200/30 shadow-organic-xl glass-heavy overflow-hidden"
              align="end"
            >
              {/* Header */}
              <div className="p-6 border-b border-green-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/30">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <Icons.flower className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">Garden Updates</h3>
                    <p className="text-sm text-green-600">{unreadCount} new growth notifications</p>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.seedling className="w-10 h-10 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-green-700 mb-2">Your garden is peaceful</h4>
                    <p className="text-sm text-green-600">All tasks are growing beautifully 🌿</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification, index) => {
                      const isRead = readNotifications.has(notification.id)
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-3xl border ${getNotificationBg(notification.type)} hover:shadow-organic transition-all duration-200 animate-grow-in ${isRead ? "opacity-60" : ""
                            }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => setReadNotifications((prev) => new Set([...prev, notification.id]))}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatNotificationTime(notification.time)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{notification.message}</p>
                              {notification.priority && (
                                <Badge
                                  className={`mt-3 text-xs rounded-xl ${notification.priority === "high"
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : notification.priority === "medium"
                                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                      : "bg-green-50 border-green-200 text-green-700"
                                    }`}
                                >
                                  {notification.priority} priority
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-green-100/50 bg-gradient-to-r from-green-50/30 to-emerald-50/20 rounded-b-3xl">
                  <Button
                    variant="ghost"
                    onClick={handleMarkAllAsRead}
                    className="w-full text-sm text-green-600 hover:text-green-700 hover:bg-green-50/50 rounded-3xl font-medium py-3 transition-all duration-200"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-emerald-50 transition-all duration-300 border border-transparent hover:border-emerald-200"
            title="Settings"
          >
            <div className="w-5 h-5 text-emerald-600">
              <Icons.settings className="w-full h-full" />
            </div>
          </Button>
        </div>

        <DataInfoModal isOpen={isDataInfoOpen} onClose={() => setIsDataInfoOpen(false)} />
        <SettingsModal isOpen={isSettingsOpen} onCloseAction={() => setIsSettingsOpen(false)} />
      </div>
    </header>
  )
}
