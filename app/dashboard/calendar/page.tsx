"use client"

import { useState, useEffect } from "react"
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
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const { tasks, addTask, updateTask } = useData()
  const { toast } = useToast()

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    setSelectedDate(todayStr)
  }, [])

  const getFormattedDateString = (day: number) => {
    const dObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return (
      dObj.getFullYear() +
      "-" +
      String(dObj.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(dObj.getDate()).padStart(2, "0")
    )
  }

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
    <div className="w-full min-h-full ambient-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent leading-tight">
              Calendar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Plan and organize your tasks visually.</p>
          </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            onClick={() => {
              setNewTask(prev => ({ ...prev, dueDate: selectedDate || new Date().toISOString().split("T")[0] }))
              setIsAddDialogOpen(true)
            }}
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
          <DialogContent className="max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-100 dark:border-emerald-900 shadow-2xl rounded-3xl p-0 overflow-hidden">
            <DialogHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 border-b border-emerald-100/50 dark:border-emerald-900/50">
              <DialogTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
                  <Icons.seedling className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-emerald-900 dark:text-emerald-100 font-bold block">
                    Schedule New Seed
                  </span>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-300/80 font-medium mt-0.5">
                    Plan your tasks and watch them bloom.
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icons.type className="w-4 h-4 text-emerald-500" />
                  Task Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="E.g., Water the plants..."
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 text-lg rounded-xl transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icons.alignLeft className="w-4 h-4 text-slate-400" />
                  Notes
                </Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add details..."
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/20 resize-none rounded-xl"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.target className="w-4 h-4 text-amber-500" />
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(val: any) => setNewTask({ ...newTask, priority: val })}
                  >
                    <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-emerald-400 h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🌱 Low</SelectItem>
                      <SelectItem value="medium">🌿 Medium</SelectItem>
                      <SelectItem value="high">🔥 High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.tag className="w-4 h-4 text-blue-500" />
                    Category
                  </Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(val: any) => setNewTask({ ...newTask, category: val })}
                  >
                    <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-emerald-400 h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">💼 Work</SelectItem>
                      <SelectItem value="personal">👤 Personal</SelectItem>
                      <SelectItem value="learning">📚 Learning</SelectItem>
                      <SelectItem value="health">🧘‍♀️ Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.clock className="w-4 h-4 text-purple-500" />
                    Time
                  </Label>
                  <Select
                    value={newTask.scheduledTime}
                    onValueChange={(val) => setNewTask({ ...newTask, scheduledTime: val })}
                  >
                    <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-emerald-400 h-11 rounded-xl">
                      <SelectValue placeholder="All Day" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectItem value="none">✨ All Day</SelectItem>
                      {HOURS.map((h) => {
                        const timeStr = `${h.toString().padStart(2, "0")}:00`
                        const label = h > 12 ? `${h - 12}:00 PM` : h === 12 ? "12:00 PM" : `${h}:00 AM`
                        return (
                          <SelectItem key={timeStr} value={timeStr}>
                            {label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.reset className="w-4 h-4 text-pink-500" />
                    Repeat
                  </Label>
                  <Select
                    value={newTask.recurrence}
                    onValueChange={(val: any) => setNewTask({ ...newTask, recurrence: val })}
                  >
                    <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-emerald-400 h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 btn-organic h-11 rounded-xl text-base shadow-lg disabled:opacity-50 disabled:shadow-none"
                >
                  Schedule Seed
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-zen">
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
                const cellDateStr = getFormattedDateString(day)
                const isSelected = selectedDate === cellDateStr

                return (
                  <div
                    key={index}
                    className={`
                        min-h-[64px] sm:min-h-[88px] p-2 rounded-xl border transition-all duration-300 cursor-pointer relative group/cell
                        hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800/50
                        ${isSelected ? "ring-2 ring-emerald-500 border-transparent dark:ring-emerald-400" : isToday(day) ? "bg-gradient-to-br from-emerald-50 to-teal-50/30 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800 shadow-md" : "bg-white dark:bg-slate-800/50 border-gray-100/80 dark:border-slate-700/60"}
                        ${hasHighPriority ? "ring-1 ring-rose-500/30 dark:ring-rose-500/40" : ""}
                        ${isPast ? "opacity-75" : ""}
                      `}
                    onClick={() => setSelectedDate(cellDateStr)}
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${isToday(day) ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-gray-100"}`}>
                           {day}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDate(cellDateStr)
                              setNewTask({ ...newTask, dueDate: cellDateStr })
                              setIsAddDialogOpen(true)
                            }}
                            className="w-5 h-5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity"
                            title="Schedule task"
                          >
                            <Icons.plus className="w-3.5 h-3.5" />
                          </button>
                          {dayTasks.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-bold">
                              {dayTasks.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1 hidden sm:block">
                        {dayTasks.slice(0, 3).map((task, i) => {
                          const matchesFilter = selectedPriorityFilter === "all" || task.priority === selectedPriorityFilter
                          return (
                            <TooltipProvider key={i}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`text-xs p-1.5 rounded-lg truncate flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90 font-medium ${
                                      !matchesFilter ? "opacity-25" : ""
                                    } ${task.completed
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 line-through border border-slate-200/50 dark:border-slate-800"
                                      : task.priority === "high"
                                        ? "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20"
                                        : task.priority === "medium"
                                          ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/20"
                                          : "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20"
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
                                      className="h-3.5 w-3.5 border-slate-300 dark:border-slate-650 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all"
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
                          )
                        })}
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
                        {getTasksForDate(currentDate.getDate()).filter(t => !t.scheduledTime).map(task => {
                          const matchesFilter = selectedPriorityFilter === "all" || task.priority === selectedPriorityFilter
                          return (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                                !matchesFilter ? "opacity-25" : ""
                              } ${task.completed
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
                          )
                        })}
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
                              {hourTasks.map(task => {
                                const matchesFilter = selectedPriorityFilter === "all" || task.priority === selectedPriorityFilter
                                return (
                                  <div
                                    key={task.id}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                                      !matchesFilter ? "opacity-25" : ""
                                    } ${task.completed
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
                                )
                              })}
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t border-slate-100 dark:border-slate-800/60 pt-6">
            <button
              onClick={() => setSelectedPriorityFilter(selectedPriorityFilter === "high" ? "all" : "high")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                selectedPriorityFilter === "high"
                  ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-500/20"
                  : "bg-white/40 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Priority</span>
            </button>
            <button
              onClick={() => setSelectedPriorityFilter(selectedPriorityFilter === "medium" ? "all" : "medium")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                selectedPriorityFilter === "medium"
                  ? "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300 ring-2 ring-yellow-500/20"
                  : "bg-white/40 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Priority</span>
            </button>
            <button
              onClick={() => setSelectedPriorityFilter(selectedPriorityFilter === "low" ? "all" : "low")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                selectedPriorityFilter === "low"
                  ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 ring-2 ring-green-500/20"
                  : "bg-white/40 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low Priority</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Checklist Preview */}
      {selectedDate && (
        <Card className="card-zen p-6 relative overflow-hidden group/checklist">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Icons.tasks className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Tasks for {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h3>
                <p className="text-xs text-slate-500">Manage and check off your logs for this day</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewTask(prev => ({ ...prev, dueDate: selectedDate }))
                setIsAddDialogOpen(true)
              }}
              className="rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-semibold"
            >
              <Icons.plus className="w-3.5 h-3.5 mr-1" /> Add Task
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {tasks.filter(t => t.dueDate === selectedDate).length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic text-xs">
                No tasks scheduled for this day. Click the button above to add one!
              </div>
            ) : (
              tasks.filter(t => t.dueDate === selectedDate).map(task => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    task.completed
                      ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-850 opacity-60"
                      : "bg-white/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/80 shadow-sm hover:border-emerald-200 hover:translate-x-0.5"
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => {
                      updateTask(task.id, { completed: !task.completed })
                      toast({
                        title: !task.completed ? "Task completed! 🎉" : "Task reopened",
                        description: !task.completed ? "Great job!" : "Task marked as pending.",
                      })
                    }}
                    className="h-4 w-4 border-slate-350 dark:border-slate-650 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${task.completed ? "text-slate-555 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        task.priority === "high"
                          ? "bg-red-50/70 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                          : task.priority === "medium"
                            ? "bg-yellow-50/70 border-yellow-200 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-50/70 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
      </div>
    </div>
  )
}
