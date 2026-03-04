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
            title: "Welcome to Planthesia!",
            message: "Start by setting up your first task or pomodoro session.",
            time: "Just now",
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
