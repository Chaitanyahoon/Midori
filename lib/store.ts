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

    clearNotifications: () => set({ notifications: [] }),
}))

export interface MusicTrack {
  name: string
  url: string
  category: "focus" | "relax" | "energy" | "nature" | "instrumental" | "zen"
  type?: "youtube" | "audio"
  description?: string
  icon?: string
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

  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTrack: (track: MusicTrack | null) => void
  setVolume: (volume: number[]) => void
  setActiveCategory: (category: MusicTrack["category"] | "custom") => void
  setRecentlyPlayed: (tracks: MusicTrack[] | ((prev: MusicTrack[]) => MusicTrack[])) => void
  setAmbientTrack: (track: MusicTrack | null) => void
  setIsAmbientPlaying: (isAmbientPlaying: boolean) => void
  setAmbientVolume: (volume: number[]) => void
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
}))

