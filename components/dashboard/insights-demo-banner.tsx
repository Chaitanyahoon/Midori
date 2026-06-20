"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function InsightsDemoBanner() {
  return (
    <div className="card-zen p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-bloom relative overflow-hidden group">
      {/* Decorative background */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/[0.03] dark:bg-emerald-400/[0.03] rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center flex-shrink-0 animate-breathe-glow-emerald">
          <Icons.seedling className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Welcome to your Insights!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl leading-relaxed">
            We are displaying a <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sample Garden Log</span>. As you complete tasks and run focus sessions, this page will dynamically update with your real productivity trends.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
        <Button 
          onClick={() => window.location.href = "/dashboard/tasks"} 
          className="btn-organic flex-1 md:flex-none shadow-md hover:shadow-emerald-500/10"
        >
          <Icons.plus className="w-4 h-4 mr-2" /> Plant Seeds
        </Button>
        <Button 
          onClick={() => window.location.href = "/dashboard/pomodoro"} 
          variant="outline" 
          className="flex-1 md:flex-none bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-700/40 hover:bg-white dark:hover:bg-slate-800"
        >
          <Icons.timer className="w-4 h-4 mr-2" /> Start Focus
        </Button>
      </div>
    </div>
  )
}
