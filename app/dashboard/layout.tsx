"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DataProvider } from "@/components/local-data-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { PlantAIAssistant } from "@/components/dashboard/plant-ai-assistant"
import { AmbientPlayer } from "@/components/dashboard/ambient-player"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
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
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 animate-pulse drop-shadow-md">
              <img src="/midori_logo.png" alt="Midori" className="w-full h-full" />
            </div>
            <p className="text-sm text-emerald-600 font-medium animate-pulse">Growing your garden...</p>
          </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex relative">
        {/* Washi Texture Overlay */}
        <div className="washi-overlay pointer-events-none" />
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
          {/* pb-24 on mobile to clear the bottom nav bar with safe areas */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0">
            {children}
          </main>
        </div>

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-around px-2 py-1 safe-area-pb shadow-lg">
          {[
            { href: "/dashboard", icon: Icons.seedling, label: "Home" },
            { href: "/dashboard/tasks", icon: Icons.leaf, label: "Tasks" },
            { href: "/dashboard/pomodoro", icon: Icons.timer, label: "Focus" },
            { href: "/dashboard/coop", icon: Icons.heart, label: "Co-op" },
            { href: "/dashboard/insights", icon: Icons.sprout, label: "Insights" },
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 px-3 rounded-xl transition-all touch-manipulation active:scale-95 min-h-[48px] min-w-[56px] ${isActive
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "scale-110 text-emerald-600 dark:text-emerald-400" : ""} transition-transform`} />
                <span className={`text-[10px] tracking-wide ${isActive ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-medium"}`}>{item.label}</span>
              </a>
            )
          })}
        </nav>

        <AmbientPlayer />
        <OfflineIndicator />
        <PlantAIAssistant />
      </div>
    </DataProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, info) => {
        console.error("Dashboard error:", error, info)
      }}
    >
      <DashboardContent>{children}</DashboardContent>
    </ErrorBoundary>
  )
}
