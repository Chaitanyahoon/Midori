"use client"

import { Icons } from "@/components/icons"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 animate-in fade-in duration-500">
            <div className="relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900 border-t-emerald-500 dark:border-t-emerald-400 w-24 h-24 animate-spin"></div>

                {/* Inner pulsing circle */}
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20 backdrop-blur-sm">
                    <Icons.leaf className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
            </div>

            {/* Loading text */}
            <div className="mt-8 flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Planthesia
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                    Cultivating your workspace...
                </p>
            </div>
        </div>
    )
}
