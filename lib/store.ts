import { create } from "zustand"

interface UIState {
    // AI Assistant
    isAIModalOpen: boolean
    openAIModal: () => void
    closeAIModal: () => void

    // Sidebar
    isSidebarOpen: boolean
    toggleSidebar: () => void
    closeSidebar: () => void

    // Notifications
    unreadCount: number
    setUnreadCount: (count: number) => void
}

export const useUIStore = create<UIState>((set) => ({
    // AI Modal
    isAIModalOpen: false,
    openAIModal: () => set({ isAIModalOpen: true }),
    closeAIModal: () => set({ isAIModalOpen: false }),

    // Sidebar
    isSidebarOpen: false,
    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
    closeSidebar: () => set({ isSidebarOpen: false }),

    // Notifications
    unreadCount: 0,
    setUnreadCount: (count) => set({ unreadCount: count }),
}))
