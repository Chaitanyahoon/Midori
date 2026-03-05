"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "day">("month")
  const { tasks, addTask, updateTask } = useData()
  const { toast } = useToast()

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work" as const,
    dueDate: "",
    scheduledTime: "none",
    recurrence: "none" as "none" | "daily" | "weekly" | "monthly",
  })

  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7 AM to 9 PM

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

    // Create date string in local timezone
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0")

    return tasks.filter((task) => task.dueDate === dateString)
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

  // Allow clicking any date cell to add a task for that date
  const handleDateClick = (dateObjOrDay: Date | number | null) => {
    if (!dateObjOrDay) return
    let selectedDateObj: Date
    if (typeof dateObjOrDay === 'number') {
      selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dateObjOrDay)
    } else {
      selectedDateObj = dateObjOrDay
    }
    const dateString =
      selectedDateObj.getFullYear() +
      "-" +
      String(selectedDateObj.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDateObj.getDate()).padStart(2, "0")
    setSelectedDate(dateString)
    setNewTask({ ...newTask, dueDate: dateString })
    setIsAddDialogOpen(true)
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      completed: false,
      dueDate: newTask.dueDate || undefined,
      scheduledTime: newTask.scheduledTime !== "none" ? newTask.scheduledTime : undefined,
    })

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: "",
      scheduledTime: "none",
      recurrence: "none",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Task scheduled! 📅",
      description: "Your task has been added to the calendar.",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (

    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Plan and organize your tasks visually.</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Icons.seedling className="w-4 h-4 mr-2" />
            Schedule Task
          </Button>
          <div className="flex items-center border rounded-lg bg-white/70 dark:bg-slate-800/70 px-1.5 py-1 ml-2">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              className={`rounded-md px-3 py-1 text-xs font-medium ${viewMode === "month" ? "bg-emerald-600 text-white" : ""}`}
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              className={`rounded-md px-3 py-1 text-xs font-medium ${viewMode === "day" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setViewMode("day")}
            >
              Day
            </Button>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Schedule a Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} autoFocus />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={val => setNewTask({ ...newTask, priority: val as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={newTask.category} onValueChange={val => setNewTask({ ...newTask, category: val as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Select value={newTask.scheduledTime} onValueChange={(val) => setNewTask({ ...newTask, scheduledTime: val })}>
                    <SelectTrigger><SelectValue placeholder="All Day" /></SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectItem value="none">All Day</SelectItem>
                      {HOURS.map(h => {
                        const timeStr = `${h.toString().padStart(2, '0')}:00`
                        const label = h > 12 ? `${h - 12}:00 PM` : h === 12 ? `12:00 PM` : `${h}:00 AM`
                        return <SelectItem key={timeStr} value={timeStr}>{label}</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Repeat</Label>
                  <Select value={newTask.recurrence} onValueChange={val => setNewTask({ ...newTask, recurrence: val as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-2" onClick={handleAddTask}>
                <Icons.seedling className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
            <Icons.calendar className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => navigateMonth("prev")}>
              <Icons.chevronRight className="w-4 h-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg px-4" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => navigateMonth("next")}>
              <Icons.chevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {viewMode === "month"
              ? days.map((day, index) => {
                if (typeof day !== 'number' || day === null) {
                  return <div key={index} className="min-h-[64px] sm:min-h-[88px] p-2" />
                }
                const dayTasks = getTasksForDate(day)
                const hasHighPriority = dayTasks.some((task) => task.priority === "high")
                const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                return (
                  <div
                    key={index}
                    className={`
                        min-h-[64px] sm:min-h-[88px] p-2 rounded-lg border transition-all duration-200 cursor-pointer
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700
                        ${isToday(day) ? "bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border-emerald-200 dark:border-emerald-700 shadow-md" : "bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700"}
                        ${hasHighPriority ? "ring-2 ring-red-200 dark:ring-red-800" : ""}
                        ${isPast ? "opacity-60 pointer-events-none" : ""}
                      `}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isToday(day) ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-gray-100"}`}>
                          {day}
                        </span>
                        {dayTasks.length > 0 && (
                          <Badge variant="secondary" className="text-xs h-5 px-1.5">
                            {dayTasks.length}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <TooltipProvider key={i}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`text-xs p-1.5 rounded truncate flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-80 ${task.completed
                                    ? "bg-gray-400 line-through opacity-60"
                                    : task.priority === "high"
                                      ? "bg-red-500 text-white"
                                      : task.priority === "medium"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-green-500 text-white"
                                    }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => {
                                      updateTask(task.id, { completed: !task.completed })
                                      toast({
                                        title: !task.completed ? "Task completed! 🎉" : "Task reopened",
                                        description: !task.completed ? "Great job! Keep up the momentum." : "Task marked as pending.",
                                      })
                                    }}
                                    className="h-3 w-3 border-white dark:border-slate-700 data-[state=checked]:bg-white dark:data-[state=checked]:bg-slate-600 data-[state=checked]:text-gray-600 dark:data-[state=checked]:text-gray-200"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="flex-1 truncate">{task.title}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 dark:bg-slate-900 text-white border-slate-700">
                                <p className="text-xs">{task.title}</p>
                                {task.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{task.description}</p>}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">+{dayTasks.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
              : (
                <div className="col-span-7 space-y-3 pt-2">
                  {/* Daily Timeline View */}
                  <div className="space-y-4">
                    {/* All day section */}
                    <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="w-16 flex-shrink-0 text-right font-medium text-slate-500 dark:text-slate-400 text-sm py-1 pt-1.5">
                        All Day
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getTasksForDate(currentDate.getDate()).filter(t => !t.scheduledTime).map(task => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${task.completed
                              ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60"
                              : "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 shadow-sm"
                              }`}
                          >
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => updateTask(task.id, { completed: !task.completed })}
                              className="h-4 w-4 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${task.completed ? "text-slate-500 line-through" : "text-slate-900 dark:text-slate-100"}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.description}</p>
                              )}
                            </div>
                            {task.priority === "high" && <div className="w-2 h-2 rounded-full bg-red-500 ml-auto flex-shrink-0" />}
                            {task.priority === "medium" && <div className="w-2 h-2 rounded-full bg-yellow-500 ml-auto flex-shrink-0" />}
                          </div>
                        ))}
                        {getTasksForDate(currentDate.getDate()).filter(t => !t.scheduledTime).length === 0 && (
                          <div className="text-sm text-slate-400 italic py-2">No unassigned tasks</div>
                        )}
                      </div>
                    </div>

                    {/* Hourly Blocks */}
                    {HOURS.map(hour => {
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`
                      const ampmLabel = hour >= 12 ? `${hour === 12 ? 12 : hour - 12} PM` : `${hour === 0 ? 12 : hour} AM`
                      const hourTasks = getTasksForDate(currentDate.getDate()).filter(t => t.scheduledTime === timeStr)

                      return (
                        <div key={hour} className="flex min-h-[5rem] group">
                          <div className="w-16 flex-shrink-0 text-right pr-4 py-2 text-sm text-slate-500 dark:text-slate-400 font-medium border-r border-slate-200 dark:border-slate-700 relative">
                            <span className="relative -top-3 bg-white dark:bg-slate-900 px-1">{ampmLabel}</span>
                          </div>
                          <div
                            className="flex-1 pl-4 py-2 border-b border-slate-100 dark:border-slate-800/60 relative hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedDate(currentDate.toISOString().split('T')[0])
                              setNewTask({ ...newTask, dueDate: currentDate.toISOString().split('T')[0], scheduledTime: timeStr })
                              setIsAddDialogOpen(true)
                            }}
                          >
                            <div className="flex flex-col gap-2">
                              {hourTasks.map(task => (
                                <div
                                  key={task.id}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${task.completed
                                    ? "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60"
                                    : task.priority === "high"
                                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"
                                      : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50"
                                    }`}
                                >
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => updateTask(task.id, { completed: !task.completed })}
                                    className="h-4 w-4 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${task.completed ? "text-slate-500 line-through" : "text-slate-900 dark:text-slate-100"}`}>
                                      {task.title}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
