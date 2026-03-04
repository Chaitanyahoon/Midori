"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

const TONES = [
    {
        value: "casual",
        label: "Casual & Friendly",
        emoji: "🌿",
        description: "Warm, relaxed, supportive",
        bg: "from-emerald-50 to-green-50",
        border: "border-emerald-300",
        activeBg: "from-emerald-500 to-green-500",
    },
    {
        value: "energetic",
        label: "Energetic & Motivating",
        emoji: "⚡",
        description: "Bold pushes, high energy",
        bg: "from-amber-50 to-yellow-50",
        border: "border-amber-300",
        activeBg: "from-amber-500 to-yellow-500",
    },
    {
        value: "calm",
        label: "Calm & Zen",
        emoji: "🧘",
        description: "Gentle, mindful, peaceful",
        bg: "from-sky-50 to-blue-50",
        border: "border-sky-300",
        activeBg: "from-sky-500 to-blue-500",
    },
    {
        value: "formal",
        label: "Formal & Direct",
        emoji: "👔",
        description: "Concise, clear, professional",
        bg: "from-slate-50 to-gray-50",
        border: "border-slate-300",
        activeBg: "from-slate-600 to-gray-600",
    },
]

const SECTIONS = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "goals", label: "Daily Goals", icon: "🎯" },
]

export function SettingsDialog({ children }: { children?: React.ReactNode }) {
    const { settings, updateSettings } = useData()
    const { user } = useAuth()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("profile")

    const defaultName = settings.userName || user?.displayName || user?.email?.split("@")[0] || ""
    const [name, setName] = useState(defaultName)
    const [tone, setTone] = useState(settings.userTone || "casual")
    const [goalTasks, setGoalTasks] = useState([settings.dailyGoalTasks])
    const [goalPomodoros, setGoalPomodoros] = useState([settings.dailyGoalPomodoros])
    const [goalHours, setGoalHours] = useState([settings.dailyGoalHours])
    const [saved, setSaved] = useState(false)

    const initials = name.trim()
        ? name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : "ME"

    const handleSave = () => {
        updateSettings({
            userName: name,
            userTone: tone,
            dailyGoalTasks: goalTasks[0],
            dailyGoalPomodoros: goalPomodoros[0],
            dailyGoalHours: goalHours[0],
        })
        setSaved(true)
        setTimeout(() => {
            setSaved(false)
            setOpen(false)
        }, 1000)
        toast({
            title: "Settings saved ✨",
            description: "Your preferences and goals have been updated.",
        })
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (v) {
                setName(settings.userName || user?.displayName || user?.email?.split("@")[0] || "");
                setTone(settings.userTone || "casual")
            }
        }}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        <Icons.settings className="w-5 h-5" />
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="p-0 gap-0 overflow-hidden max-w-[640px] w-full rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 shadow-2xl">
                <div className="flex h-[540px]">

                    {/* Sidebar */}
                    <aside className="w-[160px] flex-shrink-0 bg-gradient-to-b from-emerald-50 to-teal-50/50 dark:from-emerald-950 dark:to-slate-900 border-r border-emerald-100 dark:border-emerald-900 flex flex-col py-6 px-3 gap-1">
                        {/* Logo */}
                        <div className="flex items-center gap-2 px-2 pb-5 mb-1 border-b border-emerald-100 dark:border-emerald-900">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                                <Icons.settings className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Settings</span>
                        </div>

                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeSection === s.id
                                        ? "bg-white dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-100 dark:border-emerald-800"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5"
                                    }`}
                            >
                                <span className="text-base">{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <DialogHeader className="px-7 pt-7 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                {SECTIONS.find(s => s.id === activeSection)?.icon} {SECTIONS.find(s => s.id === activeSection)?.label}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400">
                                {activeSection === "profile" ? "Personalize how BloomMind speaks to you." : "Set your daily productivity benchmarks."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">
                            {/* ─── PROFILE SECTION ─── */}
                            {activeSection === "profile" && (
                                <>
                                    {/* Avatar + Name */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900 flex-shrink-0 select-none">
                                            {initials}
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="name" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                                                Display Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Chaitanya"
                                                className="border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 bg-slate-50 dark:bg-slate-800 h-10 text-sm rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Tone selector */}
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                                            Assistant Tone
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {TONES.map((t) => {
                                                const isActive = tone === t.value
                                                return (
                                                    <button
                                                        key={t.value}
                                                        type="button"
                                                        onClick={() => setTone(t.value)}
                                                        className={`group relative text-left p-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none
                              ${isActive
                                                                ? `bg-gradient-to-br ${t.activeBg} border-transparent text-white shadow-lg`
                                                                : `bg-gradient-to-br ${t.bg} ${t.border} hover:shadow-md hover:scale-[1.02]`
                                                            }`}
                                                    >
                                                        <div className="text-xl mb-1">{t.emoji}</div>
                                                        <div className={`text-xs font-bold mb-0.5 ${isActive ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>
                                                            {t.label}
                                                        </div>
                                                        <div className={`text-[10px] ${isActive ? "text-white/80" : "text-slate-400"}`}>
                                                            {t.description}
                                                        </div>
                                                        {isActive && (
                                                            <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-2.5">Determines how BloomMind communicates with you.</p>
                                    </div>
                                </>
                            )}

                            {/* ─── GOALS SECTION ─── */}
                            {activeSection === "goals" && (
                                <div className="space-y-7">
                                    {[
                                        { label: "Daily Tasks", emoji: "✅", value: goalTasks, setter: setGoalTasks, min: 1, max: 10, step: 1, unit: "tasks", tip: "Recommended: 3–5 tasks per day." },
                                        { label: "Focus Sessions", emoji: "🍅", value: goalPomodoros, setter: setGoalPomodoros, min: 1, max: 12, step: 1, unit: "sessions", tip: "1 session = 25 min of deep work." },
                                        { label: "Focus Hours", emoji: "⏱️", value: goalHours, setter: setGoalHours, min: 0.5, max: 8, step: 0.5, unit: "hrs", tip: "Balance focus time with recovery." },
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{item.emoji}</span>
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{item.value[0]} {item.unit}</span>
                                                </div>
                                            </div>
                                            <Slider
                                                value={item.value}
                                                onValueChange={item.setter}
                                                min={item.min}
                                                max={item.max}
                                                step={item.step}
                                                className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-white"
                                            />
                                            <p className="text-[11px] text-slate-400">{item.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-7 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                            <button
                                onClick={() => setOpen(false)}
                                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={handleSave}
                                className={`px-6 h-9 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md
                  ${saved
                                        ? "bg-emerald-500 text-white scale-95"
                                        : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-emerald-200 hover:shadow-lg hover:scale-[1.02]"
                                    }`}
                            >
                                {saved ? "✓ Saved!" : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
