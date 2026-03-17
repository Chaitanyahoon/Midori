"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export interface UsePomodoroOptions {
  focusDuration?: number // in minutes
  breakDuration?: number // in minutes
  longBreakDuration?: number // in minutes
  sessionsPerLongBreak?: number
}

export function usePomodoro(options: UsePomodoroOptions = {}) {
  const {
    focusDuration = 25,
    breakDuration = 5,
    longBreakDuration = 15,
    sessionsPerLongBreak = 4,
  } = options

  // State
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [selectedTask, setSelectedTask] = useState<string>("general")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { addPomodoro, pomodoros, tasks } = useData()
  const { toast } = useToast()

  // Derived state
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCurrentInterval()
    }
  }, [clearCurrentInterval])

  // Timer logic
  const handleTimerComplete = useCallback(() => {
    if (!isBreak && sessionStartTime) {
      // Focus session completed
      addPomodoro({
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        duration: focusDuration,
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
      const isLongBreak = newSessionCount % sessionsPerLongBreak === 0
      setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60)
      setSessionStartTime(null)
    } else if (isBreak) {
      // Break completed
      const isLongBreak = sessionCount % sessionsPerLongBreak === 0
      toast({
        title: isLongBreak ? "Long break over! 💪" : "Break time over! ⚡",
        description: "Ready for another focused session?",
      })
      setIsBreak(false)
      setTimeLeft(focusDuration * 60)
    }
  }, [
    isBreak,
    sessionStartTime,
    sessionCount,
    selectedTask,
    focusDuration,
    breakDuration,
    longBreakDuration,
    sessionsPerLongBreak,
    addPomodoro,
    toast,
  ])

  // Timer interval
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

  // Utilities
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTotalTime = (): number => {
    if (isBreak) {
      const isLongBreak = sessionCount % sessionsPerLongBreak === 0
      return (isLongBreak ? longBreakDuration : breakDuration) * 60
    }
    return focusDuration * 60
  }

  const totalTime = getTotalTime()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Handlers
  const handleStart = useCallback(() => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
  }, [sessionStartTime, isBreak])

  const handlePause = useCallback(() => {
    setIsActive(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsActive(false)
    clearCurrentInterval()
    if (isBreak) {
      const isLongBreak = sessionCount % sessionsPerLongBreak === 0
      setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60)
    } else {
      setTimeLeft(focusDuration * 60)
      setSessionStartTime(null)
    }
  }, [
    isBreak,
    sessionCount,
    sessionsPerLongBreak,
    longBreakDuration,
    breakDuration,
    focusDuration,
    clearCurrentInterval,
  ])

  const handleSkip = useCallback(() => {
    setIsActive(false)
    clearCurrentInterval()
    if (isBreak) {
      setIsBreak(false)
      setTimeLeft(focusDuration * 60)
    } else {
      if (sessionStartTime) {
        addPomodoro({
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: Math.round((focusDuration * 60 - timeLeft) / 60),
          taskId: selectedTask === "general" ? undefined : selectedTask,
          completed: false,
        })
      }
      setIsBreak(true)
      const nextSessionCount = sessionCount + 1
      const isLongBreak = nextSessionCount % sessionsPerLongBreak === 0
      setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60)
      setSessionStartTime(null)
    }
  }, [
    isBreak,
    sessionCount,
    sessionStartTime,
    selectedTask,
    focusDuration,
    longBreakDuration,
    breakDuration,
    sessionsPerLongBreak,
    timeLeft,
    addPomodoro,
    clearCurrentInterval,
  ])

  return {
    // State
    timeLeft,
    isActive,
    isBreak,
    sessionCount,
    selectedTask,
    pendingTasks,
    todaySessions,

    // Derived state
    progress,
    totalTime,

    // Utilities
    formatTime,

    // Handlers
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
    setSelectedTask,
  }
}
