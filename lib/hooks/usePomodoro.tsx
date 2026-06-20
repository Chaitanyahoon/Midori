"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"
import { firePomodoroConfetti } from "@/lib/confetti"
import { playPomodoroComplete, playUnlock } from "@/lib/sounds"

export interface PomodoroSettings {
  focusTime: number
  shortBreak: number
  longBreak: number
  sessionsUntilLongBreak: number
}

interface PomodoroContextType {
  // Timer state
  timeLeft: number
  isActive: boolean
  isBreak: boolean
  sessionStartTime: string | null
  selectedTask: string
  sessionNote: string

  // Settings
  settings: PomodoroSettings
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  focusGoal: number

  // Derived state
  pendingTasks: any[]
  todaySessions: any[]
  completedSessionsToday: number
  sessionCount: number
  isLongBreakTime: boolean
  progress: number
  totalTime: number

  // Handlers & Setters
  handleStart: () => void
  handlePause: () => void
  handleReset: () => void
  handleSkip: () => void
  setSelectedTask: (taskId: string) => void
  setSessionNote: (note: string) => void
  updateTimerSettings: (updates: Partial<PomodoroSettings>) => void
  setAutoStartBreaks: (val: boolean) => void
  setAutoStartPomodoros: (val: boolean) => void
  setSoundEnabled: (val: boolean) => void
  setFocusGoal: (val: number) => void
  formatTime: (seconds: number) => string
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { addPomodoro, pomodoros, tasks } = useData()
  const { toast } = useToast()

  // Durations & Configurations
  const [settings, setSettings] = useState<PomodoroSettings>({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  })
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [focusGoal, setFocusGoal] = useState(4)

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string>("general")
  const [sessionNote, setSessionNote] = useState("")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize start chime Audio on mount client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      startAudioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZVA4PVK3l77FbGAg+ltryy3kpBSl+zfLZiTYIG2m98OScTgwOUKjk8LZjGwY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVQOD1St5e+xWxgIPpba8st5KQUpfs3y2Yk2CBtpvfDknE4MDlCo5PC2YxsGOJHX8sx5LAUkd8fw3ZBACg=="
      )
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodoroSettings")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const loadedSettings = parsed.settings || {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsUntilLongBreak: 4,
          }
          setSettings(loadedSettings)
          setAutoStartBreaks(parsed.autoStartBreaks || false)
          setAutoStartPomodoros(parsed.autoStartPomodoros || false)
          setSoundEnabled(parsed.soundEnabled !== false)
          setFocusGoal(parsed.focusGoal || 4)
          setTimeLeft(loadedSettings.focusTime * 60)
        } catch (e) {}
      }
    }
  }, [])

  // Save settings when modified
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "pomodoroSettings",
        JSON.stringify({
          settings,
          autoStartBreaks,
          autoStartPomodoros,
          soundEnabled,
          focusGoal,
        })
      )
    }
  }, [settings, autoStartBreaks, autoStartPomodoros, soundEnabled, focusGoal])

  // Derived state
  const pendingTasks = tasks.filter((task) => !task.completed)
  const todaySessions = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime && session.startTime.split("T")[0] === today && session.completed
  })
  const completedSessionsToday = todaySessions.length
  const isLongBreakTime = completedSessionsToday > 0 && completedSessionsToday % settings.sessionsUntilLongBreak === 0

  const getCurrentSessionDuration = useCallback(() => {
    if (isBreak) {
      return isLongBreakTime ? settings.longBreak * 60 : settings.shortBreak * 60
    }
    return settings.focusTime * 60
  }, [isBreak, isLongBreakTime, settings])

  const totalTime = getCurrentSessionDuration()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Encourage functions
  const getCompliment = () => {
    const compliments = [
      "Good work, sunshine!",
      "You're doing amazing, champ!",
      "Keep it up, superstar!",
      "You're on fire today!",
      "Fantastic work, rockstar!",
      "You're crushing it!",
      "Amazing progress, warrior!",
      "You're unstoppable!",
      "Brilliant work, champion!",
      "You're a productivity machine!",
      "Outstanding effort, hero!",
      "You're absolutely killing it!",
    ]
    return compliments[Math.floor(Math.random() * compliments.length)]
  }

  const getSessionCompliment = (sessionCount: number) => {
    if (sessionCount >= 8) return "Incredible! You're a focus master!"
    if (sessionCount >= 6) return "Outstanding dedication today!"
    if (sessionCount >= 4) return "Great momentum, keep going!"
    if (sessionCount >= 2) return "Nice progress, you're building a great habit!"
    return "Great start! Every session counts!"
  }

  // Timer complete logic
  const handleTimerComplete = useCallback(() => {
    if (!isBreak && sessionStartTime) {
      // Focus session completed
      addPomodoro({
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        duration: settings.focusTime,
        taskId: selectedTask === "general" ? undefined : selectedTask,
        completed: true,
      })

      if (soundEnabled) {
        playPomodoroComplete()
      }
      firePomodoroConfetti()

      const newSessionCount = completedSessionsToday + 1
      toast({
        title: `${getCompliment()} 🌟`,
        description: `${getSessionCompliment(newSessionCount)} You've completed ${newSessionCount} ${newSessionCount === 1 ? 'session' : 'sessions'} today.`,
      })

      setIsBreak(true)
      const isNextLongBreak = newSessionCount > 0 && newSessionCount % settings.sessionsUntilLongBreak === 0
      const breakDuration = isNextLongBreak ? settings.longBreak : settings.shortBreak
      setTimeLeft(breakDuration * 60)
      setSessionNote("")

      if (autoStartBreaks) {
        setTimeout(() => {
          setIsActive(true)
        }, 1000)
      }
    } else if (isBreak) {
      // Break completed
      if (soundEnabled) {
        playUnlock()
      }

      const breakCompliments = [
        "You've earned this break!",
        "Well-deserved rest!",
        "Time to recharge and shine!",
        "You're building great habits!",
      ]
      toast({
        title: isLongBreakTime ? "Long break complete! 💪" : "Break complete! ⚡",
        description: `${breakCompliments[Math.floor(Math.random() * breakCompliments.length)]} Ready for another focused session?`,
      })

      setIsBreak(false)
      setTimeLeft(settings.focusTime * 60)

      if (autoStartPomodoros) {
        setTimeout(() => {
          setSessionStartTime(new Date().toISOString())
          setIsActive(true)
        }, 1000)
      }
    }
    setSessionStartTime(null)
  }, [
    isBreak,
    sessionStartTime,
    settings,
    selectedTask,
    soundEnabled,
    completedSessionsToday,
    autoStartBreaks,
    autoStartPomodoros,
    isLongBreakTime,
    addPomodoro,
    toast,
  ])

  // Mutable ref to always read latest timer complete logic in interval
  const handleTimerCompleteRef = useRef(handleTimerComplete)
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete
  })

  // Timer Tick Interval
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false)
            // Execute timer complete on next tick
            setTimeout(() => {
              handleTimerCompleteRef.current()
            }, 0)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive])

  // Actions
  const handleStart = useCallback(() => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
    if (soundEnabled && !isBreak && startAudioRef.current) {
      startAudioRef.current.volume = 0.2
      startAudioRef.current.currentTime = 0
      startAudioRef.current.play().catch(() => {})
    }
  }, [sessionStartTime, isBreak, soundEnabled])

  const handlePause = useCallback(() => {
    setIsActive(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimeLeft(getCurrentSessionDuration())
    setSessionStartTime(null)
  }, [getCurrentSessionDuration])

  const handleSkip = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (isBreak) {
      setIsBreak(false)
      setTimeLeft(settings.focusTime * 60)
      toast({
        title: "Break skipped! ⚡",
        description: "Back to focus mode.",
      })
    } else {
      if (sessionStartTime) {
        addPomodoro({
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: Math.round((settings.focusTime * 60 - timeLeft) / 60),
          taskId: selectedTask === "general" ? undefined : selectedTask,
          completed: false,
        })
      }
      setIsBreak(true)
      const nextSessionCount = completedSessionsToday + 1
      const isNextLongBreak = nextSessionCount > 0 && nextSessionCount % settings.sessionsUntilLongBreak === 0
      const breakDuration = isNextLongBreak ? settings.longBreak : settings.shortBreak
      setTimeLeft(breakDuration * 60)
      setSessionNote("")
      toast({
        title: "Focus session skipped! ⏭️",
        description: "Moving to break time.",
      })
    }
    setSessionStartTime(null)
  }, [
    isBreak,
    settings,
    sessionStartTime,
    timeLeft,
    selectedTask,
    completedSessionsToday,
    addPomodoro,
    toast,
  ])

  const updateTimerSettings = useCallback((updates: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      if (!isActive) {
        if (!isBreak && updates.focusTime !== undefined) {
          setTimeLeft(updates.focusTime * 60)
        } else if (isBreak) {
          const isNextLongBreak = completedSessionsToday > 0 && completedSessionsToday % next.sessionsUntilLongBreak === 0
          if (isNextLongBreak && updates.longBreak !== undefined) {
            setTimeLeft(updates.longBreak * 60)
          } else if (!isNextLongBreak && updates.shortBreak !== undefined) {
            setTimeLeft(updates.shortBreak * 60)
          }
        }
      }
      return next
    })
  }, [isActive, isBreak, completedSessionsToday])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const value = {
    timeLeft,
    isActive,
    isBreak,
    sessionStartTime,
    selectedTask,
    sessionNote,
    settings,
    autoStartBreaks,
    autoStartPomodoros,
    soundEnabled,
    focusGoal,
    pendingTasks,
    todaySessions,
    completedSessionsToday,
    sessionCount: completedSessionsToday,
    isLongBreakTime,
    progress,
    totalTime,
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
    setSelectedTask,
    setSessionNote,
    updateTimerSettings,
    setAutoStartBreaks,
    setAutoStartPomodoros,
    setSoundEnabled,
    setFocusGoal,
    formatTime,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}
