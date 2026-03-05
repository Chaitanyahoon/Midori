"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DataProvider } from "@/components/local-data-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { PlantAIAssistant } from "@/components/dashboard/plant-ai-assistant"
import { useAuth } from "@/components/auth-provider"
import { useUIStore } from "@/lib/store"
import { Icons } from "@/components/icons"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()

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
        {/* ── Desktop Sidebar (always visible ≥ lg) ── */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar />
        </div>

        {/* ── Mobile Sidebar Overlay ── */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Mobile Sidebar Drawer ── */}
        <div
          className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
          <TopNav />
          {/* pb-16 on mobile to clear the bottom nav bar */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
            {children}
          </main>
        </div>

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-around px-2 py-2 safe-area-pb">
          {[
            { href: "/dashboard", icon: Icons.seedling, label: "Home" },
            { href: "/dashboard/tasks", icon: Icons.leaf, label: "Tasks" },
            { href: "/dashboard/calendar", icon: Icons.calendar, label: "Plan" },
            { href: "/dashboard/pomodoro", icon: Icons.timer, label: "Focus" },
            { href: "/dashboard/insights", icon: Icons.sprout, label: "Insights" },
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all touch-manipulation active:scale-95 ${isActive
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                    : "text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className={`text-[10px] ${isActive ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-medium"}`}>{item.label}</span>
              </a>
            )
          })}
        </nav>

        <PlantAIAssistant />
      </div>
    </DataProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>
}
