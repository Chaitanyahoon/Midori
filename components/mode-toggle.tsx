"use client"

import * as React from "react"
import { FiMoon as Moon, FiSun as Sun } from "react-icons/fi"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300"
            >
                <div className="h-4 w-4" />
            </Button>
        )
    }

    const isDark = theme === "dark"

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Toggle Theme"
        >
            {isDark ? (
                <Sun className="h-[1.15rem] w-[1.15rem] text-orange-500 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
                <Moon className="h-[1.15rem] w-[1.15rem] text-slate-700 transition-transform duration-300 rotate-0 scale-100" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
