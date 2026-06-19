"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function RecentActivity() {
  const { tasks, pomodoros } = useData()

  // Get recent activities (last 10 items)
  const recentTasks = tasks
    .filter((task) => task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)

  const recentPomodoros = pomodoros
    .filter((session) => session.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  // Combine and sort all activities
  const activities = [
    ...recentTasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: `Completed: ${task.title}`,
      time: task.completedAt!,
      category: task.category,
      priority: task.priority,
    })),
    ...recentPomodoros.map((session) => ({
      id: session.id,
      type: "pomodoro" as const,
      title: `Completed ${session.duration}min focus session`,
      time: session.startTime,
      category: "focus" as const,
      priority: "medium" as const,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)

  const getActivityIcon = (type: string) => {
    return type === "task" ? Icons.target : Icons.timer
  }

  const getActivityColor = (type: string) => {
    return type === "task" ? "text-green-600" : "text-blue-600"
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <Card className="flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40 rounded-3xl overflow-hidden relative group card-glow-emerald">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent flex items-center">
          <Icons.clock className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {activities.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200/50 dark:border-emerald-800/30">
              <Icons.clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No activity yet</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Complete tasks or pomodoro sessions to see your activity here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              return (
                <div
                  key={activity.id}
                  className="group/item flex items-start space-x-3 p-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-1 cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      activity.type === "task"
                        ? "from-green-500 to-emerald-600"
                        : "from-blue-500 to-cyan-600"
                    } flex items-center justify-center shadow-sm`}
                  >
                    <ActivityIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.title}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatTime(activity.time)}</span>
                      {activity.type === "task" && (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-0">
                          {activity.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
