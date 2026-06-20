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
  scheduledTime?: string
  recurrence?: {
    type: "none" | "daily" | "weekly" | "biweekly" | "monthly" | "custom"
    interval?: number
    dayOfMonth?: number
    endDate?: string
    maxOccurrences?: number
  }
  parentTaskId?: string
  subtasks?: { id: string; title: string; completed: boolean }[]
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

export interface SharedGarden {
  id: string
  name: string
  sunlightPool: number
  waterPool: number
  plants: any[]
}

export interface UserSettings {
  userName: string | null
  userTone: string | null
  aiStyle: string | null
  notifications: string | null
  dailyGoalTasks: number
  dailyGoalPomodoros: number
  dailyGoalHours: number
  sunlight: number
  waterdrops: number
  gardenPlants?: any[]
  activeSharedGardenId?: string | null
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
  sharedGarden: SharedGarden | null
  updateSharedGarden: (updates: Partial<SharedGarden>) => Promise<void>
  joinSharedGarden: (gardenId: string) => Promise<void>
  createSharedGarden: (name: string) => Promise<string>
  refreshData: () => void
  exportData: () => Promise<string | null>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const DEFAULT_SETTINGS: UserSettings = {
  userName: null,
  userTone: "casual",
  aiStyle: "balanced",
  notifications: "frequent",
  dailyGoalTasks: 3,
  dailyGoalPomodoros: 4,
  dailyGoalHours: 2,
  sunlight: 0,
  waterdrops: 0,
  activeSharedGardenId: null,
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>([])
  const [sharedGarden, setSharedGarden] = useState<SharedGarden | null>(null)
  const [loading, setLoading] = useState(true)

  // Real-time listeners for Firestore collections
  useEffect(() => {
    if (!uid) { setLoading(false); return }
    if (!db) {
      console.warn("[DataProvider] Firestore `db` is null — Falling back to localStorage.")
      try {
        const storedTasks = localStorage.getItem(`midori_tasks_${uid}`)
        const storedPomodoros = localStorage.getItem(`midori_pomodoros_${uid}`)
        const storedSettings = localStorage.getItem(`midori_settings_${uid}`)
        const storedCustomTracks = localStorage.getItem(`midori_customTracks_${uid}`)

        if (storedTasks) setTasks(JSON.parse(storedTasks))
        if (storedPomodoros) setPomodoros(JSON.parse(storedPomodoros))
        if (storedSettings) setSettings(JSON.parse(storedSettings))
        if (storedCustomTracks) setCustomTracks(JSON.parse(storedCustomTracks))
      } catch (err) {
        console.error("[DataProvider] Failed to load from localStorage:", err)
      }
      setLoading(false)
      return
    }
    setLoading(true)

    const unsubs: (() => void)[] = []
    let loadedCount = 0
    const totalListeners = 4

    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount >= totalListeners) setLoading(false)
    }

    // Tasks
    unsubs.push(onSnapshot(collection(db, "users", uid, "tasks"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
      setTasks(list)
      try { localStorage.setItem(`midori_tasks_${uid}`, JSON.stringify(list)) } catch (e) {}
      checkAllLoaded()
    }, (error) => {
      console.error("[DataProvider] Tasks listener error:", error.code, error.message)
      checkAllLoaded()
    }))

    // Pomodoros
    unsubs.push(onSnapshot(collection(db, "users", uid, "pomodoros"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PomodoroSession))
      setPomodoros(list)
      try { localStorage.setItem(`midori_pomodoros_${uid}`, JSON.stringify(list)) } catch (e) {}
      checkAllLoaded()
    }, (error) => {
      console.error("[DataProvider] Pomodoros listener error:", error.code, error.message)
      checkAllLoaded()
    }))

    // Settings (single doc)
    unsubs.push(onSnapshot(doc(db, "users", uid, "meta", "settings"), (snap) => {
      if (snap.exists()) {
        const data = { ...DEFAULT_SETTINGS, ...snap.data() as UserSettings }
        setSettings(data)
        try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(data)) } catch (e) {}
      }
      checkAllLoaded()
    }, (error) => {
      console.error("[DataProvider] Settings listener error:", error.code, error.message)
      checkAllLoaded()
    }))

    // Custom tracks
    unsubs.push(onSnapshot(collection(db, "users", uid, "customTracks"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomTrack))
      setCustomTracks(list)
      try { localStorage.setItem(`midori_customTracks_${uid}`, JSON.stringify(list)) } catch (e) {}
      checkAllLoaded()
    }, (error) => {
      console.error("[DataProvider] CustomTracks listener error:", error.code, error.message)
      checkAllLoaded()
    }))

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
    const newTask = {
      ...taskData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    }
    const applyLocalAdd = () => {
      setTasks(prev => {
        const next = [...prev, newTask]
        try { localStorage.setItem(`midori_tasks_${uid}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
    }
    if (!db) {
      applyLocalAdd()
      return
    }
    try {
      await addDoc(collection(db, "users", uid, "tasks"), {
        ...taskData,
        createdAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error("Failed to add task:", e)
      applyLocalAdd()
    }
  }, [uid])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!uid) return
    const applyLocalUpdate = () => {
      setTasks(prev => {
        const next = prev.map(t => {
          if (t.id === id) {
            if (updates.completed === true && t.completed !== true) {
              setSettings(s => {
                const newSunlight = (s.sunlight || 0) + 10
                const nextSettings = { ...s, sunlight: newSunlight }
                try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(nextSettings)) } catch (e) {}
                
                if (s.activeSharedGardenId) {
                  try {
                    const storedG = localStorage.getItem(`midori_shared_garden_${s.activeSharedGardenId}`)
                    const gData = storedG ? JSON.parse(storedG) : { sunlightPool: 0, waterPool: 0, plants: [] }
                    const nextG = {
                      ...gData,
                      sunlightPool: (gData.sunlightPool || 0) + 5
                    }
                    localStorage.setItem(`midori_shared_garden_${s.activeSharedGardenId}`, JSON.stringify(nextG))
                    setSharedGarden(prevG => prevG && prevG.id === s.activeSharedGardenId ? nextG : prevG)
                  } catch (e) {}
                }
                return nextSettings
              })
            }
            const completedAt = updates.completed === true ? new Date().toISOString() : (updates.completed === false ? undefined : t.completedAt)
            return { ...t, ...updates, completedAt }
          }
          return t
        })
        try { localStorage.setItem(`midori_tasks_${uid}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
    }
    if (!db) {
      applyLocalUpdate()
      return
    }
    try {
      const ref = doc(db, "users", uid, "tasks", id)
      const extra: Partial<Task> = {}
      if (updates.completed === true) {
          extra.completedAt = new Date().toISOString()
          setSettings(prev => {
              const newSunlight = (prev.sunlight || 0) + 10
              updateDoc(doc(db, "users", uid, "meta", "settings"), { sunlight: newSunlight }).catch(() => {})
              
              // Pool sunlight for shared garden
              if (prev.activeSharedGardenId) {
                 getDoc(doc(db, "shared_gardens", prev.activeSharedGardenId)).then(snap => {
                   if (snap.exists()) {
                     const gData = snap.data()
                     updateDoc(doc(db, "shared_gardens", prev.activeSharedGardenId!), {
                       sunlightPool: (gData.sunlightPool || 0) + 5
                     })
                   }
                 })
              }

              const nextSettings = { ...prev, sunlight: newSunlight }
              try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(nextSettings)) } catch (e) {}
              return nextSettings
          })
      }
      if (updates.completed === false) extra.completedAt = undefined
      await updateDoc(ref, { ...updates, ...extra })
    } catch (e) {
      console.error("Failed to update task:", e)
      applyLocalUpdate()
    }
  }, [uid])

  const deleteTask = useCallback(async (id: string) => {
    if (!uid) return
    const applyLocalDelete = () => {
      setTasks(prev => {
        const next = prev.filter(t => t.id !== id)
        try { localStorage.setItem(`midori_tasks_${uid}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
    }
    if (!db) {
      applyLocalDelete()
      return
    }
    try {
      await deleteDoc(doc(db, "users", uid, "tasks", id))
    } catch (e) {
      console.error("Failed to delete task:", e)
      applyLocalDelete()
    }
  }, [uid])

  const addPomodoro = useCallback(async (pomodoroData: Omit<PomodoroSession, "id">) => {
    if (!uid) return
    const newSession = {
      ...pomodoroData,
      id: Math.random().toString(36).substring(7),
    }
    const applyLocalAdd = () => {
      setPomodoros(prev => {
        const next = [...prev, newSession]
        try { localStorage.setItem(`midori_pomodoros_${uid}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
      if (pomodoroData.completed) {
        setSettings(prev => {
          const earned = Math.floor(pomodoroData.duration / 60) || 1
          const newWaterdrops = (prev.waterdrops || 0) + earned
          const nextSettings = { ...prev, waterdrops: newWaterdrops }
          try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(nextSettings)) } catch (e) {}
          
          if (prev.activeSharedGardenId) {
            try {
              const storedG = localStorage.getItem(`midori_shared_garden_${prev.activeSharedGardenId}`)
              const gData = storedG ? JSON.parse(storedG) : { sunlightPool: 0, waterPool: 0, plants: [] }
              const nextG = {
                ...gData,
                waterPool: (gData.waterPool || 0) + earned
              }
              localStorage.setItem(`midori_shared_garden_${prev.activeSharedGardenId}`, JSON.stringify(nextG))
              setSharedGarden(prevG => prevG && prevG.id === prev.activeSharedGardenId ? nextG : prevG)
            } catch (e) {}
          }
          return nextSettings
        })
      }
    }
    if (!db) {
      applyLocalAdd()
      return
    }
    try {
      await addDoc(collection(db, "users", uid, "pomodoros"), pomodoroData)
      
      // Award waterdrops if completed
      if (pomodoroData.completed) {
        setSettings(prev => {
          const earned = Math.floor(pomodoroData.duration / 60) || 1
          const newWaterdrops = (prev.waterdrops || 0) + earned
          updateDoc(doc(db, "users", uid, "meta", "settings"), { waterdrops: newWaterdrops }).catch(() => {})
          
          // Pool water for shared garden
          if (prev.activeSharedGardenId) {
              getDoc(doc(db, "shared_gardens", prev.activeSharedGardenId)).then(snap => {
                if (snap.exists()) {
                  const gData = snap.data()
                  updateDoc(doc(db, "shared_gardens", prev.activeSharedGardenId!), {
                    waterPool: (gData.waterPool || 0) + earned
                  })
                }
              })
          }
           
          const nextSettings = { ...prev, waterdrops: newWaterdrops }
          try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(nextSettings)) } catch (e) {}
          return nextSettings
        })
      }
    } catch (e) {
      console.error("Failed to add pomodoro:", e)
      applyLocalAdd()
    }
  }, [uid])

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!uid) return
    const applyLocalSettings = () => {
      setSettings(prev => {
        const next = { ...prev, ...updates }
        try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
    }
    if (!db) {
      applyLocalSettings()
      return
    }
    try {
      const ref = doc(db, "users", uid, "meta", "settings")
      const snap = await getDoc(ref)
      if (snap.exists()) {
        await updateDoc(ref, updates)
      } else {
        await setDoc(ref, { ...DEFAULT_SETTINGS, ...updates })
      }
      setSettings(prev => {
        const next = { ...prev, ...updates }
        try { localStorage.setItem(`midori_settings_${uid}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
    } catch (e) {
      console.error("Failed to update settings:", e)
      applyLocalSettings()
    }
  }, [uid])

  const addCustomTrack = useCallback(async (trackData: Omit<CustomTrack, "id" | "addedAt">) => {
    if (!uid) return
    try {
      await addDoc(collection(db, "users", uid, "customTracks"), {
        ...trackData,
        addedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error("Failed to add custom track:", e)
    }
  }, [uid])

  const removeCustomTrack = useCallback(async (id: string) => {
    if (!uid) return
    try {
      await deleteDoc(doc(db, "users", uid, "customTracks", id))
    } catch (e) {
      console.error("Failed to remove custom track:", e)
    }
  }, [uid])

  const updateSharedGarden = useCallback(async (updates: Partial<SharedGarden>) => {
    if (!settings.activeSharedGardenId) return
    if (!db) {
      setSharedGarden(prev => {
        if (!prev) return null
        const next = { ...prev, ...updates }
        try {
          localStorage.setItem(`midori_shared_garden_${settings.activeSharedGardenId}`, JSON.stringify(next))
        } catch (e) {}
        return next
      })
      return
    }
    await updateDoc(doc(db, "shared_gardens", settings.activeSharedGardenId), updates)
  }, [settings.activeSharedGardenId])

  const joinSharedGarden = useCallback(async (gardenId: string) => {
    if (!uid) return
    if (!db) {
      let gardenData = null
      try {
        const stored = localStorage.getItem(`midori_shared_garden_${gardenId}`)
        if (stored) {
          gardenData = JSON.parse(stored)
        } else {
          gardenData = {
            id: gardenId,
            name: `Co-op Garden ${gardenId}`,
            sunlightPool: 25,
            waterPool: 15,
            plants: []
          }
          localStorage.setItem(`midori_shared_garden_${gardenId}`, JSON.stringify(gardenData))
        }
      } catch (e) {}
      await updateSettings({ activeSharedGardenId: gardenId })
      return
    }
    const ref = doc(db, "shared_gardens", gardenId)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new Error("Garden not found")
    await updateSettings({ activeSharedGardenId: gardenId })
  }, [uid, updateSettings])

  const createSharedGarden = useCallback(async (name: string) => {
    if (!uid) return ""
    const gardenId = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newGarden = {
      id: gardenId,
      name,
      sunlightPool: 0,
      waterPool: 0,
      plants: []
    }
    if (!db) {
      try {
        localStorage.setItem(`midori_shared_garden_${gardenId}`, JSON.stringify(newGarden))
      } catch (e) {}
      await updateSettings({ activeSharedGardenId: gardenId })
      return gardenId
    }
    await setDoc(doc(db, "shared_gardens", gardenId), newGarden)
    await updateSettings({ activeSharedGardenId: gardenId })
    return gardenId
  }, [uid, updateSettings])

  // Shared Garden Listener
  useEffect(() => {
    if (!settings.activeSharedGardenId) {
      setSharedGarden(null)
      return
    }
    if (!db) {
      try {
        const stored = localStorage.getItem(`midori_shared_garden_${settings.activeSharedGardenId}`)
        if (stored) {
          setSharedGarden(JSON.parse(stored))
        } else {
          const mockGarden = {
            id: settings.activeSharedGardenId,
            name: `Co-op Garden ${settings.activeSharedGardenId}`,
            sunlightPool: 25,
            waterPool: 15,
            plants: []
          }
          setSharedGarden(mockGarden)
          localStorage.setItem(`midori_shared_garden_${settings.activeSharedGardenId}`, JSON.stringify(mockGarden))
        }
      } catch (e) {}
      return
    }
    const unsub = onSnapshot(doc(db, "shared_gardens", settings.activeSharedGardenId), (docSnap) => {
      if (docSnap.exists()) {
        setSharedGarden(docSnap.data() as SharedGarden)
      } else {
        setSharedGarden(null)
        updateSettings({ activeSharedGardenId: null })
      }
    })
    return () => unsub()
  }, [settings.activeSharedGardenId, updateSettings])

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
    updateSettings, addCustomTrack, removeCustomTrack,
    sharedGarden, updateSharedGarden, joinSharedGarden, createSharedGarden,
    refreshData, exportData
  }), [tasks, pomodoros, stats, settings, customTracks, loading,
    addTask, updateTask, deleteTask, addPomodoro,
    updateSettings, addCustomTrack, removeCustomTrack,
    sharedGarden, updateSharedGarden, joinSharedGarden, createSharedGarden,
    refreshData, exportData])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within a DataProvider")
  return ctx
}
