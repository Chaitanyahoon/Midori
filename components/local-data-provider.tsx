"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, addDoc, getDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { useAuth } from "@/components/auth-provider"

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
}

export interface PomodoroSession {
  id: string
  startTime: string
  endTime?: string
  duration: number
  taskId?: string
  completed: boolean
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  totalPomodoros: number
  totalFocusTime: number
  streak: number
  lastActiveDate: string
}

export interface UserSettings {
  userName: string | null
  userTone: string | null
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
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addPomodoro: (pomodoro: Omit<PomodoroSession, "id">) => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  addCustomTrack: (track: Omit<CustomTrack, "id" | "addedAt">) => Promise<void>
  removeCustomTrack: (id: string) => Promise<void>
  refreshData: () => void
  exportData: () => Promise<string | null>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const DEFAULT_SETTINGS: UserSettings = {
  userName: null,
  userTone: "casual",
  dailyGoalTasks: 3,
  dailyGoalPomodoros: 4,
  dailyGoalHours: 2,
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time listeners for Firestore collections
  useEffect(() => {
    if (!uid) { setLoading(false); return }
    setLoading(true)

    const unsubs: (() => void)[] = []

    // Tasks
    unsubs.push(onSnapshot(collection(db, "users", uid, "tasks"), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)))
    }))

    // Pomodoros
    unsubs.push(onSnapshot(collection(db, "users", uid, "pomodoros"), (snap) => {
      setPomodoros(snap.docs.map(d => ({ id: d.id, ...d.data() } as PomodoroSession)))
    }))

    // Settings (single doc)
    unsubs.push(onSnapshot(doc(db, "users", uid, "meta", "settings"), (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snap.data() as UserSettings })
      }
    }))

    // Custom tracks
    unsubs.push(onSnapshot(collection(db, "users", uid, "customTracks"), (snap) => {
      setCustomTracks(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomTrack)))
    }))

    setLoading(false)
    return () => unsubs.forEach(u => u())
  }, [uid])

  // Derived stats
  const stats = useMemo((): UserStats => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const totalPomodoros = pomodoros.filter(p => p.completed).length
    const totalFocusTime = pomodoros.reduce((s, p) => s + (p.completed ? p.duration : 0), 0)

    const today = new Date().toISOString().split("T")[0]
    let streak = 0
    const now = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const hasActivity =
        tasks.some(t => t.completedAt?.startsWith(dateStr)) ||
        pomodoros.some(p => p.completed && p.startTime.startsWith(dateStr))
      if (hasActivity) streak++
      else break
    }

    return { totalTasks, completedTasks, totalPomodoros, totalFocusTime, streak, lastActiveDate: today }
  }, [tasks, pomodoros])

  const addTask = useCallback(async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!uid) return
    await addDoc(collection(db, "users", uid, "tasks"), {
      ...taskData,
      createdAt: new Date().toISOString(),
    })
  }, [uid])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!uid) return
    const ref = doc(db, "users", uid, "tasks", id)
    const extra: Partial<Task> = {}
    if (updates.completed === true) extra.completedAt = new Date().toISOString()
    if (updates.completed === false) extra.completedAt = undefined
    await updateDoc(ref, { ...updates, ...extra })
  }, [uid])

  const deleteTask = useCallback(async (id: string) => {
    if (!uid) return
    await deleteDoc(doc(db, "users", uid, "tasks", id))
  }, [uid])

  const addPomodoro = useCallback(async (pomodoroData: Omit<PomodoroSession, "id">) => {
    if (!uid) return
    await addDoc(collection(db, "users", uid, "pomodoros"), pomodoroData)
  }, [uid])

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!uid) return
    const ref = doc(db, "users", uid, "meta", "settings")
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, updates)
    } else {
      await setDoc(ref, { ...DEFAULT_SETTINGS, ...updates })
    }
    setSettings(prev => ({ ...prev, ...updates }))
  }, [uid])

  const addCustomTrack = useCallback(async (trackData: Omit<CustomTrack, "id" | "addedAt">) => {
    if (!uid) return
    await addDoc(collection(db, "users", uid, "customTracks"), {
      ...trackData,
      addedAt: new Date().toISOString(),
    })
  }, [uid])

  const removeCustomTrack = useCallback(async (id: string) => {
    if (!uid) return
    await deleteDoc(doc(db, "users", uid, "customTracks", id))
  }, [uid])

  const refreshData = useCallback(() => {
    // Real-time listeners handle updates automatically
  }, [])

  const exportData = useCallback(async () => {
    if (!uid) return null
    try {
      const exportObject = {
        meta: {
          exportedAt: new Date().toISOString(),
          app: "Planthesia",
          version: "1.0"
        },
        settings,
        stats,
        collections: {
          tasks,
          pomodoros,
          customTracks
        }
      }
      return JSON.stringify(exportObject, null, 2)
    } catch (e) {
      console.error("Failed to export data", e)
      return null
    }
  }, [uid, settings, stats, tasks, pomodoros, customTracks])

  const value = useMemo(() => ({
    tasks, pomodoros, stats, settings, customTracks, loading,
    addTask, updateTask, deleteTask, addPomodoro,
    updateSettings, addCustomTrack, removeCustomTrack, refreshData, exportData
  }), [tasks, pomodoros, stats, settings, customTracks, loading,
    addTask, updateTask, deleteTask, addPomodoro,
    updateSettings, addCustomTrack, removeCustomTrack, refreshData, exportData])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within a DataProvider")
  return ctx
}
