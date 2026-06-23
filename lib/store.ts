import { create } from "zustand"

type Section = "dashboard" | "tasks" | "pomodoro" | "insights" | "settings"

interface Notification {
    id: string
    title: string
    message: string
    time: string
    isRead: boolean
    type?: "warning" | "info" | "success"
    priority?: "low" | "medium" | "high" | string
    path?: string
}

interface UIStore {
    isAIModalOpen: boolean
    isSidebarOpen: boolean
    activeSection: Section
    notifications: Notification[]

    toggleAIModal: () => void
    setAIModalOpen: (open: boolean) => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    setActiveSection: (section: Section) => void

    // Notification actions
    addNotification: (notification: Omit<Notification, "id" | "isRead">) => void
    markNotificationAsRead: (id: string) => void
    markAllNotificationsAsRead: () => void
    removeNotification: (id: string) => void
    clearNotifications: () => void
}

export const useUIStore = create<UIStore>((set) => ({
    isAIModalOpen: false,
    isSidebarOpen: false,
    activeSection: "dashboard",
    notifications: [
        {
            id: "1",
            title: "Welcome to Midori! / ようこそ",
            message: "Start by setting up your first task or pomodoro session.",
            time: new Date().toISOString(),
            isRead: false,
            path: "/dashboard/tasks",
        },
    ],

    toggleAIModal: () => set((state) => ({ isAIModalOpen: !state.isAIModalOpen })),
    setAIModalOpen: (open) => set({ isAIModalOpen: open }),

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    setActiveSection: (section) => set({ activeSection: section }),

    addNotification: (notification) =>
        set((state) => ({
            notifications: [
                {
                    ...notification,
                    id: Math.random().toString(36).substring(7),
                    isRead: false,
                },
                ...state.notifications,
            ],
        })),

    markNotificationAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        })),

    markAllNotificationsAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    clearNotifications: () => set({ notifications: [] }),
}))

export interface MusicTrack {
  name: string
  url: string
  category: "focus" | "relax" | "energy" | "nature" | "instrumental" | "zen"
  type?: "youtube" | "audio" | "synthesized"
  description?: string
  icon?: string
}

export interface AudioPreset {
  name: string
  activeMusic: MusicTrack | null
  musicVolume: number
  activeAmbients: Record<string, number>
}

interface MusicStore {
  isPlaying: boolean
  currentTrack: MusicTrack | null
  volume: number[]
  activeCategory: MusicTrack["category"] | "custom"
  recentlyPlayed: MusicTrack[]
  ambientTrack: MusicTrack | null
  isAmbientPlaying: boolean
  ambientVolume: number[]

  // Multi-sound mixer additions
  activeAmbients: Record<string, number>
  savedPresets: AudioPreset[]

  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTrack: (track: MusicTrack | null) => void
  setVolume: (volume: number[]) => void
  setActiveCategory: (category: MusicTrack["category"] | "custom") => void
  setRecentlyPlayed: (tracks: MusicTrack[] | ((prev: MusicTrack[]) => MusicTrack[])) => void
  setAmbientTrack: (track: MusicTrack | null) => void
  setIsAmbientPlaying: (isAmbientPlaying: boolean) => void
  setAmbientVolume: (volume: number[]) => void

  // Multi-sound actions
  toggleAmbient: (trackName: string, volumeDefault?: number) => void
  setAmbientVolumeSingle: (trackName: string, vol: number) => void
  clearAllAmbients: () => void
  saveAudioPreset: (name: string) => void
  loadAudioPreset: (preset: AudioPreset) => void
  deleteAudioPreset: (name: string) => void
}

export const useMusicStore = create<MusicStore>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: [50],
  activeCategory: "focus",
  recentlyPlayed: [],
  ambientTrack: null,
  isAmbientPlaying: false,
  ambientVolume: [30],

  // Initial multi-sound states
  activeAmbients: {},
  savedPresets: typeof window !== "undefined"
    ? (() => {
        try {
          const stored = localStorage.getItem("midori_audio_presets")
          return stored ? JSON.parse(stored) : []
        } catch (e) {
          return []
        }
      })()
    : [],

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setVolume: (volume) => set({ volume }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setRecentlyPlayed: (tracks) => set((state) => {
    const nextTracks = typeof tracks === "function" ? tracks(state.recentlyPlayed) : tracks
    return { recentlyPlayed: nextTracks }
  }),
  setAmbientTrack: (ambientTrack) => set({ ambientTrack }),
  setIsAmbientPlaying: (isAmbientPlaying) => set({ isAmbientPlaying }),
  setAmbientVolume: (ambientVolume) => set({ ambientVolume }),

  toggleAmbient: (trackName, volumeDefault = 30) => set((state) => {
    const next = { ...state.activeAmbients }
    if (next[trackName] !== undefined) {
      delete next[trackName]
    } else {
      next[trackName] = volumeDefault
    }
    return { activeAmbients: next }
  }),
  setAmbientVolumeSingle: (trackName, vol) => set((state) => {
    const next = { ...state.activeAmbients }
    next[trackName] = vol
    return { activeAmbients: next }
  }),
  clearAllAmbients: () => set({ activeAmbients: {} }),
  saveAudioPreset: (name) => set((state) => {
    const newPreset: AudioPreset = {
      name,
      activeMusic: state.currentTrack,
      musicVolume: state.volume[0],
      activeAmbients: state.activeAmbients
    }
    const nextPresets = [...state.savedPresets.filter(p => p.name !== name), newPreset]
    if (typeof window !== "undefined") {
      localStorage.setItem("midori_audio_presets", JSON.stringify(nextPresets))
    }
    return { savedPresets: nextPresets }
  }),
  loadAudioPreset: (preset) => set(() => {
    return {
      currentTrack: preset.activeMusic,
      isPlaying: !!preset.activeMusic,
      volume: [preset.musicVolume],
      activeAmbients: preset.activeAmbients
    }
  }),
  deleteAudioPreset: (name) => set((state) => {
    const nextPresets = state.savedPresets.filter(p => p.name !== name)
    if (typeof window !== "undefined") {
      localStorage.setItem("midori_audio_presets", JSON.stringify(nextPresets))
    }
    return { savedPresets: nextPresets }
  }),
}))

