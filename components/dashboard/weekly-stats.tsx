"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

export function WeeklyStats() {
  const { tasks, pomodoros, settings } = useData()

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
        (session) => session.completed && session.startTime.split("T")[0] === dateString,
      ).length

      const dayFocusTime =
        pomodoros
          .filter((session) => session.completed && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60

      weekData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        date: dateString,
        tasks: dayTasks,
        pomodoros: dayPomodoros,
        focusTime: dayFocusTime,
      })
    }

    return weekData
  }

  const weeklyData = getWeeklyData()
  const totalPomodoros = weeklyData.reduce((sum, day) => sum + day.pomodoros, 0)
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0)
  const totalHours = weeklyData.reduce((sum, day) => sum + day.focusTime, 0)

  // Calculate real percentage changes from previous week
  const getPreviousWeekData = () => {
    const today = new Date()
    let prevWeekTasks = 0
    let prevWeekPomodoros = 0
    let prevWeekHours = 0

    for (let i = 13; i >= 7; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      prevWeekTasks += tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === dateString).length
      prevWeekPomodoros += pomodoros.filter(
        (session) => session.completed && session.startTime.split("T")[0] === dateString,
      ).length
      prevWeekHours +=
        pomodoros
          .filter((session) => session.completed && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60
    }

    return { prevWeekTasks, prevWeekPomodoros, prevWeekHours }
  }

  const { prevWeekTasks, prevWeekPomodoros, prevWeekHours } = getPreviousWeekData()

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%"
    const change = ((current - previous) / previous) * 100
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`
  }

  const pomodoroChange = calculateChange(totalPomodoros, prevWeekPomodoros)
  const taskChange = calculateChange(totalTasks, prevWeekTasks)
  const hoursChange = calculateChange(totalHours, prevWeekHours)

  // Calculate progress towards weekly goals (Dynamic based on settings)
  const weeklyGoals = {
    pomodoros: (settings?.dailyGoalPomodoros || 4) * 7,
    tasks: (settings?.dailyGoalTasks || 3) * 7,
    hours: (settings?.dailyGoalHours || 2) * 7,
  }

  // Calculate streak (consecutive days with at least 1 completed task)
  let streak = 0
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].tasks > 0) {
      streak++
    } else {
      break
    }
  }

  // Find best day (most tasks completed)
  const bestDay = weeklyData.reduce((max, day) => (day.tasks > max.tasks ? day : max), weeklyData[0])

  // Calculate completion rate
  const allTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const completionRate = allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0

  // Category breakdown for completed tasks this week
  const categoryColors: Record<string, string> = {
    work: 'bg-blue-400',
    personal: 'bg-pink-400',
    learning: 'bg-purple-400',
    health: 'bg-emerald-400',
  }
  const categoryBreakdown = tasks.filter(t => t.completed && t.completedAt && weeklyData.some(d => t.completedAt && d.date === t.completedAt.split("T")[0]))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // State for dialog
  const [selectedDay, setSelectedDay] = useState<{ date: string, day: string } | null>(null)

  // Animated progress ring (SVG)
  function ProgressRing({ value, color, label }: { value: number, color: string, label: string }) {
    const radius = 32
    const stroke = 8
    const normalizedRadius = radius - stroke / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const progress = Math.min(Math.max(value, 0), 100)
    const offset = circumference - (progress / 100) * circumference
    return (
      <svg width={radius * 2} height={radius * 2} className="block mx-auto">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)' }}
        />
        <text x={radius} y={radius + 6} textAnchor="middle" className="font-bold text-xl fill-emerald-700 dark:fill-emerald-200">
          {progress}%
        </text>
        <text x={radius} y={radius + 28} textAnchor="middle" className="text-xs fill-gray-500 dark:fill-gray-400">
          {label}
        </text>
      </svg>
    )
  }

  // Daily progress bar chart data
  const barData = weeklyData.map(day => ({ name: day.day, Tasks: day.tasks }))

  // Animated streak counter
  const streakCounter = (
    <div className="flex flex-col items-center mb-4">
      <div className="flex items-center gap-2">
        <Icons.sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
        <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 animate-bounce">{streak}</span>
        <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">day streak</span>
        {streak >= 7 && <span className="ml-2 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-xs font-bold text-white shadow">🔥 Weekly Master!</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Complete at least 1 task each day to keep your streak alive!</div>
    </div>
  )

  // Redesigned Weekly Growth section with compact layout
  const weeklyGrowth = (
    <div className="flex flex-col items-center gap-2 mb-4 w-full">
      <div className="w-full max-w-xs flex flex-col items-center">
        <ChartContainer config={{}}>
          <BarChart data={barData} height={70} barSize={18} style={{ width: '100%' }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#10b981' }} />
            <YAxis hide domain={[0, Math.max(...barData.map(d => d.Tasks), 3)]} />
            <Tooltip cursor={{ fill: '#d1fae5', opacity: 0.3 }} />
            <Bar dataKey="Tasks" radius={[6, 6, 0, 0]} fill="#10b981" isAnimationActive />
          </BarChart>
        </ChartContainer>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">Daily completed tasks</div>
      </div>
      <div className="mt-1">{streakCounter}</div>
    </div>
  )

  return (
    <div>
      {weeklyGrowth}
      {/* Cards removed - consolidated into ProductivityCharts */}
    </div>
  );
}
