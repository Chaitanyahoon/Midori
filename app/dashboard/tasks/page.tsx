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
import { useData } from "@/components/local-data-provider"
import getAppreciation from '@/lib/appreciation'
import { useToast } from "@/hooks/use-toast"

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
  const [quickAddValue, setQuickAddValue] = useState("")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work" as const,
    dueDate: "",
    recurrence: "none" as "none" | "daily" | "weekly" | "monthly",
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
      recurrence: "none",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      case "low":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      case "personal":
        return "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
      case "learning":
        return "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
      case "health":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
    }
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent flex items-center gap-3">
            Garden Log
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">Nurture your tasks and watch them bloom.</p>
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
      <Card className="card-premium border-l-4 border-l-emerald-500 overflow-hidden">
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
      <div className="card-premium rounded-2xl p-2 flex flex-wrap gap-2 items-center bg-white/60 dark:bg-slate-900/60 sticky top-4 z-30 transition-all duration-300">
        <div className="flex-1 min-w-[200px] relative group">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Find a seed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-transparent border-none focus-visible:ring-0 placeholder:text-slate-400"
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
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-8 pb-10">
        {Object.keys(groupedTasks).length === 0 || sortedTasks.length === 0 ? (
          <div className="text-center py-20 opacity-0 animate-in fade-in zoom-in-95 duration-700 fill-mode-forwards">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
              <Icons.seedling className="w-12 h-12 text-emerald-300 dark:text-emerald-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">The garden is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {tasks.length === 0
                ? "Plant your first seed to start your productivity journey!"
                : "No matching seeds found. Try adjusting your filters."}
            </p>
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
                    className={`card-premium group hover:scale-[1.01] transition-all duration-300 border-l-4 ${task.completed ? 'border-l-slate-300 dark:border-l-slate-700 opacity-60' : 'border-l-emerald-500'}`}
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
                            </div>

                            <div className="flex items-center self-end sm:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full h-8 w-8 p-0"
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
  )
}
