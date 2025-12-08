"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import getAppreciation from '@/lib/appreciation'
import { useToast } from "@/hooks/use-toast"
import { SmartScheduleButton } from "@/components/dashboard/smart-schedule-button"

export function TaskList() {
  const { tasks, addTask, updateTask, userName, userTone } = useData()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work" as const,
    dueDate: "",
  })

  const today = new Date().toISOString().split("T")[0]

  const todayTasks = tasks.filter((task) => !task.completed && (!task.dueDate || task.dueDate === today))
  const upcomingTasks = tasks.filter((task) => !task.completed && task.dueDate && task.dueDate > today)
  const completedTasks = tasks.filter((task) => task.completed).slice(0, 5) // Show only recent 5

  const toggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed })
    const task = tasks.find((t) => t.id === taskId)
    if (completed && task) {
      const app = getAppreciation(task.title, { userName, tone: (userTone as any) || 'balanced' })
      toast({ title: app.title, description: app.message })
    } else {
      toast({
        title: completed ? 'Task completed! 🎉' : 'Task reopened',
        description: completed ? 'Great job! Keep up the momentum.' : 'Task marked as pending.',
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
    })

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: "",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Task added! ✨",
      description: "Your new task has been created successfully.",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return Icons.briefcase
      case "personal":
        return Icons.user
      case "learning":
        return Icons.book
      case "health":
        return Icons.heart
      default:
        return Icons.circle
    }
  }

  const TaskItem = ({ task, showCategory = false }: { task: any; showCategory?: boolean }) => {
    const CategoryIcon = getCategoryIcon(task.category)

    return (
      <div className="group flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
          className="mt-1 rounded-md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`font-medium leading-tight ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
              >
                {task.title}
              </p>
              {task.description && (
                <p
                  className={`text-sm mt-1 leading-relaxed ${task.completed ? "line-through text-gray-400" : "text-gray-600"}`}
                >
                  {task.description}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-3">
                <Badge className={`${getPriorityColor(task.priority)} text-xs px-2 py-1`} variant="outline">
                  {task.priority}
                </Badge>
                {showCategory && (
                  <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {task.category}
                  </Badge>
                )}
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200">
                    <Icons.calendar className="w-3 h-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-semibold flex items-center">
            <Icons.tasks className="w-5 h-5 mr-2 text-emerald-600" />
            Quick Tasks
          </CardTitle>
          <SmartScheduleButton />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Icons.plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
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
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAddTask}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1">
            <TabsTrigger value="today" className="rounded-xl text-sm font-medium">
              Today ({todayTasks.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl text-sm font-medium">
              Upcoming ({upcomingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl text-sm font-medium">
              Done ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4 space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100">
                <Icons.calendar className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No tasks for today</h3>
                <p className="text-sm text-gray-600">Add a task to get started with your productive day!</p>
              </div>
            ) : (
              todayTasks.slice(0, 4).map((task) => <TaskItem key={task.id} task={task} showCategory />)
            )}
            {todayTasks.length > 4 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                  View {todayTasks.length - 4} more tasks
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl border border-blue-100">
                <Icons.clock className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No upcoming tasks</h3>
                <p className="text-sm text-gray-600">Schedule tasks for future dates to stay organized!</p>
              </div>
            ) : (
              upcomingTasks.slice(0, 4).map((task) => <TaskItem key={task.id} task={task} showCategory />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <Icons.target className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No completed tasks yet</h3>
                <p className="text-sm text-gray-600">Complete your first task to see it here!</p>
              </div>
            ) : (
              completedTasks.map((task) => <TaskItem key={task.id} task={task} showCategory />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
