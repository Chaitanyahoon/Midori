"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export function SettingsDialog({ children }: { children?: React.ReactNode }) {
    const { settings, updateSettings } = useData()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)

    // Local state for editing
    const [name, setName] = useState(settings.userName || "")
    const [tone, setTone] = useState(settings.userTone || "casual")
    const [goalTasks, setGoalTasks] = useState([settings.dailyGoalTasks])
    const [goalPomodoros, setGoalPomodoros] = useState([settings.dailyGoalPomodoros])
    const [goalHours, setGoalHours] = useState([settings.dailyGoalHours])

    const handleSave = () => {
        updateSettings({
            userName: name,
            userTone: tone,
            dailyGoalTasks: goalTasks[0],
            dailyGoalPomodoros: goalPomodoros[0],
            dailyGoalHours: goalHours[0],
        })
        setOpen(false)
        toast({
            title: "Settings saved ✨",
            description: "Your preferences and goals have been updated.",
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        <Icons.settings className="w-5 h-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-emerald-100 dark:border-emerald-900 key-settings-dialog">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Icons.settings className="w-6 h-6 text-emerald-600" />
                        Settings
                    </DialogTitle>
                    <DialogDescription>
                        Personalize your data and daily productivity targets.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="profile" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-emerald-50 dark:bg-emerald-900/20">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="goals">Daily Goals</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="border-emerald-100 focus-visible:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assistant Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="border-emerald-100 focus:ring-emerald-500">
                                    <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual & Friendly 🌿</SelectItem>
                                    <SelectItem value="energetic">Energetic & Motivating ⚡</SelectItem>
                                    <SelectItem value="calm">Calm & Zen 🧘</SelectItem>
                                    <SelectItem value="formal">Formal & Direct 👔</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Determines how the AI assistant communicates with you.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Daily Tasks Goal</Label>
                                <span className="text-emerald-600 font-bold">{goalTasks[0]} tasks</span>
                            </div>
                            <Slider
                                value={goalTasks}
                                onValueChange={setGoalTasks}
                                min={1}
                                max={10}
                                step={1}
                                className="[&_.slider-thumb]:border-emerald-500 [&_.slider-track]:bg-emerald-200"
                            />
                            <p className="text-xs text-muted-foreground">Recommended: 3-5 tasks per day for steady progress.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Daily Pomodoros</Label>
                                <span className="text-emerald-600 font-bold">{goalPomodoros[0]} sessions</span>
                            </div>
                            <Slider
                                value={goalPomodoros}
                                onValueChange={setGoalPomodoros}
                                min={1}
                                max={12}
                                step={1}
                            />
                            <p className="text-xs text-muted-foreground">1 session = 25 minutes of focused work.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Daily Focus Hours</Label>
                                <span className="text-emerald-600 font-bold">{goalHours[0]} hours</span>
                            </div>
                            <Slider
                                value={goalHours}
                                onValueChange={setGoalHours}
                                min={0.5}
                                max={8}
                                step={0.5}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
