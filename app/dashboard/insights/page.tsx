"use client"

import { ProductivityCharts } from "@/components/dashboard/productivity-charts"
import { WeeklyStats } from "@/components/dashboard/weekly-stats"
import { ProductivityTrends } from "@/components/dashboard/productivity-trends"

export default function InsightsPage() {
  return (
    <div className="min-h-full zen-gradient-bg relative overflow-hidden">
      {/* Decorative vertical text (Ma) */}
      <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-8 opacity-[0.05] select-none pointer-events-none z-0">
        <span className="vertical-text text-5xl font-serif text-slate-800 dark:text-emerald-100 reveal-staggered delay-2">成長の洞察</span>
        <div className="w-px h-24 bg-current" />
        <span className="text-[10px] tracking-[0.5em] uppercase font-bold">Insights</span>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col space-y-2 reveal-staggered delay-1">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-3">
              Growth Insights
              <span className="text-xl font-serif text-slate-400/60 dark:text-emerald-300/30">成長</span>
            </h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Track your productivity journey — <span className="text-emerald-600 dark:text-emerald-400 italic">Satori</span></p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* 1. Habit Streak & Weekly Growth */}
            <div className="reveal-staggered delay-2">
              <WeeklyStats />
            </div>

            {/* 2. Qualitative Insights & Levels */}
            <div className="reveal-staggered delay-3">
              <ProductivityTrends />
            </div>

            {/* 3. Detailed Quantitative Charts */}
            <div className="reveal-staggered delay-4">
              <ProductivityCharts />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
