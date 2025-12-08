"use client"

import { ProductivityCharts } from "@/components/dashboard/productivity-charts"
import { WeeklyStats } from "@/components/dashboard/weekly-stats"
import { ProductivityTrends } from "@/components/dashboard/productivity-trends"

export default function InsightsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Growth Insights
          </h2>
          <p className="text-muted-foreground">Track your productivity journey and focus habits</p>
        </div>

        {/* 1. Habit Streak & Weekly Growth */}
        <WeeklyStats />

        {/* 2. Qualitative Insights & Levels */}
        <ProductivityTrends />

        {/* 3. Detailed Quantitative Charts */}
        <ProductivityCharts />
      </div>
    </div>
  )
}
