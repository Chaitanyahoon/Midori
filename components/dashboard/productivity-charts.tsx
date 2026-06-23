"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts"
import { useData } from "@/components/local-data-provider"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface ChartEmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

function ChartEmptyState({ icon, title, description, actionLabel, actionHref }: ChartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 backdrop-blur-sm animate-fade-in w-full">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5 shadow-inner">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed mb-4">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all"
      >
        {actionLabel}
      </Link>
    </div>
  )
}


const WeeklyFocusTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-blue-600 dark:text-blue-400 font-semibold">Focus: {data.hours}h</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {data.pomodoros} sessions • {data.tasks} tasks
        </p>
      </div>
    )
  }
  return null
}

const DailySessionsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-green-600 dark:text-green-400 font-semibold">Sessions: {data.pomodoros}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {data.hours ? data.hours.toFixed(1) : "0.0"}h focus • {data.tasks} tasks
        </p>
      </div>
    )
  }
  return null
}

const CategoryFocusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
          {data.hours}h ({data.value}%)
        </p>
      </div>
    )
  }
  return null
}

const PriorityTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.name} Priority</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
          {data.count} tasks ({data.value}%)
        </p>
      </div>
    )
  }
  return null
}

export function ProductivityCharts() {
  const { tasks, pomodoros } = useData()
  const isDemoData = false

  const DEMO_WEEKLY_DATA = [
    { day: "Mon", tasks: 2, pomodoros: 3, hours: 1.5 },
    { day: "Tue", tasks: 4, pomodoros: 5, hours: 2.5 },
    { day: "Wed", tasks: 1, pomodoros: 2, hours: 1.0 },
    { day: "Thu", tasks: 5, pomodoros: 6, hours: 3.2 },
    { day: "Fri", tasks: 3, pomodoros: 4, hours: 2.0 },
    { day: "Sat", tasks: 6, pomodoros: 8, hours: 4.5 },
    { day: "Sun", tasks: 2, pomodoros: 3, hours: 1.8 },
  ]

  const DEMO_TASK_DISTRIBUTION = [
    { name: "Work", value: 40, color: "#3B82F6", count: 4 },
    { name: "Personal", value: 30, color: "#10B981", count: 3 },
    { name: "Learning", value: 20, color: "#8B5CF6", count: 2 },
    { name: "Health", value: 10, color: "#F59E0B", count: 1 },
  ]

  const DEMO_PRIORITY_DISTRIBUTION = [
    { name: "High", value: 30, color: "#EF4444", count: 3 },
    { name: "Medium", value: 50, color: "#F59E0B", count: 5 },
    { name: "Low", value: 20, color: "#10B981", count: 2 },
  ]

  const DEMO_FOCUS_TIME_BY_CATEGORY = [
    { name: "Work", value: 45, color: "#3B82F6", hours: 7.5 },
    { name: "Personal", value: 20, color: "#10B981", hours: 3.2 },
    { name: "Learning", value: 25, color: "#8B5CF6", hours: 4.0 },
    { name: "Health", value: 10, color: "#F59E0B", hours: 1.5 },
  ]

  // Calculate weekly data with real insights
  const getWeeklyData = () => {
    const today = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === dateString).length

      const dayPomodoros = pomodoros.filter(
        (session) => session.completed && session.startTime && session.startTime.split("T")[0] === dateString,
      ).length

      const dayFocusTime =
        pomodoros
          .filter((session) => session.completed && session.startTime && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60

      weekData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        date: dateString,
        tasks: dayTasks,
        pomodoros: dayPomodoros,
        hours: Number.parseFloat(dayFocusTime.toFixed(1)),
      })
    }

    return weekData
  }

  // Calculate task distribution with insights
  const getTaskDistribution = () => {
    const categories = {
      work: tasks.filter((t) => t.category === "work").length,
      personal: tasks.filter((t) => t.category === "personal").length,
      learning: tasks.filter((t) => t.category === "learning").length,
      health: tasks.filter((t) => t.category === "health").length,
    }

    const total = Object.values(categories).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      return [{ name: "No tasks yet", value: 100, color: "#E5E7EB", count: 0 }]
    }

    return [
      { name: "Work", value: Math.round((categories.work / total) * 100), color: "#3B82F6", count: categories.work },
      {
        name: "Personal",
        value: Math.round((categories.personal / total) * 100),
        color: "#10B981",
        count: categories.personal,
      },
      {
        name: "Learning",
        value: Math.round((categories.learning / total) * 100),
        color: "#8B5CF6",
        count: categories.learning,
      },
      {
        name: "Health",
        value: Math.round((categories.health / total) * 100),
        color: "#F59E0B",
        count: categories.health,
      },
    ].filter((item) => item.value > 0)
  }

  // Calculate priority distribution
  const getPriorityDistribution = () => {
    const priorities = {
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    }

    const total = Object.values(priorities).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      return [{ name: "No tasks yet", value: 100, color: "#E5E7EB", count: 0 }]
    }

    return [
      { name: "High", value: Math.round((priorities.high / total) * 100), color: "#EF4444", count: priorities.high },
      {
        name: "Medium",
        value: Math.round((priorities.medium / total) * 100),
        color: "#F59E0B",
        count: priorities.medium,
      },
      { name: "Low", value: Math.round((priorities.low / total) * 100), color: "#10B981", count: priorities.low },
    ].filter((item) => item.value > 0)
  }

  // Calculate focus time by task category
  const getFocusTimeByCategory = () => {
    const categoryFocus = {
      work: 0,
      personal: 0,
      learning: 0,
      health: 0,
      general: 0,
    }

    pomodoros.forEach((session) => {
      if (session.completed) {
        if (session.taskId) {
          const task = tasks.find((t) => t.id === session.taskId)
          if (task) {
            categoryFocus[task.category] += session.duration
          } else {
            // Task was deleted, count as general
            categoryFocus.general += session.duration
          }
        } else {
          categoryFocus.general += session.duration
        }
      }
    })

    const total = Object.values(categoryFocus).reduce((sum, time) => sum + time, 0)

    if (total === 0) {
      return [{ name: "No focus time yet", value: 100, color: "#E5E7EB", hours: 0 }]
    }

    return [
      {
        name: "Work",
        value: Math.round((categoryFocus.work / total) * 100),
        color: "#3B82F6",
        hours: Number.parseFloat((categoryFocus.work / 60).toFixed(1)),
      },
      {
        name: "Personal",
        value: Math.round((categoryFocus.personal / total) * 100),
        color: "#10B981",
        hours: Number.parseFloat((categoryFocus.personal / 60).toFixed(1)),
      },
      {
        name: "Learning",
        value: Math.round((categoryFocus.learning / total) * 100),
        color: "#8B5CF6",
        hours: Number.parseFloat((categoryFocus.learning / 60).toFixed(1)),
      },
      {
        name: "Health",
        value: Math.round((categoryFocus.health / total) * 100),
        color: "#F59E0B",
        hours: Number.parseFloat((categoryFocus.health / 60).toFixed(1)),
      },
      {
        name: "General",
        value: Math.round((categoryFocus.general / total) * 100),
        color: "#6B7280",
        hours: Number.parseFloat((categoryFocus.general / 60).toFixed(1)),
      },
    ].filter((item) => item.value > 0)
  }

  const weeklyData = isDemoData ? DEMO_WEEKLY_DATA : getWeeklyData()
  const taskDistribution = isDemoData ? DEMO_TASK_DISTRIBUTION : getTaskDistribution()
  const priorityDistribution = isDemoData ? DEMO_PRIORITY_DISTRIBUTION : getPriorityDistribution()
  const focusTimeByCategory = isDemoData ? DEMO_FOCUS_TIME_BY_CATEGORY : getFocusTimeByCategory()

  const hasFocusFlow = weeklyData.some(d => d.hours > 0)
  const hasSessions = weeklyData.some(d => d.pomodoros > 0)
  const hasCategoryFocus = focusTimeByCategory.length > 0 && focusTimeByCategory[0]?.name !== "No focus time yet"
  const hasPriorityData = priorityDistribution.length > 0 && priorityDistribution[0]?.name !== "No tasks yet"


  // Calculate insights
  const totalTasks = isDemoData ? 10 : tasks.length
  const completedTasks = isDemoData ? 7 : tasks.filter((t) => t.completed).length
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const avgFocusPerDay = weeklyData.reduce((sum, day) => sum + day.hours, 0) / 7
  const mostProductiveDay = weeklyData.reduce((max, day) => (day.tasks > max.tasks ? day : max), weeklyData[0])

  // Calculate trends
  const totalFocusThisWeek = weeklyData.reduce((sum, day) => sum + day.hours, 0)
  const totalPomodorosThisWeek = weeklyData.reduce((sum, day) => sum + day.pomodoros, 0)
  const totalTasksThisWeek = weeklyData.reduce((sum, day) => sum + day.tasks, 0)

  // Week-over-week comparison (if we had last week's data, but for now use first vs last 3 days)
  const firstHalf = weeklyData.slice(0, 3).reduce((sum, day) => sum + day.hours, 0)
  const secondHalf = weeklyData.slice(4).reduce((sum, day) => sum + day.hours, 0)
  const focusTrend = secondHalf > firstHalf ? "up" : secondHalf < firstHalf ? "down" : "stable"

  // Best performing day
  const bestDay = weeklyData.reduce((max, day) => {
    const dayScore = day.tasks * 2 + day.pomodoros * 1.5 + day.hours
    const maxScore = max.tasks * 2 + max.pomodoros * 1.5 + max.hours
    return dayScore > maxScore ? day : max
  }, weeklyData[0])

  // Calculate category insights
  const topCategory = focusTimeByCategory.length > 0
    ? focusTimeByCategory.reduce((max, cat) => cat.hours > max.hours ? cat : max, focusTimeByCategory[0])
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Insights Summary */}
      <Card className="card-zen relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-emerald-400/20 transition-colors duration-1000" />
        <CardHeader className="border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10 px-6 py-5">
          <CardTitle className="flex items-center justify-between w-full text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
            <div className="flex items-center">
              <Icons.sparkles className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
              Productivity Summary
              {isDemoData && (
                <Badge variant="secondary" className="ml-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Preview
                </Badge>
              )}
            </div>
            <span className="text-sm font-serif opacity-30">総括</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-5 card-zen">
              <div className="flex items-center justify-center mb-3">
                <Icons.target className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{overallCompletionRate}%</div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Completion Rate</div>
              <Progress value={overallCompletionRate} className="mt-4 h-2 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="text-center p-5 card-zen">
              <div className="flex items-center justify-center mb-3">
                <Icons.clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{avgFocusPerDay.toFixed(1)}h</div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg Focus/Day</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-2">{totalFocusThisWeek.toFixed(1)}h this week</div>
            </div>
            <div className="text-center p-5 card-zen">
              <div className="flex items-center justify-center mb-3">
                <Icons.timer className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{totalPomodorosThisWeek}</div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Sessions/Week</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-2">{(totalPomodorosThisWeek / 7).toFixed(1)}/day avg</div>
            </div>
            <div className="text-center p-5 card-zen">
              <div className="flex items-center justify-center mb-3">
                <Icons.trendingUp className={`w-6 h-6 mr-2 ${focusTrend === "up" ? "text-green-600 dark:text-green-400" :
                    focusTrend === "down" ? "text-red-400 dark:text-red-400" :
                      "text-slate-400 dark:text-slate-500"
                  }`} />
                <div className="text-3xl font-black text-orange-600 dark:text-orange-400">{bestDay?.day || "N/A"}</div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Best Day</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-2">{bestDay?.tasks || 0} tasks, {bestDay?.pomodoros || 0} sessions</div>
            </div>
          </div>

          {/* Additional Insights */}
          {topCategory && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Focus Category</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{topCategory.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{topCategory.hours}h</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{topCategory.value}% of total</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Hours - Enhanced */}
        <Card className="card-zen min-h-[370px] flex flex-col group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-blue-400/20 transition-colors duration-1000" />
          <CardHeader className="border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                <Icons.clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Weekly Focus Flow
                {isDemoData && (
                  <Badge variant="outline" className="ml-2 border-slate-300 dark:border-slate-700 text-slate-500 text-[9px] uppercase tracking-widest font-semibold">
                    Sample
                  </Badge>
                )}
              </CardTitle>
              <Badge className="bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1 font-bold">
                {totalFocusThisWeek.toFixed(1)}h total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasFocusFlow ? (
              <ChartEmptyState
                icon={<Icons.clock className="w-5 h-5" />}
                title="Focus Flow Empty"
                description="Start a Pomodoro session or record focused work to map your flow."
                actionLabel="Go to Timer"
                actionHref="/dashboard/pomodoro"
              />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="99%" height="100%" minWidth={100} initialDimension={{ width: 100, height: 100 }}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />
                    <XAxis dataKey="day" stroke="#6B7280" className="dark:stroke-slate-400" />
                    <YAxis stroke="#6B7280" className="dark:stroke-slate-400" />
                    <ChartTooltip content={<WeeklyFocusTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#colorFocus)"
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Pomodoros - Enhanced */}
        <Card className="card-zen min-h-[370px] flex flex-col group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 dark:bg-green-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-green-400/20 transition-colors duration-1000" />
          <CardHeader className="border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent">
                <Icons.timer className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Daily Focus Sessions
                {isDemoData && (
                  <Badge variant="outline" className="ml-2 border-slate-300 dark:border-slate-700 text-slate-500 text-[9px] uppercase tracking-widest font-semibold">
                    Sample
                  </Badge>
                )}
              </CardTitle>
              <Badge className="bg-green-500/10 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full px-3 py-1 font-bold">
                {totalPomodorosThisWeek} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasSessions ? (
              <ChartEmptyState
                icon={<Icons.timer className="w-5 h-5" />}
                title="No Focus Sessions"
                description="Complete your daily focus intervals to graph your session stats."
                actionLabel="Start Interval"
                actionHref="/dashboard/pomodoro"
              />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="99%" height="100%" minWidth={100} initialDimension={{ width: 100, height: 100 }}>
                  <BarChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorPomodoros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />
                    <XAxis dataKey="day" stroke="#6B7280" className="dark:stroke-slate-400" />
                    <YAxis stroke="#6B7280" className="dark:stroke-slate-400" />
                    <ChartTooltip content={<DailySessionsTooltip />} />
                    <Bar
                      dataKey="pomodoros"
                      fill="url(#colorPomodoros)"
                      radius={[8, 8, 0, 0]}
                      stroke="#10B981"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Focus Time by Category - Enhanced */}
        <Card className="card-zen min-h-[370px] flex flex-col group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-purple-400/20 transition-colors duration-1000" />
          <CardHeader className="border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10 px-6 py-5">
            <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-purple-800 to-fuchsia-600 dark:from-purple-300 dark:to-fuchsia-300 bg-clip-text text-transparent">
              <Icons.target className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Focus By Category
              {isDemoData && (
                <Badge variant="outline" className="ml-2 border-slate-300 dark:border-slate-700 text-slate-500 text-[9px] uppercase tracking-widest font-semibold">
                  Sample
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasCategoryFocus ? (
              <ChartEmptyState
                icon={<Icons.target className="w-5 h-5" />}
                title="No Category Breakdown"
                description="Associate focus sessions with tasks to see category analytics."
                actionLabel="Assign Tasks"
                actionHref="/dashboard/tasks"
              />
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="99%" height="100%" minWidth={100} initialDimension={{ width: 100, height: 100 }}>
                    <PieChart>
                      <Pie
                        data={focusTimeByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {focusTimeByCategory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={entry.color}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<CategoryFocusTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {focusTimeByCategory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-purple-100/50 dark:border-purple-800/50"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.hours}h</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Task Priority Distribution - Enhanced */}
        <Card className="card-zen min-h-[370px] flex flex-col group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 dark:bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none group-hover:bg-orange-400/20 transition-colors duration-1000" />
          <CardHeader className="border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10 px-6 py-5">
            <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-orange-800 to-amber-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
              <Icons.zap className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Priority Distribution
              {isDemoData && (
                <Badge variant="outline" className="ml-2 border-slate-300 dark:border-slate-700 text-slate-500 text-[9px] uppercase tracking-widest font-semibold">
                  Sample
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasPriorityData ? (
              <ChartEmptyState
                icon={<Icons.zap className="w-5 h-5" />}
                title="No Priority Data"
                description="Assign priority levels (High, Med, Low) to tasks to see trends."
                actionLabel="Go to Tasks"
                actionHref="/dashboard/tasks"
              />
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="99%" height="100%" minWidth={100} initialDimension={{ width: 100, height: 100 }}>
                    <PieChart>
                      <Pie
                        data={priorityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {priorityDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={entry.color}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<PriorityTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {priorityDistribution.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-orange-100/50 dark:border-orange-800/50"
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.value}%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{item.count} tasks</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
