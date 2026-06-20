"use client"

import { useMemo } from "react"
import { useData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"

export function GardenTimeline() {
  const { tasks, pomodoros } = useData()

  const weeklyActivity = useMemo(() => {
    const days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter(
        (task) => task.completed && task.completedAt && task.completedAt.split("T")[0] === dateString
      )
      const dayPomodoros = pomodoros.filter(
        (p) => p.completed && p.startTime && p.startTime.split("T")[0] === dateString
      )

      days.push({
        date: dateString,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString("en-US", { month: "short" }),
        tasks: dayTasks.length,
        pomodoros: dayPomodoros.length,
        totalActivity: dayTasks.length + dayPomodoros.length,
      })
    }

    return days
  }, [tasks, pomodoros])

  const maxActivity = Math.max(...weeklyActivity.map((d) => d.totalActivity), 1)
  const totalFlowers = weeklyActivity.reduce((sum, d) => sum + d.tasks, 0)
  const totalTrees = weeklyActivity.reduce((sum, d) => sum + d.pomodoros, 0)
  const totalGrowth = weeklyActivity.reduce((sum, d) => sum + d.totalActivity, 0)

  const growthStreak = useMemo(() => {
    let streak = 0
    for (let i = weeklyActivity.length - 1; i >= 0; i--) {
      if (weeklyActivity[i].totalActivity > 0) {
        streak++
      } else {
        break
      }
    }
    return streak
  }, [weeklyActivity])

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Icons.tree className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Weekly Growth
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Your productivity over the past week
              </p>
            </div>
          </div>
          {growthStreak > 0 && (
            <Badge className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 px-2.5 py-1 text-xs">
              {growthStreak} Day Streak
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 right-0 top-10 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" />

          {/* Days */}
          <div className="flex items-end justify-between gap-1.5 relative z-10 pb-8">
            {weeklyActivity.map((day, index) => {
              const barHeight = Math.max((day.totalActivity / maxActivity) * 50, day.totalActivity > 0 ? 12 : 0)
              const isToday = day.date === new Date().toISOString().split("T")[0]

              return (
                <div 
                  key={day.date} 
                  className="flex-1 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '400ms',
                    animationFillMode: 'both'
                  }}
                >
                  {/* Activity bars container */}
                  <div className="flex flex-col items-center justify-end gap-1 w-full h-16">
                    {/* Tasks bar */}
                    {day.tasks > 0 && (
                      <div className="relative group w-full">
                        <div
                          className="bg-emerald-500 rounded-t transition-all duration-300 hover:bg-emerald-600 hover:scale-105 origin-bottom animate-grow-up"
                          style={{
                            height: `${(day.tasks / maxActivity) * 50}px`,
                            minHeight: day.tasks > 0 ? "12px" : "0",
                            width: "100%",
                            animationDelay: `${index * 50}ms`
                          }}
                        >
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm animate-in fade-in zoom-in-75 duration-300" style={{ animationDelay: `${(index * 50) + 200}ms` }}>
                            🌸
                          </div>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                          <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            {day.tasks} task{day.tasks !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pomodoros bar */}
                    {day.pomodoros > 0 && (
                      <div className="relative group w-full">
                        <div
                          className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 hover:scale-105 origin-bottom animate-grow-up"
                          style={{
                            height: `${(day.pomodoros / maxActivity) * 50}px`,
                            minHeight: day.pomodoros > 0 ? "12px" : "0",
                            width: "100%",
                            animationDelay: `${index * 50}ms`
                          }}
                        >
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm animate-in fade-in zoom-in-75 duration-300" style={{ animationDelay: `${(index * 50) + 200}ms` }}>
                            🌳
                          </div>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                          <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            {day.pomodoros} session{day.pomodoros !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {day.totalActivity === 0 && (
                      <div className="flex items-center justify-center h-12 w-full animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                        <span className="text-gray-300 dark:text-gray-600 text-xs">🌱</span>
                      </div>
                    )}
                  </div>

                  {/* Day indicator */}
                  <div
                    className={`w-full py-1.5 px-1 rounded-md border transition-all duration-200 hover:scale-105 ${
                      isToday
                        ? "bg-emerald-500 border-emerald-600 dark:border-emerald-400 shadow-md"
                        : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                    }`}
                  >
                    <div className="text-center">
                      <span
                        className={`text-[9px] font-medium block leading-tight ${
                          isToday ? "text-white" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span
                        className={`text-sm font-semibold block leading-tight ${
                          isToday ? "text-white" : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                  </div>

                  {/* Activity count */}
                  {day.totalActivity > 0 && (
                    <div className="mt-0.5 text-center animate-in fade-in duration-300" style={{ animationDelay: `${(index * 50) + 150}ms` }}>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {day.totalActivity}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '350ms' }}>
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {totalFlowers}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Flowers</div>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '400ms' }}>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {totalTrees}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Trees</div>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '450ms' }}>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {totalGrowth}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Total</div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
