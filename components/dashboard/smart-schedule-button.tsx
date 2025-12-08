"use client"

import { useState } from "react"
import { useData } from "@/components/local-data-provider"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface SuggestedTask {
    title: string
    duration: number
    time: string
    priority: "low" | "medium" | "high"
    category: "work" | "personal" | "learning" | "health"
    originalId?: string
}

export function SmartScheduleButton() {
    const { tasks, updateTask, addTask, stats } = useData()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<SuggestedTask[]>([])
    const [aiAnalysis, setAiAnalysis] = useState("")

    const handleGenerateSchedule = async () => {
        setIsLoading(true)
        setSuggestions([])
        setAiAnalysis("")

        try {
            // Collect context
            const pendingTasks = tasks.filter(t => !t.completed)
            const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0])

            const context = {
                today: new Date().toISOString().split("T")[0],
                pendingTasks: pendingTasks.map(t => ({ title: t.title, priority: t.priority, id: t.id })),
                overdueTasks: overdueTasks.length,
                stats: stats
            }

            const response = await fetch("/api/growth-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intent: "schedule",
                    message: "Please reschedule my pending tasks for today to maximize flow.",
                    context
                })
            })

            if (!response.ok) throw new Error("Failed to generate schedule")

            const data = await response.json()

            if (data.taskSuggestions) {
                setSuggestions(data.taskSuggestions)
            }
            if (data.response) {
                setAiAnalysis(data.response)
            }

        } catch (error) {
            toast.error("Failed to generate schedule. Please try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApplySchedule = () => {
        // Apply the suggestions
        // For this iterations, we will just add them as new tasks if they don't match existing ones, 
        // or update existing ones if we could map them (simplified for now to just toast success)

        let addedCount = 0;
        suggestions.forEach(suggestion => {
            // Simple logic: Add as new task with the suggested time in description for now
            // In a real app, we would update the 'dueDate' or a specific 'scheduledTime' field
            addTask({
                title: suggestion.title,
                category: suggestion.category,
                priority: suggestion.priority,
                description: `AI Scheduled for ${suggestion.time} (${suggestion.duration} min)`,
                dueDate: new Date().toISOString().split("T")[0],
                completed: false,
                recurrence: "none"
            })
            addedCount++
        })

        toast.success(`Allocated ${addedCount} tasks to your schedule!`)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                >
                    <Icons.stars className="w-4 h-4 text-violet-500" />
                    Smart Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icons.stars className="w-5 h-5 text-violet-500" />
                        AI Flow Architect
                    </DialogTitle>
                    <DialogDescription>
                        Let AI organize your day for maximum flow and productivity.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {!isLoading && suggestions.length === 0 && !aiAnalysis && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.calendar className="w-8 h-8 text-violet-500" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                I will analyze your pending tasks and build a balanced schedule for today.
                            </p>
                            <Button onClick={handleGenerateSchedule} className="bg-violet-600 hover:bg-violet-700 text-white">
                                <Icons.sparkles className="w-4 h-4 mr-2" />
                                Generate Schedule
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                            <p className="text-sm text-gray-500 animate-pulse">Designing your flow...</p>
                        </div>
                    )}

                    {!isLoading && (suggestions.length > 0 || aiAnalysis) && (
                        <div className="space-y-6">
                            {aiAnalysis && (
                                <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                    {aiAnalysis}
                                </div>
                            )}

                            {suggestions.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Proposed Schedule</h4>
                                    <div className="space-y-2">
                                        {suggestions.map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 shadow-sm">
                                                <div className="w-16 text-xs text-gray-500 font-mono text-center shrink-0">
                                                    {task.time}
                                                </div>
                                                <div className="w-1 h-8 rounded-full bg-violet-500/20 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                                                    <p className="text-xs text-gray-500">{task.duration} min • {task.category}</p>
                                                </div>
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider
                                            ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'}`}>
                                                    {task.priority}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {suggestions.length > 0 && (
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleApplySchedule} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Icons.check className="w-4 h-4 mr-2" />
                            Accept Schedule
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
