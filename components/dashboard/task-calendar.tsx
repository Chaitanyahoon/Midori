"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { tasks } = useData()

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getTasksForDate = (day?: number | null) => {
    if (!day) return []

    // Create date string in local timezone to avoid timezone shifts
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0")

    return tasks.filter((task) => task.dueDate === dateString)
  }

  const getTodayTasks = () => {
    // Get today's date in local timezone
    const today = new Date()
    const todayString =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")

    return tasks.filter((task) => task.dueDate === todayString)
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const today = new Date()
  const isToday = (day?: number | null) => {
    if (!day) return false
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl shadow-emerald-500/5 rounded-2xl group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-teal-400/20 transition-colors duration-1000" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10 border-b border-white/20 dark:border-slate-700/50">
        <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">Calendar</CardTitle>
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm" onClick={() => navigateMonth("prev")}>
            <Icons.chevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180 text-emerald-600 dark:text-emerald-400" />
          </Button>
          <span className="text-xs sm:text-sm font-bold px-2 sm:px-3 text-slate-700 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm" onClick={() => navigateMonth("next")}>
            <Icons.chevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10 pt-4">
        <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1 sm:p-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1">
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            return (
              <div
                key={index}
                className={`
                  min-h-[48px] sm:aspect-square p-1 sm:p-2 text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer border border-transparent
                  ${day ? "bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-slate-200/60 dark:hover:border-slate-700" : ""}
                  ${isToday(day) ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20" : ""}
                  ${day && !isToday(day) ? "text-slate-700 dark:text-slate-300 font-medium" : ""}
                `}
              >
                {day && (
                  <div className="h-full flex flex-col items-center justify-start pt-1">
                    <span className="text-center leading-none inline-block">{day}</span>
                    {dayTasks.length > 0 && (
                      <div className="mt-0.5 sm:mt-1 space-y-0.5 w-full">
                        {dayTasks.slice(0, 2).map((task, i) => (
                          <div
                            key={i}
                            className={`w-full h-0.5 sm:h-1 rounded-full ${task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                          />
                        ))}
                        {dayTasks.length > 2 && (
                          <div className={`text-[9px] sm:text-[10px] text-center font-bold pb-0.5 ${isToday(day) ? 'text-emerald-100' : 'text-slate-400'}`}>+{dayTasks.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 sm:mt-8 space-y-3 max-h-[200px] sm:max-h-none overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Today's Agenda</h4>
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold px-2 py-0">
              {getTodayTasks().length} Tasks
            </Badge>
          </div>

          {getTodayTasks().length === 0 ? (
            <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Clear skies! No tasks scheduled for today. 🌿</p>
            </div>
          ) : (
            getTodayTasks().map((task) => (
              <div key={task.id} className="flex items-center space-x-3 sm:space-x-4 p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group">
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${task.priority === "high"
                      ? "bg-red-500"
                      : task.priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center space-x-1 sm:space-x-2 mt-1 flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                      {task.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
