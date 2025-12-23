"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-orange-500 dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-slate-700 dark:text-slate-200 dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-emerald-100/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg p-2 min-w-[140px]">
                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-900/20 cursor-pointer mb-1 group">
                    <Sun className="mr-2 h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-900/20 cursor-pointer mb-1 group">
                    <Moon className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-900/20 cursor-pointer group">
                    <span className="mr-2 h-4 w-4 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">💻</span>
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
