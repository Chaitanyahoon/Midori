"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataProvider } from "@/components/local-data-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { PlantAIAssistant } from "@/components/dashboard/plant-ai-assistant"
import { useAuth } from "@/components/auth-provider"
import { useUIStore } from "@/lib/store"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { isAIModalOpen, closeAIModal, openAIModal, isSidebarOpen, toggleSidebar, closeSidebar } = useUIStore()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-950 dark:to-emerald-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 animate-pulse drop-shadow-xl">
            <img src="/icon.svg" alt="Planthesia" className="w-full h-full" />
          </div>
          <p className="text-sm text-emerald-600 font-medium animate-pulse">Growing your garden...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
          <TopNav
            onAIAssistantClick={openAIModal}
            onMenuClick={toggleSidebar}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
        <PlantAIAssistant isOpen={isAIModalOpen} onClose={closeAIModal} />
      </div>
    </DataProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>
}
