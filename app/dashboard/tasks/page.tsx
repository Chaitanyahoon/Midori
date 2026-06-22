"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { useData, type Task } from "@/components/local-data-provider"
import getAppreciation from '@/lib/appreciation'
import { useToast } from "@/hooks/use-toast"
import { fireTaskConfetti } from "@/lib/confetti"
import { playTaskComplete } from "@/lib/sounds"

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, settings } = useData()
  const { userName, userTone } = settings
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [groupBy, setGroupBy] = useState<"none" | "priority" | "category" | "dueDate">("none")
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "category" | "title">("priority")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [quickAddValue, setQuickAddValue] = useState("")
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [newSubTaskTitles, setNewSubTaskTitles] = useState<Record<string, string>>({})
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work" as const,
    dueDate: "",
    recurrence: { type: "none" } as Task["recurrence"],
  })

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "all" || (filter === "pending" && !task.completed) || (filter === "completed" && task.completed)

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesPriority && matchesSearch
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    } else if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category)
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  // Group tasks
  const groupedTasks = groupBy === "none"
    ? { "All Seeds": sortedTasks }
    : groupBy === "priority"
      ? sortedTasks.reduce((acc, task) => {
        const key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + " Priority"
        if (!acc[key]) acc[key] = []
        acc[key].push(task)
        return acc
      }, {} as Record<string, typeof sortedTasks>)
      : groupBy === "category"
        ? sortedTasks.reduce((acc, task) => {
          const key = task.category.charAt(0).toUpperCase() + task.category.slice(1)
          if (!acc[key]) acc[key] = []
          acc[key].push(task)
          return acc
        }, {} as Record<string, typeof sortedTasks>)
        : sortedTasks.reduce((acc, task) => {
          const today = new Date().toISOString().split("T")[0]
          let key = "No Due Date"
          if (task.dueDate) {
            if (task.dueDate < today) key = "Wilting (Overdue)"
            else if (task.dueDate === today) key = "Bloom Today"
            else {
              const dueDate = new Date(task.dueDate)
              const daysDiff = Math.ceil((dueDate.getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
              if (daysDiff <= 7) key = "Sprouting Soon"
              else if (daysDiff <= 30) key = "Growing"
              else key = "Future Harvest"
            }
          }
          if (!acc[key]) acc[key] = []
          acc[key].push(task)
          return acc
        }, {} as Record<string, typeof sortedTasks>)

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && quickAddValue.trim()) {
      addTask({
        title: quickAddValue.trim(),
        description: "",
        priority: "medium",
        category: "work",
        completed: false,
      })
      setQuickAddValue("")
      toast({
        title: "Seed Planted! 🌱",
        description: "Your task has been added to the garden.",
      })
    }
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
      recurrence: newTask.recurrence,
    })

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: "",
      recurrence: { type: "none" },
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Seed Planted! 🌱",
      description: "Your new task is ready to grow.",
    })
  }

  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed })
    const task = tasks.find((t) => t.id === taskId)
    if (completed && task) {
      fireTaskConfetti()
      playTaskComplete()
      const app = getAppreciation(task.title, { userName, tone: (userTone as any) || 'balanced' })
      toast({
        title: app.title,
        description: app.message,
      })
    } else {
      toast({
        title: completed ? 'Harvested! 🌸' : 'Replanted',
        description: completed ? 'Great job! Keep growing.' : 'Task returned to the garden.',
      })
    }
  }

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleAddSubTask = (taskId: string) => {
    const title = newSubTaskTitles[taskId]?.trim()
    if (!title) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const subtasks = task.subtasks || []
    const newSub = {
      id: Math.random().toString(36).substring(7),
      title,
      completed: false,
    }
    updateTask(taskId, { subtasks: [...subtasks, newSub] })
    setNewSubTaskTitles((prev) => ({ ...prev, [taskId]: "" }))
    toast({
      title: "Step added! 🌿",
      description: "Sub-task added successfully.",
    })
  }

  const handleToggleSubTask = (taskId: string, subTaskId: string, completed: boolean) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const subtasks = (task.subtasks || []).map((sub) =>
      sub.id === subTaskId ? { ...sub, completed } : sub
    )
    updateTask(taskId, { subtasks })
  }

  const handleDeleteSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const subtasks = (task.subtasks || []).filter((sub) => sub.id !== subTaskId)
    updateTask(taskId, { subtasks })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
      case "medium":
        return "bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
      case "low":
        return "bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
      default:
        return "bg-slate-500/10 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
      case "personal":
        return "bg-violet-500/10 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
      case "learning":
        return "bg-teal-500/10 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
      case "health":
        return "bg-pink-500/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20"
      default:
        return "bg-slate-500/10 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
    }
  }

  return (
    <div className="w-full min-h-full ambient-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent flex items-center gap-3 leading-tight">
              Garden Log
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Nurture your tasks and watch them bloom.</p>
          </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-organic h-11 px-6 text-base shadow-lg hover:shadow-emerald-500/20">
              <Icons.plus className="w-5 h-5 mr-2" />
              Plant Seed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-100 dark:border-emerald-900 shadow-2xl rounded-3xl p-0 overflow-hidden">
            <DialogHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 border-b border-emerald-100/50 dark:border-emerald-900/50">
              <DialogTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                  <Icons.seedling className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-emerald-900 dark:text-emerald-100 font-bold block">
                    Plant New Seed
                  </span>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-300/80 font-medium mt-0.5">
                    What would you like to grow?
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icons.sparkles className="w-4 h-4 text-emerald-500" />
                  Zen Task Templates
                </Label>
                <Select
                  onValueChange={(val) => {
                    const templates = {
                      morning: {
                        title: "Morning Reflection & Goal Setting",
                        priority: "low",
                        category: "personal",
                        description: "Spend 10 minutes planning the day, practicing gratitude, and setting intentions."
                      },
                      focus: {
                        title: "Deep Focus Session (90 Mins)",
                        priority: "high",
                        category: "work",
                        description: "Silence notifications, open focus tools, and dedicate uninterrupted time to core work."
                      },
                      weekly: {
                        title: "Weekly Review & Alignment",
                        priority: "medium",
                        category: "learning",
                        description: "Reflect on accomplishments, organize tasks, clear the garden, and set goals for next week."
                      },
                      breather: {
                        title: "Healthy Breather & Stretch",
                        priority: "low",
                        category: "health",
                        description: "Do a 5-minute breathing exercise, hydrate, and stretch to restore physical and mental energy."
                      }
                    }
                    const selected = templates[val as keyof typeof templates]
                    if (selected) {
                      setNewTask({
                        title: selected.title,
                        description: selected.description,
                        priority: selected.priority as any,
                        category: selected.category as any,
                        dueDate: newTask.dueDate || "",
                        recurrence: newTask.recurrence || { type: "none" }
                      })
                      toast({
                        title: "Template Applied! ✨",
                        description: `Pre-filled fields with ${selected.title}.`,
                      })
                    }
                  }}
                >
                  <SelectTrigger className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 focus:border-emerald-400 h-11 rounded-xl">
                    <SelectValue placeholder="Select a Zen template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">🌅 Morning Reflection</SelectItem>
                    <SelectItem value="focus">🎯 Deep Focus Block</SelectItem>
                    <SelectItem value="weekly">📅 Weekly Review</SelectItem>
                    <SelectItem value="breather">🧘‍♀️ Healthy Breather</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.target className="w-4 h-4 text-amber-500" />
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
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
                    onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
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
                  Plant It
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Add Section */}
      <Card className="card-zen border-l-4 border-l-emerald-500 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center h-16">
            <div className="pl-6 pr-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Icons.plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <Input
              placeholder="Plant a quick seed (Press Enter)..."
              value={quickAddValue}
              onChange={(e) => setQuickAddValue(e.target.value)}
              onKeyDown={handleQuickAdd}
              className="flex-1 border-none focus-visible:ring-0 bg-transparent h-full text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <div className="pr-4">
              <Button
                onClick={() => {
                  if (quickAddValue.trim()) {
                    addTask({
                      title: quickAddValue.trim(),
                      description: "",
                      priority: "medium",
                      category: "work",
                      completed: false,
                    })
                    setQuickAddValue("")
                    toast({
                      title: "Seed Planted! 🌱",
                      description: "Your task has been added to the garden.",
                    })
                  }
                }}
                disabled={!quickAddValue.trim()}
                size="sm"
                className={`rounded-lg transition-all ${quickAddValue.trim() ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters (Glass Bar) */}
      <div className="card-zen p-3 flex flex-wrap gap-2 items-center sticky top-4 z-30 transition-all duration-300 hover:translate-y-0">
        <div className="flex-1 min-w-[200px] relative rounded-xl bg-slate-100/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 focus-within:border-emerald-400 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-400/20 dark:focus-within:ring-emerald-500/20 transition-all duration-200">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors" />
          <Input
            placeholder="Find a seed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-transparent border-none focus-visible:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 h-9 text-sm"
          />
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[110px] h-9 rounded-lg border-0 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="pending">Growing</SelectItem>
              <SelectItem value="completed">Harvested</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
            <SelectTrigger className="w-[110px] h-9 rounded-lg border-0 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">🔥 High</SelectItem>
              <SelectItem value="medium">🌿 Medium</SelectItem>
              <SelectItem value="low">🌱 Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
            <SelectTrigger className="w-[120px] h-9 rounded-lg border-0 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Groups</SelectItem>
              <SelectItem value="priority">By Priority</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="dueDate">By Harvest Date</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-700/40 gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all ${
                viewMode === "board"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Board
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-8 pb-10">
        {viewMode === "board" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["high", "medium", "low"] as const).map((colPriority) => {
              const colTasks = sortedTasks.filter(t => t.priority === colPriority)
              const borderColors = {
                high: "border-t-rose-500/80 dark:border-t-rose-500/80",
                medium: "border-t-amber-500/80 dark:border-t-amber-500/80",
                low: "border-t-emerald-500/80 dark:border-t-emerald-500/80"
              }
              const textColors = {
                high: "text-rose-600 dark:text-rose-400",
                medium: "text-amber-600 dark:text-amber-400",
                low: "text-emerald-600 dark:text-emerald-400"
              }
              const label = {
                high: "🔥 High Priority",
                medium: "🌿 Medium Priority",
                low: "🌱 Low Priority"
              }

              return (
                <div
                  key={colPriority}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData("text/plain")
                    if (taskId) {
                      updateTask(taskId, { priority: colPriority })
                      toast({
                        title: "Task Prioritized! 🎯",
                        description: `Task moved to ${label[colPriority]}.`,
                      })
                    }
                  }}
                  className={`card-zen p-5 min-h-[450px] flex flex-col border-t-4 ${borderColors[colPriority]} bg-slate-50/5 dark:bg-slate-900/10`}
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40 dark:border-slate-700/40">
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${textColors[colPriority]}`}>
                      {label[colPriority]}
                    </h3>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono">
                      {colTasks.length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-1">
                    {colTasks.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic">
                        Drag seeds here
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", task.id)
                            e.dataTransfer.effectAllowed = "move"
                          }}
                          className={`card-zen p-4 border cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all bg-white/90 dark:bg-slate-850/85 border-slate-200/80 dark:border-slate-800/60 shadow-sm ${
                            task.completed ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                              className="w-4.5 h-4.5 rounded-full border-slate-350 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold truncate leading-tight ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                                <Badge className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${getCategoryColor(task.category)}`}>
                                  {task.category}
                                </Badge>
                                {task.dueDate && (
                                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                                    📅 {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : Object.keys(groupedTasks).length === 0 || sortedTasks.length === 0 ? (
          <div className="text-center py-16 opacity-0 animate-in fade-in scale-in duration-500 fill-mode-forwards">
            {tasks.length === 0 ? (
              <div className="max-w-md mx-auto card-zen p-8 text-center bg-gradient-to-br from-emerald-500/[0.02] via-white/50 to-teal-500/[0.02] dark:from-emerald-500/[0.05] dark:via-slate-900/40 dark:to-teal-500/[0.05] shadow-xl border border-emerald-100/50 dark:border-emerald-900/30">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-float">
                  <Icons.seedling className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Your Garden is Empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Midori is a quiet space to grow your productivity. Plant your first seed to track your goals and see them bloom in your visual garden.
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="btn-organic px-6 h-11 text-sm font-semibold shadow-md hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Icons.plus className="w-4 h-4 mr-2" /> Plant Your First Seed
                </Button>
              </div>
            ) : (
              <div className="max-w-md mx-auto card-zen p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Icons.search className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No Matching Seeds</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Try adjusting your search terms or filters to find what you are looking for.
                </p>
              </div>
            )}
          </div>
        ) : (
          Object.entries(groupedTasks).map(([groupName, groupTasks], groupIndex) => (
            <div key={groupName} className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              {groupBy !== "none" && (
                <div className="flex items-center gap-3 px-1 mb-2">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
                    {groupName}
                  </h3>
                  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700 flex-1"></div>
                  <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {groupTasks.length}
                  </Badge>
                </div>
              )}
              <div className="grid gap-4">
                {groupTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`card-zen group border-l-4 transition-all duration-305 hover:border-l-6 ${
                      task.completed 
                        ? 'border-l-slate-300 dark:border-l-slate-700 opacity-60' 
                        : 'border-l-emerald-500 hover:border-l-emerald-600 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:shadow-emerald-400/5'
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <div className="pt-1">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                            className="w-6 h-6 rounded-full border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <h3
                                className={`text-base sm:text-lg font-bold leading-tight transition-colors ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-100"}`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p
                                  className={`text-sm ${task.completed ? "line-through text-slate-400" : "text-slate-600 dark:text-slate-400"}`}
                                >
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Badge className={`rounded-md px-2 py-0.5 text-xs font-semibold ${getPriorityColor(task.priority)} scale-95 origin-left`}>
                                  {task.priority}
                                </Badge>
                                <Badge className={`rounded-md px-2 py-0.5 text-xs font-semibold ${getCategoryColor(task.category)} scale-95 origin-left`}>
                                  {task.category}
                                </Badge>
                                {task.dueDate && (
                                  <Badge
                                    variant="outline"
                                    className={`rounded-md px-2 py-0.5 text-xs border bg-transparent ${task.dueDate < new Date().toISOString().split("T")[0] && !task.completed
                                      ? "border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400"
                                      : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                                      }`}
                                  >
                                    <Icons.calendar className="w-3 h-3 mr-1.5" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>

                              {/* Subtasks Progress / Toggle button */}
                              <div className="flex items-center gap-3 mt-4">
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); toggleExpand(task.id); }}
                                  className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-450 transition-colors flex items-center gap-1.5"
                                >
                                  {expandedTasks[task.id] ? (
                                    <Icons.chevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <Icons.chevronDown className="w-3.5 h-3.5" />
                                  )}
                                  {task.subtasks && task.subtasks.length > 0 ? (
                                    <span>
                                      Steps ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                                    </span>
                                  ) : (
                                    <span>Add Steps</span>
                                  )}
                                </button>
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="flex-1 max-w-[120px] bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-emerald-500 h-full transition-all duration-300"
                                      style={{
                                        width: `${
                                          (task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Expanded Checklist */}
                              {expandedTasks[task.id] && (
                                <div className="mt-4 pl-1 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                  {task.subtasks && task.subtasks.length > 0 ? (
                                    <div className="space-y-2 max-w-lg">
                                      {task.subtasks.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between gap-3 group/sub pl-1">
                                          <div className="flex items-center gap-2.5">
                                            <Checkbox
                                              checked={sub.completed}
                                              onCheckedChange={(checked) =>
                                                handleToggleSubTask(task.id, sub.id, checked as boolean)
                                              }
                                              className="w-4 h-4 rounded-full border border-slate-350 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all scale-90"
                                            />
                                            <span
                                              className={`text-sm font-medium ${
                                                sub.completed
                                                  ? "line-through text-slate-400 dark:text-slate-500"
                                                  : "text-slate-700 dark:text-slate-300"
                                              }`}
                                            >
                                              {sub.title}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteSubTask(task.id, sub.id)}
                                            className="text-slate-400 hover:text-rose-500 opacity-0 group-hover/sub:opacity-100 transition-opacity p-0.5"
                                          >
                                            <Icons.close className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-slate-400 italic">No sub-tasks yet. Break it down! 🌿</p>
                                  )}

                                  {/* Add new sub-task inline */}
                                  <div className="flex items-center gap-2 max-w-sm mt-3 pt-1">
                                    <Input
                                      placeholder="Add a step..."
                                      value={newSubTaskTitles[task.id] || ""}
                                      onChange={(e) =>
                                        setNewSubTaskTitles((prev) => ({ ...prev, [task.id]: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault()
                                          handleAddSubTask(task.id)
                                        }
                                      }}
                                      className="h-8 text-xs bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-emerald-400 rounded-lg px-2.5"
                                    />
                                    <Button
                                      size="sm"
                                      type="button"
                                      onClick={() => handleAddSubTask(task.id)}
                                      className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5"
                                    >
                                      <Icons.plus className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center self-end sm:self-start opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full h-8 w-8 p-0 touch-manipulation"
                              >
                                <Icons.trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}
