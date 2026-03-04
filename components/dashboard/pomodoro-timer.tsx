"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [selectedTask, setSelectedTask] = useState<string>("general")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { addPomodoro, pomodoros, tasks } = useData()
  const { toast } = useToast()

  const pendingTasks = tasks.filter((task) => !task.completed)
  const todaySessions = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  // Clear interval on unmount and when dependencies change
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearCurrentInterval()
    }
  }, [clearCurrentInterval])

  const handleTimerComplete = useCallback(() => {
    if (!isBreak && sessionStartTime) {
      // Complete focus session
      addPomodoro({
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        duration: 25,
        taskId: selectedTask === "general" ? undefined : selectedTask,
        completed: true,
      })

      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)

      toast({
        title: "Focus session completed! 🎉",
        description: `Great job! You've completed ${newSessionCount} sessions today.`,
      })

      // Start break
      setIsBreak(true)
      const breakDuration = newSessionCount % 4 === 0 ? 15 : 5 // Long break every 4 sessions
      setTimeLeft(breakDuration * 60)
      setSessionStartTime(null)
    } else if (isBreak) {
      // Break completed
      const isLongBreak = sessionCount % 4 === 0
      toast({
        title: isLongBreak ? "Long break over! 💪" : "Break time over! ⚡",
        description: "Ready for another focused session?",
      })

      setIsBreak(false)
      setTimeLeft(25 * 60) // Back to 25 minutes
    }
  }, [isBreak, sessionStartTime, sessionCount, selectedTask, addPomodoro, toast])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false)
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      clearCurrentInterval()
    }

    return () => {
      clearCurrentInterval()
    }
  }, [isActive, timeLeft, handleTimerComplete, clearCurrentInterval])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTotalTime = () => {
    if (isBreak) {
      return sessionCount % 4 === 0 ? 15 * 60 : 5 * 60 // Long break or short break
    }
    return 25 * 60 // Focus time
  }

  const totalTime = getTotalTime()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const handleStart = () => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    clearCurrentInterval()

    if (isBreak) {
      const breakDuration = sessionCount % 4 === 0 ? 15 : 5
      setTimeLeft(breakDuration * 60)
    } else {
      setTimeLeft(25 * 60)
      setSessionStartTime(null)
    }
  }

  const handleSkip = () => {
    setIsActive(false)
    clearCurrentInterval()

    if (isBreak) {
      // Skip break
      setIsBreak(false)
      setTimeLeft(25 * 60)
    } else {
      // Skip to break
      if (sessionStartTime) {
        addPomodoro({
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: Math.round((25 * 60 - timeLeft) / 60), // Partial session
          taskId: selectedTask === "general" ? undefined : selectedTask,
          completed: false,
        })
      }

      setIsBreak(true)
      const breakDuration = (sessionCount + 1) % 4 === 0 ? 15 : 5
      setTimeLeft(breakDuration * 60)
      setSessionStartTime(null)
    }
  }

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return "General Focus"
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.title : "Deleted Task"
  }

  return (
    <Card className="relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl shadow-emerald-500/5 rounded-2xl group">
      {/* Subtle animated background gradient */}
      <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${isActive ? (isBreak ? 'bg-gradient-to-br from-emerald-400/20 to-teal-400/20' : 'bg-gradient-to-br from-amber-400/20 to-orange-400/20') : 'bg-transparent'}`} />

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center text-slate-800 dark:text-slate-100">
          <Icons.timer className={`w-5 h-5 mr-2.5 transition-colors duration-500 ${isActive ? (isBreak ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`} />
          Focus Flow
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {sessionCount > 0 ? `${sessionCount} sessions completed today` : 'Ready to grow your focus?'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="text-center mt-2">
          {/* Main Timer Display */}
          <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
            {/* Outer animated glow ring when active */}
            {isActive && (
              <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse ${isBreak ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            )}

            {/* Inner circle background */}
            <div
              className={`absolute inset-2 rounded-full shadow-inner transition-colors duration-700 ${isBreak
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40"
                  : "bg-amber-50/80 dark:bg-amber-950/40"
                }`}
            />

            {/* Time reading */}
            <div className="relative z-10 flex flex-col items-center">
              <span className={`text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm ${isBreak ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                {isBreak ? (sessionCount % 4 === 0 ? "Long Break" : "Take a beat") : "Deep Work"}
              </span>
            </div>

            {/* Progress Ring SVG */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke={isBreak ? "url(#breakGradient)" : "url(#focusGradient)"}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className={`w-full h-2 mb-6 ${isBreak ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500'}`} />

          {/* Task Selection */}
          {!isBreak && (
            <div className="mb-6 relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icons.leaf className="w-4 h-4 text-emerald-500" />
              </div>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger className="w-full pl-9 pr-3 py-5 text-sm font-medium bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-emerald-500/50 transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
                  <SelectValue placeholder="What are we growing today?" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl">
                  <SelectItem value="general" className="font-medium text-slate-700 dark:text-slate-300">
                    General Focus
                  </SelectItem>
                  {pendingTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id} className="text-slate-600 dark:text-slate-400">
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {!isActive ? (
              <Button
                onClick={handleStart}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl py-6 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icons.play className="w-5 h-5 mr-1.5 fill-current" />
                <span className="font-bold text-base">Start Focus</span>
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl py-6 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icons.pause className="w-5 h-5 mr-1.5 fill-current" />
                <span className="font-bold text-base">Pause Focus</span>
              </Button>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleReset} variant="outline" size="icon" className="w-10 h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 text-slate-500">
                <Icons.reset className="w-4 h-4" />
              </Button>
              <Button onClick={handleSkip} variant="outline" size="icon" className="w-10 h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 text-slate-500">
                <Icons.chevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Milestone Indicator */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Daily Milestones</span>
            <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              {todaySessions} Total
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`relative flex-1 h-2 rounded-full overflow-hidden transition-all duration-500 ${i < (sessionCount % 4)
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : "bg-slate-200 dark:bg-slate-700 shadow-inner"
                  }`}
              >
                {i < (sessionCount % 4) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-50" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2 text-center uppercase tracking-widest">
            {4 - (sessionCount % 4)} sessions until long break
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
