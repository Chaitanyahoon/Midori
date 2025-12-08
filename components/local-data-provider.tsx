"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: "work" | "personal" | "learning" | "health"
  createdAt: string
  completedAt?: string
  dueDate?: string
  recurrence?: "none" | "daily" | "weekly" | "monthly"
}

export interface PomodoroSession {
  id: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  taskId?: string
  completed: boolean
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  totalPomodoros: number
  totalFocusTime: number // in minutes
  streak: number
  lastActiveDate: string
}

export interface UserSettings {
  userName: string | null
  userTone: string | null // 'casual', 'formal', 'energetic', 'calm'
  dailyGoalTasks: number
  dailyGoalPomodoros: number
  dailyGoalHours: number
}

export interface CustomTrack {
  id: string
  name: string
  url: string
  category: "focus" | "relax" | "energy" | "nature" | "instrumental"
  addedAt: string
}

interface DataContextType {
  tasks: Task[]
  pomodoros: PomodoroSession[]
  stats: UserStats
  settings: UserSettings
  customTracks: CustomTrack[]
  loading: boolean

  // Actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  addPomodoro: (pomodoro: Omit<PomodoroSession, "id">) => void

  updateSettings: (updates: Partial<UserSettings>) => void
  addCustomTrack: (track: Omit<CustomTrack, "id" | "addedAt">) => void
  removeCustomTrack: (id: string) => void

  refreshData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9)

const DEFAULT_SETTINGS: UserSettings = {
  userName: null,
  userTone: "casual",
  dailyGoalTasks: 3,
  dailyGoalPomodoros: 4,
  dailyGoalHours: 2,
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalPomodoros: 0,
    totalFocusTime: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
  })
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadLocalData()
      setLoading(false)
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      saveLocalData()
      updateStats()
    }
  }, [tasks, pomodoros, settings, customTracks, loading])

  const loadLocalData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const savedTasks = localStorage.getItem("planthesia_tasks")
      const savedPomodoros = localStorage.getItem("planthesia_pomodoros")
      const savedStats = localStorage.getItem("planthesia_stats")
      const savedSettings = localStorage.getItem("planthesia_settings")
      const savedCustomTracks = localStorage.getItem("planthesia_custom_tracks")

      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        setTasks(Array.isArray(parsedTasks) ? parsedTasks : [])
      }
      if (savedPomodoros) {
        const parsedPomodoros = JSON.parse(savedPomodoros)
        setPomodoros(Array.isArray(parsedPomodoros) ? parsedPomodoros : [])
      }
      if (savedStats) {
        setStats(JSON.parse(savedStats))
      }
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      } else {
        // Migration for legacy user/tone
        const legacyUser = localStorage.getItem("planthesia_user")
        const legacyTone = localStorage.getItem("planthesia_userTone")
        if (legacyUser || legacyTone) {
          setSettings(prev => ({
            ...prev,
            userName: legacyUser || prev.userName,
            userTone: legacyTone || prev.userTone
          }))
        }
      }

      if (savedCustomTracks) {
        setCustomTracks(JSON.parse(savedCustomTracks))
      }

    } catch (error) {
      console.error("Error loading local data:", error)
      // Reset to defaults/empty if corrupted
      setTasks([])
      setPomodoros([])
    }
  }, [])

  const saveLocalData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem("planthesia_tasks", JSON.stringify(tasks))
      localStorage.setItem("planthesia_pomodoros", JSON.stringify(pomodoros))
      localStorage.setItem("planthesia_stats", JSON.stringify(stats))
      localStorage.setItem("planthesia_settings", JSON.stringify(settings))
      localStorage.setItem("planthesia_custom_tracks", JSON.stringify(customTracks))
    } catch (error) {
      console.error("Error saving local data:", error)
    }
  }, [tasks, pomodoros, stats, settings, customTracks])

  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updates }
          if (updates.completed && !task.completed) {
            updatedTask.completedAt = new Date().toISOString()
          } else if (updates.completed === false && task.completed) {
            updatedTask.completedAt = undefined
          }
          return updatedTask
        }
        return task
      }),
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const addPomodoro = useCallback((pomodoroData: Omit<PomodoroSession, "id">) => {
    const newPomodoro: PomodoroSession = {
      ...pomodoroData,
      id: generateId(),
    }
    setPomodoros((prev) => [newPomodoro, ...prev])
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const addCustomTrack = useCallback((trackData: Omit<CustomTrack, "id" | "addedAt">) => {
    const newTrack: CustomTrack = {
      ...trackData,
      id: generateId(),
      addedAt: new Date().toISOString(),
    }
    setCustomTracks((prev) => [newTrack, ...prev])
  }, [])

  const removeCustomTrack = useCallback((id: string) => {
    setCustomTracks((prev) => prev.filter(t => t.id !== id))
  }, [])

  const updateStats = useCallback(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    const totalPomodoros = pomodoros.filter((p) => p.completed).length
    const totalFocusTime = pomodoros.reduce((sum, p) => sum + (p.completed ? p.duration : 0), 0)

    const today = new Date().toISOString().split("T")[0]

    // Calculate streak
    let currentStreak = 0
    const currentDate = new Date()

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
      const checkDate = new Date(currentDate)
      checkDate.setDate(currentDate.getDate() - i)
      const dateString = checkDate.toISOString().split("T")[0]

      const dayTasks = tasks.filter((t) => t.completedAt && t.completedAt.split("T")[0] === dateString).length
      const dayPomodoros = pomodoros.filter((p) => p.completed && p.startTime.split("T")[0] === dateString).length

      if (dayTasks > 0 || dayPomodoros > 0) {
        currentStreak++
      } else {
        break
      }
    }

    const newStats: UserStats = {
      totalTasks,
      completedTasks,
      totalPomodoros,
      totalFocusTime,
      streak: currentStreak,
      lastActiveDate: today,
    }

    setStats(newStats)
  }, [tasks, pomodoros])

  const refreshData = useCallback(() => {
    loadLocalData()
  }, [loadLocalData])

  return (
    <DataContext.Provider
      value={{
        tasks,
        pomodoros,
        stats,
        settings,
        customTracks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        addPomodoro,
        updateSettings,
        addCustomTrack,
        removeCustomTrack,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
