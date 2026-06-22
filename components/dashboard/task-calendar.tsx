"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { tasks, addTask } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work" as const,
    dueDate: "",
  })

  const handleCellClick = (day?: number | null) => {
    if (!day) return
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0")

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: dateString,
    })
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
    })

    setIsAddDialogOpen(false)
    toast.success("Task created! ✨")
  }

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
    <Card className="card-zen group overflow-hidden relative">
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
            const todayCell = isToday(day)

            if (!day) {
              return <div key={index} />
            }

            return (
              <div
                key={index}
                onClick={() => handleCellClick(day)}
                className={`min-h-[48px] sm:aspect-square p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-350 cursor-pointer border
                  ${todayCell
                    ? "bg-emerald-500 shadow-md shadow-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400 dark:ring-emerald-350 ring-offset-2 dark:ring-offset-slate-900 animate-[pulse_2.5s_infinite]"
                    : "bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-slate-200/60 dark:hover:border-slate-700 border-transparent"
                  }`}
              >
                <div className="h-full flex flex-col items-center justify-start pt-1">
                  <span
                    style={{ color: todayCell ? "#ffffff" : undefined }}
                    className={`text-xs sm:text-sm text-center leading-none inline-block font-semibold ${!todayCell ? "text-slate-700 dark:text-slate-200" : ""}`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="mt-0.5 sm:mt-1 space-y-0.5 w-full">
                      {dayTasks.slice(0, 2).map((task, i) => (
                        <div
                          key={i}
                          className={`w-full h-0.5 sm:h-1 rounded-full ${task.priority === "high"
                            ? "bg-red-400"
                            : task.priority === "medium"
                              ? "bg-yellow-400"
                              : todayCell ? "bg-emerald-200" : "bg-green-500"
                            }`}
                        />
                      ))}
                      {dayTasks.length > 2 && (
                        <div className={`text-[9px] sm:text-[10px] text-center font-bold pb-0.5 ${todayCell ? "text-emerald-100" : "text-slate-400"}`}>
                          +{dayTasks.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Task for {newTask.dueDate ? new Date(newTask.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cal-title">Task Title</Label>
              <Input
                id="cal-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cal-description">Description (Optional)</Label>
              <Textarea
                id="cal-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add task details..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="cal-dueDate">Due Date</Label>
              <Input
                id="cal-dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAddTask}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
