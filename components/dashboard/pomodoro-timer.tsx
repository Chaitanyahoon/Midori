"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
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

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => { clearCurrentInterval() }
  }, [clearCurrentInterval])

  const handleTimerComplete = useCallback(() => {
    if (!isBreak && sessionStartTime) {
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

      setIsBreak(true)
      const breakDuration = newSessionCount % 4 === 0 ? 15 : 5
      setTimeLeft(breakDuration * 60)
      setSessionStartTime(null)
    } else if (isBreak) {
      const isLongBreak = sessionCount % 4 === 0
      toast({
        title: isLongBreak ? "Long break over! 💪" : "Break time over! ⚡",
        description: "Ready for another focused session?",
      })
      setIsBreak(false)
      setTimeLeft(25 * 60)
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

    return () => { clearCurrentInterval() }
  }, [isActive, timeLeft, handleTimerComplete, clearCurrentInterval])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTotalTime = () => {
    if (isBreak) return sessionCount % 4 === 0 ? 15 * 60 : 5 * 60
    return 25 * 60
  }

  const totalTime = getTotalTime()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const handleStart = () => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
  }

  const handlePause = () => { setIsActive(false) }

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
      setIsBreak(false)
      setTimeLeft(25 * 60)
    } else {
      if (sessionStartTime) {
        addPomodoro({
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: Math.round((25 * 60 - timeLeft) / 60),
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

  return (
    <Card className="relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl shadow-emerald-500/5 rounded-2xl">
      {/* Ambient radial glow when active */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: isBreak
              ? "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.09) 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.09) 0%, transparent 70%)",
          }}
        />
      )}

      <CardContent className="px-5 pt-6 pb-5 relative z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Focus Flow</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {sessionCount > 0 ? `${sessionCount} session${sessionCount > 1 ? "s" : ""} today` : "Ready to grow?"}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isBreak
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
              }`}
          >
            {isBreak ? (sessionCount % 4 === 0 ? "Long Break" : "Rest") : "Deep Work"}
          </div>
        </div>

        {/* Circular Timer */}
        <div className="flex flex-col items-center">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Slow breathing outer glow */}
            {isActive && (
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-10 ${isBreak ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                style={{ animationDuration: "3s" }}
              />
            )}

            {/* SVG Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6"
                className="text-slate-100 dark:text-slate-800" />
              {/* Progress */}
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={isBreak ? "url(#breakGrad)" : "url(#focusGrad)"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>

            {/* Frosted inner disc */}
            <div className={`absolute inset-4 rounded-full transition-colors duration-700 ${isBreak ? "bg-emerald-50/70 dark:bg-emerald-950/30" : "bg-amber-50/70 dark:bg-amber-950/30"
              }`} />

            {/* Time text */}
            <div className="relative z-10 text-center">
              <div className={`text-5xl font-black tabular-nums tracking-tighter ${isBreak ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
                }`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-1">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>

          {/* Session leaf dots */}
          <div className="flex items-center gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${i < sessionCount % 4
                    ? "bg-emerald-100 dark:bg-emerald-900/60 scale-110"
                    : "bg-slate-100 dark:bg-slate-800"
                  }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor"
                  className={`w-3.5 h-3.5 transition-colors duration-500 ${i < sessionCount % 4 ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                    }`}
                >
                  <path d="M12 19c-2.8 2-5 2.5-7 2.5.5-3 1-5.5 3-7.5-2-3.5-2-7.5-2-9.5 4.5 2 6 4 7 7 1-3 2.5-5 7-7 0 2-.5 6-2 9.5 2 2 2.5 4.5 3 7.5-2 0-4.2-.5-7-2.5" />
                </svg>
              </div>
            ))}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">
              {4 - (sessionCount % 4)} until long break
            </span>
          </div>
        </div>

        {/* Task selector */}
        {!isBreak && (
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icons.leaf className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger className="w-full pl-8 text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-emerald-500/30 h-10">
                <SelectValue placeholder="What are we growing today?" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl">
                <SelectItem value="general" className="font-medium">General Focus</SelectItem>
                {pendingTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isActive ? (
            <Button
              onClick={handleStart}
              className={`flex-1 h-11 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isBreak
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20"
                  : "bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 shadow-amber-500/20"
                }`}
            >
              <Icons.play className="w-4 h-4 mr-1.5 fill-current" />
              {isBreak ? "Start Break" : "Start Focus"}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="flex-1 h-11 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icons.pause className="w-4 h-4 mr-1.5" />
              Pause
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
            title="Reset"
          >
            <Icons.reset className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleSkip}
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
            title="Skip"
          >
            <Icons.chevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
