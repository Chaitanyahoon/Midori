"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "@/components/dashboard/settings-dialog"

const navigation = [
  { name: "Growth Hub", href: "/dashboard", icon: Icons.seedling, description: "Your productivity overview" },
  { name: "Tasks Garden", href: "/dashboard/tasks", icon: Icons.leaf, description: "Manage your task ecosystem" },
  { name: "Time Planner", href: "/dashboard/calendar", icon: Icons.sun, description: "Schedule your growth" },
  { name: "Focus Grove", href: "/dashboard/pomodoro", icon: Icons.tree, description: "Deep work sessions" },
  { name: "Growth Insights", href: "/dashboard/insights", icon: Icons.sprout, description: "Track your progress" },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-72 hidden lg:block h-screen sticky top-0 z-40">
      <div className="sidebar-float flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500/10 to-amber-500/10 rounded-b-[3rem] -z-10" />

          <div className="flex items-center space-x-3 mb-6 animate-bloom">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg transform rotate-3">
              <Icons.leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                Planthesia
              </h1>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium tracking-wide">
                Grow Your Focus
              </p>
            </div>
          </div>

          {/* User Profile Tiny or Search could go here */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/10 text-emerald-800 dark:text-emerald-200 font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-700 dark:hover:text-emerald-300"
                )}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />
                )}

                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500"
                )} />
                <div className="flex-1">
                  <span>{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer / User Settings */}
        <div className="p-5 mt-auto space-y-6">
          {/* Weekly Growth Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-amber-100 dark:border-emerald-800/30 text-center relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-amber-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-emerald-100 mb-1">Weekly Growth</h3>
            <p className="text-xs text-amber-600/80 dark:text-emerald-300/70 mb-3">You're glowing! ✨</p>
            <div className="h-1.5 w-full bg-amber-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 w-[70%]" />
            </div>
          </div>

          {/* User & Settings */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold text-xs">
                ME
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                My Profile
              </div>
            </div>
            <SettingsDialog />
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Keep existing logic if needed, or hide) */}
    </div>
  )
}
