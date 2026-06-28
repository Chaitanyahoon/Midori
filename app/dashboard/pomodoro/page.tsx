"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { FocusMusicPlayer, MUSIC_OPTIONS } from "@/components/dashboard/focus-music-player"
import { EnvironmentalParticles } from "@/components/dashboard/environmental-particles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePomodoro } from "@/lib/hooks/usePomodoro"
import { useMusicStore, MusicTrack } from "@/lib/store"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"


export default function PomodoroPage() {
  const {
    timeLeft,
    isActive,
    isBreak,
    selectedTask,
    sessionNote,
    settings,
    autoStartBreaks,
    autoStartPomodoros,
    soundEnabled,
    focusGoal,
    pendingTasks,
    todaySessions,
    completedSessionsToday,
    isLongBreakTime,
    progress,
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
    setSelectedTask,
    setSessionNote,
    updateTimerSettings,
    setAutoStartBreaks,
    setAutoStartPomodoros,
    setSoundEnabled,
    setFocusGoal,
    formatTime,
  } = usePomodoro()

  const { tasks, pomodoros, updateTask, addTask, settings: userSettings, updateSettings } = useData()

  const [isZenMode, setIsZenMode] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Zen Mode panels & features
  const [isZenTasksOpen, setIsZenTasksOpen] = useState(false)
  const [isZenMusicOpen, setIsZenMusicOpen] = useState(false)
  const [isBreathingPacerActive, setIsBreathingPacerActive] = useState(false)
  
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4)
  const [breathingPattern, setBreathingPattern] = useState<"box" | "relax" | "coherence">("box")

  // Brain Dump state
  const [brainDumpText, setBrainDumpText] = useState("")
  const [brainDumpNotes, setBrainDumpNotes] = useState<string[]>([])

  // Harvest Modal & Reflection
  const [showHarvestModal, setShowHarvestModal] = useState(false)
  const [prevCompletedCount, setPrevCompletedCount] = useState<number | null>(null)
  const [reflectionText, setReflectionText] = useState("")

  // Load brain dump
  useEffect(() => {
    const saved = localStorage.getItem("midori_brain_dump")
    if (saved) {
      try { setBrainDumpNotes(JSON.parse(saved)) } catch (e) {}
    }
  }, [])

  const saveBrainDump = (notes: string[]) => {
    setBrainDumpNotes(notes)
    localStorage.setItem("midori_brain_dump", JSON.stringify(notes))
  }

  const handleAddDumpNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brainDumpText.trim()) return
    const nextNotes = [...brainDumpNotes, brainDumpText.trim()]
    saveBrainDump(nextNotes)
    setBrainDumpText("")
    toast.success("Mind cleared! 🧠", { description: "Fleeting thought captured. Focus restored." })
  }

  const handleDeleteDumpNote = (index: number) => {
    const nextNotes = brainDumpNotes.filter((_, i) => i !== index)
    saveBrainDump(nextNotes)
  }

  const handleConvertDumpToTask = async (index: number, noteText: string) => {
    await addTask({
      title: noteText,
      priority: "medium",
      category: "personal",
      completed: false
    })
    handleDeleteDumpNote(index)
    toast.success("Task created! 🌱", { description: `"${noteText}" has been added to your Tasks Garden.` })
  }

  // Harvest Modal Trigger
  useEffect(() => {
    if (prevCompletedCount === null) {
      setPrevCompletedCount(completedSessionsToday)
      return
    }
    if (completedSessionsToday > prevCompletedCount) {
      setPrevCompletedCount(completedSessionsToday)
      setShowHarvestModal(true)
      
      // Award actual resources
      const earnedSun = 25
      const currentSun = userSettings?.sunlight ?? 0
      updateSettings({
        sunlight: currentSun + earnedSun
      }).then(() => {
        toast.success("Garden resources harvested! 🌿", {
          description: `Received +${earnedSun} Sunlight for your focus!`
        })
      }).catch(() => {})
    } else {
      setPrevCompletedCount(completedSessionsToday)
    }
  }, [completedSessionsToday, userSettings, updateSettings])

  // Breathing pacer effect
  useEffect(() => {
    if (!isZenMode || !isBreathingPacerActive) return

    const getPhaseDuration = (pattern: "box" | "relax" | "coherence", phase: "inhale" | "hold1" | "exhale" | "hold2"): number => {
      if (pattern === "box") return 4
      if (pattern === "relax") {
        if (phase === "inhale") return 4
        if (phase === "hold1") return 7
        if (phase === "exhale") return 8
        return 0
      }
      if (phase === "inhale") return 5
      if (phase === "exhale") return 5
      return 0
    }

    setBreathingPhase("inhale")
    setBreathingSecondsLeft(getPhaseDuration(breathingPattern, "inhale"))

    const interval = setInterval(() => {
      setBreathingSecondsLeft((prev) => {
        if (prev <= 1) {
          let nextPhase: "inhale" | "hold1" | "exhale" | "hold2" = "inhale"
          setBreathingPhase((phase) => {
            if (breathingPattern === "box") {
              if (phase === "inhale") nextPhase = "hold1"
              else if (phase === "hold1") nextPhase = "exhale"
              else if (phase === "exhale") nextPhase = "hold2"
              else nextPhase = "inhale"
            } else if (breathingPattern === "relax") {
              if (phase === "inhale") nextPhase = "hold1"
              else if (phase === "hold1") nextPhase = "exhale"
              else nextPhase = "inhale"
            } else {
              if (phase === "inhale") nextPhase = "exhale"
              else nextPhase = "inhale"
            }
            return nextPhase
          })
          return getPhaseDuration(breathingPattern, nextPhase)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isZenMode, isBreathingPacerActive, breathingPattern])

  const currentTaskObj = useMemo(() => {
    return tasks.find(t => t.id === selectedTask)
  }, [tasks, selectedTask])

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!currentTaskObj) return
    const nextSubtasks = currentTaskObj.subtasks?.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    ) || []
    await updateTask(currentTaskObj.id, { subtasks: nextSubtasks })
  }

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTaskObj || !newSubtaskTitle.trim()) return
    const newSub = {
      id: Math.random().toString(36).substring(7),
      title: newSubtaskTitle.trim(),
      completed: false
    }
    const nextSubtasks = [...(currentTaskObj.subtasks || []), newSub]
    await updateTask(currentTaskObj.id, { subtasks: nextSubtasks })
    setNewSubtaskTitle("")
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!currentTaskObj) return
    const nextSubtasks = currentTaskObj.subtasks?.filter(s => s.id !== subtaskId) || []
    await updateTask(currentTaskObj.id, { subtasks: nextSubtasks })
  }

  // Toggle Zen Mode on/off
  const toggleZenMode = () => {
    setIsZenMode(!isZenMode)
    if (!isZenMode && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { })
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { })
    }
  }

  // Handle ESC key to exit Zen Mode
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false)
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { })
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isZenMode])

  const sessionHistory = useMemo(() => {
    return pomodoros
      .filter((session) => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  }, [pomodoros])

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return "General Focus"
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.title : "Deleted Task"
  }

  const taskAnalytics = useMemo(() => {
    const taskStats = new Map()

    pomodoros.forEach((session) => {
      if (session.completed) {
        const taskId = session.taskId || "general"
        const taskTitle = getTaskTitle(session.taskId)

        if (!taskStats.has(taskId)) {
          taskStats.set(taskId, {
            title: taskTitle,
            sessions: 0,
            totalTime: 0,
            category: session.taskId ? tasks.find((t) => t.id === session.taskId)?.category || "unknown" : "general",
          })
        }

        const stats = taskStats.get(taskId)
        stats.sessions += 1
        stats.totalTime += session.duration
      }
    })

    return Array.from(taskStats.values())
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5)
  }, [pomodoros, tasks])

  return (
    <div className="w-full min-h-full ambient-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent leading-tight">
            Focus Grove
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base font-medium">Deep work sessions with guided focus and study music</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={toggleZenMode}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl"
          >
            <Icons.layout className="w-4 h-4" />
            Zen Mode
          </Button>
          <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold border border-emerald-200 dark:border-emerald-700 rounded-xl">
            <Icons.target className="w-3.5 h-3.5 mr-1.5" />
            {completedSessionsToday} Sessions Today
          </Badge>
          {focusGoal > 0 && (
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 text-sm font-semibold border border-blue-200 dark:border-blue-700 rounded-xl">
              <Icons.target className="w-3.5 h-3.5 mr-1.5" />
              Goal: {completedSessionsToday}/{focusGoal}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card className={`card-zen overflow-hidden relative group transition-all duration-500 ${isBreak ? 'card-glow-emerald' : 'card-glow-orange'}`}>
            {/* Header with status indicator */}
            <div className={`h-2 ${isBreak ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`}></div>

            <CardHeader className="relative pb-6 pt-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`p-3 rounded-2xl ${isBreak ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                  <Icons.timer className={`w-6 h-6 ${isBreak ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isBreak ? (isLongBreakTime ? "Long Break" : "Short Break") : "Focus Session"}
                </CardTitle>
              </div>

              {/* Gear Settings Button (Dialog Trigger) */}
              <div className="absolute right-4 top-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Timer Settings">
                      <Icons.settings className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-100 dark:border-slate-800 shadow-2xl rounded-3xl p-6">
                    <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                      <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white">
                        <Icons.settings className="w-5 h-5 text-emerald-500" />
                        Focus Grove Settings
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-5 text-left max-h-[70vh] overflow-y-auto scrollbar-hide">
                      
                      {/* Timer Durations */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Timer Durations</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Focus Time</label>
                            <Select
                              value={settings.focusTime.toString()}
                              onValueChange={(value) => {
                                const newFocusTime = Number.parseInt(value)
                                updateTimerSettings({ focusTime: newFocusTime })
                              }}
                            >
                              <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="20">20 minutes</SelectItem>
                                <SelectItem value="25">25 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Short Break</label>
                              <Select
                                value={settings.shortBreak.toString()}
                                onValueChange={(value) => {
                                  const newShortBreak = Number.parseInt(value)
                                  updateTimerSettings({ shortBreak: newShortBreak })
                                }}
                              >
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 min</SelectItem>
                                  <SelectItem value="5">5 min</SelectItem>
                                  <SelectItem value="10">10 min</SelectItem>
                                  <SelectItem value="15">15 min</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Long Break</label>
                              <Select
                                value={settings.longBreak.toString()}
                                onValueChange={(value) => {
                                  const newLongBreak = Number.parseInt(value)
                                  updateTimerSettings({ longBreak: newLongBreak })
                                }}
                              >
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 min</SelectItem>
                                  <SelectItem value="20">20 min</SelectItem>
                                  <SelectItem value="30">30 min</SelectItem>
                                  <SelectItem value="45">45 min</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                              Sessions Until Long Break
                            </label>
                            <Input
                              type="number"
                              min="2"
                              max="10"
                              value={settings.sessionsUntilLongBreak}
                              onChange={(e) => updateTimerSettings({ sessionsUntilLongBreak: Number.parseInt(e.target.value) || 4 })}
                              className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Preferences</h4>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5 flex-1">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-start Breaks</Label>
                              <p className="text-xs text-slate-400">Start break automatically</p>
                            </div>
                            <Switch checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5 flex-1">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-start Pomodoros</Label>
                              <p className="text-xs text-slate-400">Start next session automatically</p>
                            </div>
                            <Switch checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros} />
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5 flex-1">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sound Notifications</Label>
                              <p className="text-xs text-slate-400">Play sounds for events</p>
                            </div>
                            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                          </div>
                        </div>
                      </div>

                      {/* Daily Goal */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Daily Target Goal</h4>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={focusGoal}
                            onChange={(e) => setFocusGoal(Number.parseInt(e.target.value) || 0)}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10 mb-1 rounded-xl"
                            placeholder="Set daily goal"
                          />
                        </div>
                      </div>

                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {!isBreak && selectedTask && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Working on: <span className="font-medium">{getTaskTitle(selectedTask === "general" ? undefined : selectedTask)}</span>
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8">
              {/* Timer Display */}
              <div className="text-center">
                <div className={`relative w-44 h-44 sm:w-56 sm:h-56 mx-auto mb-8 transition-all duration-1000 ${isActive ? (isBreak ? "animate-breathe-glow-emerald" : "animate-breathe-glow-amber") : ""}`}>
                  {/* Outer glow effect */}
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${isBreak ? "bg-emerald-400" : "bg-blue-500"}`}></div>

                  {/* Background circle */}
                  <div
                    className={`absolute inset-0 rounded-full ${isBreak
                      ? "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30"
                      : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30"
                      }`}
                  ></div>

                  {/* Timer display */}
                  <div className="absolute inset-4 sm:inset-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl border-4 border-white/50 dark:border-slate-700/50">
                    <div className="text-center" role="timer" aria-live="polite" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
                      <span className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 block leading-none">{formatTime(timeLeft)}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {Math.round(progress)}% complete
                      </span>
                    </div>
                  </div>

                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                      className={isBreak ? "text-emerald-500 dark:text-emerald-400" : "text-blue-500 dark:text-blue-400"}
                      style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  {!isActive ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      aria-label="Start focus session"
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-10 py-6 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-0"
                    >
                      <Icons.play className="w-5 h-5 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      aria-label={isActive ? "Pause timer" : "Resume timer"}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-10 py-6 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-0"
                    >
                      <Icons.pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    aria-label="Reset timer"
                    className="px-8 py-6 rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <Icons.reset className="w-5 h-5 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="lg"
                    aria-label="Skip session"
                    className="px-8 py-6 rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                    title="Skip"
                  >
                    <Icons.skip className="w-5 h-5 mr-2" />
                    Skip
                  </Button>
                </div>
              </div>

              {/* Task Selection */}
              {!isBreak && (
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 border border-slate-200/50 dark:border-slate-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Icons.target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Focus Configuration
                    </label>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                      Select Task (Optional)
                    </Label>
                    <Select value={selectedTask} onValueChange={setSelectedTask}>
                      <SelectTrigger className="w-full bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 h-11 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl">
                        <SelectValue placeholder="Select a task or focus generally" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Focus Session</SelectItem>
                        {pendingTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Session Note */}
                  <div>
                    <Label htmlFor="sessionNote" className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                      Session Note
                    </Label>
                    <Textarea
                      id="sessionNote"
                      value={sessionNote}
                      onChange={(e) => setSessionNote(e.target.value)}
                      placeholder="What are you focusing on in this session?"
                      className="bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-sm resize-none focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Focus Milestones */}
          <Card className="card-zen mt-6 p-5 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-1000" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icons.sprout className="w-4 h-4 text-emerald-500" />
              Focus Grove Milestones
            </h3>
            
            {(() => {
              const focusMins = completedSessionsToday * (settings?.focusTime || 25)
              const milestones = [
                { name: "Sprout 🌱", mins: 25, desc: "25m Focused" },
                { name: "Sapling 🌳", mins: 50, desc: "50m Focused" },
                { name: "Forest 🌲🌲", mins: 100, desc: "100m Focused" },
                { name: "Lotus 🌸", mins: 150, desc: "150m+ Focused" }
              ]

              return (
                <div className="grid grid-cols-4 gap-2.5">
                  {milestones.map((m) => {
                    const active = focusMins >= m.mins
                    return (
                      <div
                        key={m.name}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 text-center ${
                          active
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold shadow-md animate-[pulse_3s_infinite]"
                            : "bg-white/5 border-slate-200/50 dark:border-slate-800/30 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <span className={`text-base mb-1 transition-transform duration-500 ${active ? 'scale-110 rotate-3' : 'scale-100 opacity-60'}`}>
                          {m.name.split(" ")[1] || "🌱"}
                        </span>
                        <span className="text-[10px] leading-tight block font-bold">{m.name.split(" ")[0]}</span>
                        <span className="text-[9px] font-normal opacity-60 mt-0.5">{m.desc}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <FocusMusicPlayer isActive={isActive} isBreak={isBreak} isZenMode={isZenMode} />

          {/* Today's Progress Card with Embedded Collapsible History */}
          <Card className="card-zen card-glow-emerald">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Icons.trendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Sessions</span>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-lg px-3 py-1">
                  {completedSessionsToday}
                </Badge>
              </div>

              {focusGoal > 0 && (
                <div className="space-y-2 p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Daily Goal</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base">
                      {completedSessionsToday}/{focusGoal}
                    </span>
                  </div>
                  <Progress
                    value={Math.min((completedSessionsToday / focusGoal) * 100, 100)}
                    className="h-2.5"
                  />
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
                    {Math.round((completedSessionsToday / focusGoal) * 100)}% Complete
                  </div>
                </div>
              )}

              <div className="space-y-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Until long break</span>
                  <Badge variant="outline" className="font-semibold">
                    {settings.sessionsUntilLongBreak - (completedSessionsToday % settings.sessionsUntilLongBreak)} sessions
                  </Badge>
                </div>
                <Progress
                  value={
                    ((completedSessionsToday % settings.sessionsUntilLongBreak) / settings.sessionsUntilLongBreak) * 100
                  }
                  className="h-2.5"
                />
                <div className="flex gap-2 mt-3">
                  {[...Array(settings.sessionsUntilLongBreak)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full transition-all ${i < (completedSessionsToday % settings.sessionsUntilLongBreak)
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Collapsible History Section */}
              <div className="pt-2">
                <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="w-full space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-between px-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Today's Sessions</span>
                      <Icons.chevronRight className={`w-4 h-4 transition-transform duration-200 ${isHistoryOpen ? 'rotate-90' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {todaySessions.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No sessions completed today</p>
                    ) : (
                      todaySessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {getTaskTitle(session.taskId)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {session.duration} min • {new Date(session.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className="text-emerald-500 text-xs font-bold font-mono ml-2">済</span>
                        </div>
                      ))
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Focus Streak */}
              {(() => {
                const calculateStreak = () => {
                  const today = new Date()
                  let streak = 0
                  for (let i = 0; i < 30; i++) {
                    const date = new Date(today)
                    date.setDate(date.getDate() - i)
                    const dateString = date.toISOString().split("T")[0]
                    const daySessions = pomodoros.filter(
                      (p) => p.completed && p.startTime && p.startTime.split("T")[0] === dateString,
                    )
                    if (daySessions.length > 0) {
                      streak++
                    } else if (i > 0) {
                      break
                    }
                  }
                  return streak
                }
                const streak = calculateStreak()
                return streak > 0 ? (
                  <div className="pt-2">
                    <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Focus Streak</span>
                      </div>
                      <Badge className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-2 py-0.5 text-xs">
                        {streak} days
                      </Badge>
                    </div>
                  </div>
                ) : null
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Zen Mode Overlay */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-6 overflow-hidden animate-in fade-in duration-500">
          <div className="absolute inset-0 washi-overlay pointer-events-none opacity-20" />
          <EnvironmentalParticles count={15} opacity={0.25} className="absolute inset-0 pointer-events-none" />

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
          </div>

          {/* Persistent FocusMusicPlayer target rendered offscreen inside Zen Mode */}
          <FocusMusicPlayer isActive={isActive} isBreak={isBreak} isZenMode={true} />

          {/* 1. TOP DOCK (Floating row) */}
          <div className="relative z-20 flex items-center justify-between w-full px-4 py-2 bg-white/5 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsZenTasksOpen(!isZenTasksOpen)}
                variant="ghost"
                className={`text-sm rounded-xl px-4 py-2 gap-2 transition-all ${isZenTasksOpen ? "bg-white/10 text-emerald-400" : "text-white/60 hover:text-white"}`}
              >
                <Icons.list className="w-4 h-4" />
                <span>Checklist</span>
              </Button>

              <Button
                onClick={() => setIsZenMusicOpen(!isZenMusicOpen)}
                variant="ghost"
                className={`text-sm rounded-xl px-4 py-2 gap-2 transition-all ${isZenMusicOpen ? "bg-white/10 text-emerald-400" : "text-white/60 hover:text-white"}`}
              >
                <Icons.music className="w-4 h-4" />
                <span>Audio Mixer</span>
              </Button>

              <Button
                onClick={() => setIsBreathingPacerActive(!isBreathingPacerActive)}
                variant="ghost"
                className={`text-sm rounded-xl px-4 py-2 gap-2 transition-all ${isBreathingPacerActive ? "bg-white/10 text-emerald-400" : "text-white/60 hover:text-white"}`}
              >
                <Icons.activity className="w-4 h-4" />
                <span>Breathe Guide</span>
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* Active Task Name */}
              {selectedTask !== "general" && currentTaskObj && (
                <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Focusing on: {currentTaskObj.title}
                </div>
              )}

              <Button
                onClick={toggleZenMode}
                variant="ghost"
                className="text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all gap-2"
              >
                <Icons.close className="w-5 h-5" />
                Exit Zen
              </Button>
            </div>
          </div>

          {/* 2. MAIN LAYOUT (Checklist | Center Timer | Audio Control) */}
          <div className="flex-1 w-full flex items-center justify-between relative mt-4 mb-4 gap-6">
            
            {/* LEFT DRAWER (Tasks & Checklists & Brain Dump) */}
            <div className={`relative z-20 h-full w-80 bg-slate-950/70 border border-white/5 backdrop-blur-2xl rounded-3xl p-5 flex flex-col justify-between transition-all duration-500 transform ${isZenTasksOpen ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0 pointer-events-none absolute"}`}>
              <div className="flex flex-col min-h-0 flex-1">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Icons.list className="text-emerald-400 w-4 h-4" />
                    Focus Hub
                  </h3>
                  <Badge variant="outline" className="text-white/40 border-white/10">Zen workspace</Badge>
                </div>

                <Tabs defaultValue="tasks" className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid grid-cols-2 bg-white/5 border border-white/5 rounded-xl p-1 mb-4 h-9">
                    <TabsTrigger value="tasks" className="text-xs text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg h-7 font-semibold">📋 Tasks</TabsTrigger>
                    <TabsTrigger value="dump" className="text-xs text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg h-7 font-semibold">🧠 Brain Dump</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tasks" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none">
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Active Focus Task</label>
                      <Select value={selectedTask} onValueChange={setSelectedTask}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 h-10 text-white focus:ring-emerald-500 focus:border-emerald-500 rounded-xl">
                          <SelectValue placeholder="Select a task or focus generally" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Focus Session</SelectItem>
                          {pendingTasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTask !== "general" && currentTaskObj ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="mb-3.5">
                          <div className="flex justify-between items-center text-xs text-white/70 mb-1.5">
                            <span className="font-semibold truncate max-w-[150px]">{currentTaskObj.title}</span>
                            <span className="font-mono text-emerald-400">
                              {Math.round(((currentTaskObj.subtasks?.filter(s => s.completed).length || 0) / (currentTaskObj.subtasks?.length || 1)) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={((currentTaskObj.subtasks?.filter(s => s.completed).length || 0) / (currentTaskObj.subtasks?.length || 1)) * 100}
                            className="h-2 bg-white/5"
                          />
                        </div>

                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Sub-task Checklist</label>
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1 min-h-[150px]">
                          {(!currentTaskObj.subtasks || currentTaskObj.subtasks.length === 0) ? (
                            <div className="text-center py-8 text-xs text-white/30 italic">No sub-tasks yet. Add one below!</div>
                          ) : (
                            currentTaskObj.subtasks.map((sub) => (
                              <div
                                key={sub.id}
                                className="group flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                              >
                                <button
                                  onClick={() => handleToggleSubtask(sub.id)}
                                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${sub.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 bg-transparent"}`}>
                                    {sub.completed && <span className="text-[10px] font-bold">✓</span>}
                                  </div>
                                  <span className={`text-xs font-semibold truncate ${sub.completed ? "line-through text-white/30" : "text-white/80"}`}>
                                    {sub.title}
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSubtask(sub.id)}
                                  className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                >
                                  <Icons.trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={handleAddSubtask} className="mt-4 pt-3 border-t border-white/5">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Quick add sub-task..."
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              className="h-9 bg-white/5 border-white/10 text-xs text-white placeholder-white/20 focus-visible:ring-emerald-500 rounded-xl"
                            />
                            <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 px-3">
                              <Icons.plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl text-white/30 text-xs italic">
                        Select a task above to manage sub-tasks inside Zen Mode.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="dump" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none">
                    <form onSubmit={handleAddDumpNote} className="mb-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Jot down a fleeting thought..."
                          value={brainDumpText}
                          onChange={(e) => setBrainDumpText(e.target.value)}
                          className="h-9 bg-white/5 border-white/10 text-xs text-white placeholder-white/20 focus-visible:ring-emerald-500 rounded-xl"
                        />
                        <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 px-3" title="Dump Note">
                          <Icons.plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>

                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Fleeting Thoughts ({brainDumpNotes.length})</label>
                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1 min-h-[150px]">
                      {brainDumpNotes.length === 0 ? (
                        <div className="text-center py-12 text-xs text-white/30 italic px-4 leading-relaxed">
                          "Empty your mind, be formless, shapeless, like water."<br/>
                          <span className="text-[9px] opacity-60 mt-1 block">— Zen Quote</span>
                        </div>
                      ) : (
                        brainDumpNotes.map((note, idx) => (
                          <div
                            key={idx}
                            className="group flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/5 transition-all text-left"
                          >
                            <span className="text-xs text-white/80 font-medium leading-relaxed">{note}</span>
                            <div className="flex justify-end gap-1.5 pt-1.5 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleConvertDumpToTask(idx, note)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-350 font-bold uppercase tracking-wider flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10"
                                title="Convert note to active task"
                              >
                                <Icons.sprout className="w-3 h-3" /> Task
                              </button>
                              <button
                                onClick={() => handleDeleteDumpNote(idx)}
                                className="text-white/30 hover:text-red-400 p-0.5"
                                title="Delete note"
                              >
                                <Icons.trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* CENTER PANEL (Timer, Breathing guide) */}
            <div className="flex-1 flex flex-col items-center justify-center relative h-full">
              
              {/* Dynamic Breathing Circle behind/under the timer */}
              {isBreathingPacerActive ? (
                <div className="relative flex flex-col items-center justify-center w-80 h-80 sm:w-96 sm:h-96">
                  {/* Expanding and contracting breathing ring */}
                  {(() => {
                    const transitionMs = 
                      breathingPhase === "inhale" 
                        ? (breathingPattern === "coherence" ? 5000 : 4000) 
                        : breathingPhase === "exhale" 
                          ? (breathingPattern === "relax" ? 8000 : breathingPattern === "coherence" ? 5000 : 4000) 
                          : 1000
                    return (
                      <>
                        <div
                          className={`absolute inset-0 rounded-full border border-emerald-500/20 bg-emerald-500/5 transition-all ease-in-out transform ${
                            breathingPhase === "inhale" || breathingPhase === "hold1" ? "scale-110 blur-sm bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.25)]" : "scale-90 blur-none bg-emerald-500/5"
                          }`}
                          style={{ transitionDuration: `${transitionMs}ms` }}
                        />
                        <div
                          className={`absolute inset-16 sm:inset-20 rounded-full bg-slate-900 border border-white/5 flex flex-col items-center justify-center shadow-2xl transition-all ease-in-out transform ${
                            breathingPhase === "inhale" || breathingPhase === "hold1" ? "scale-105" : "scale-95"
                          }`}
                          style={{ transitionDuration: `${transitionMs}ms` }}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-1">Breathing Guide</span>
                          <span className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase transition-all duration-300">
                            {breathingPhase === "inhale" && "Breathe In"}
                            {breathingPhase === "hold1" && "Hold"}
                            {breathingPhase === "exhale" && "Breathe Out"}
                            {breathingPhase === "hold2" && "Hold"}
                          </span>
                          <span className="text-3xl font-bold font-mono text-emerald-400 mt-2">{breathingSecondsLeft}s</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                /* Standard circular progress timer display */
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${isActive ? (isBreak ? "bg-emerald-400" : "bg-blue-500") : "bg-white/10"}`} />
                  
                  <div className="absolute inset-8 sm:inset-10 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-center shadow-2xl">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">
                      {isBreak ? "Rest Phase" : isActive ? "Concentrating" : "Timer Paused"}
                    </span>
                    <span className="text-5xl sm:text-7xl font-thin text-white tracking-tighter tabular-nums leading-none">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs text-white/30 font-medium mt-3">{Math.round(progress)}% complete</span>
                  </div>

                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                      className={`transition-all duration-500 ${isBreak ? "text-emerald-500" : "text-blue-500"}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {isBreathingPacerActive && (
                <div className="mt-6 flex bg-white/5 border border-white/5 p-1 rounded-xl pointer-events-auto z-20">
                  {[
                    { id: "box", label: "Box (4s)" },
                    { id: "relax", label: "Relax (4-7-8)" },
                    { id: "coherence", label: "Coherent (5s)" }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setBreathingPattern(p.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        breathingPattern === p.id 
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Central Timer controls */}
              <div className="flex items-center gap-6 mt-8 relative z-20">
                {!isActive ? (
                  <Button
                    onClick={handleStart}
                    variant="ghost"
                    className="text-white hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full w-14 h-14 p-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                    title="Start Timer"
                  >
                    <Icons.play className="w-6 h-6 ml-0.5 text-emerald-400" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    variant="ghost"
                    className="text-white hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-full w-14 h-14 p-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                    title="Pause Timer"
                  >
                    <Icons.pause className="w-6 h-6 text-amber-400" />
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="text-white/50 hover:text-white hover:bg-white/5 border border-white/10 rounded-full w-12 h-12 p-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  title="Reset Timer"
                >
                  <Icons.reset className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/10 rounded-full w-12 h-12 p-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  title="Skip Phase"
                >
                  <Icons.skip className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* RIGHT DRAWER (Music and Ambient control panel) */}
            <div className={`relative z-20 h-full w-96 bg-slate-950/70 border border-white/5 backdrop-blur-2xl rounded-3xl p-5 flex flex-col justify-between transition-all duration-500 transform ${isZenMusicOpen ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0 pointer-events-none absolute"}`}>
              {(() => {
                const {
                  isPlaying: musicPlaying,
                  setIsPlaying: setMusicPlaying,
                  currentTrack: activeMusic,
                  setCurrentTrack: setActiveMusic,
                  volume: musicVol,
                  setVolume: setMusicVol,
                  activeCategory: musicCat,
                  setActiveCategory: setMusicCat,
                  recentlyPlayed: recents,
                  activeAmbients,
                  toggleAmbient,
                  setAmbientVolumeSingle,
                  clearAllAmbients,
                  savedPresets,
                  saveAudioPreset,
                  loadAudioPreset,
                  deleteAudioPreset,
                } = useMusicStore()

                const handleToggleMusicPlay = () => {
                  if (activeMusic) {
                    // Trigger the playback change using document events or direct store setting
                    // But wait, the actual Audio or YouTube player element resides inside FocusMusicPlayer
                    // and listens to store states! So just toggling the state 'isPlaying' in the store
                    // will automatically trigger the useEffect inside FocusMusicPlayer to play or pause!
                    // This is a direct benefit of the unified Zustand store state sync!
                    setMusicPlaying(!musicPlaying)
                  } else {
                    // Default to first track
                    const track = MUSIC_OPTIONS.find(t => t.category === "focus")
                    if (track) {
                      setActiveMusic(track)
                      setMusicPlaying(true)
                    }
                  }
                }

                const handleToggleAmbient = (track: MusicTrack) => {
                  toggleAmbient(track.name)
                }

                const handleSelectFocusTrack = (track: MusicTrack) => {
                  setActiveMusic(track)
                  setMusicPlaying(true)
                }

                const handleStopFocusMusic = () => {
                  setMusicPlaying(false)
                  setActiveMusic(null)
                }

                return (
                  <div className="flex flex-col min-h-0 flex-1">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Icons.music className="text-emerald-400 w-4 h-4" />
                        Audio Sanctuary
                      </h3>
                      <Badge variant="outline" className="text-white/40 border-white/10">Mixer</Badge>
                    </div>

                    <Tabs defaultValue="tracks" className="flex-1 flex flex-col min-h-0">
                      <TabsList className="grid grid-cols-3 bg-white/5 border border-white/5 rounded-xl p-1 mb-4 h-9">
                        <TabsTrigger value="tracks" className="text-xs text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg h-7 font-semibold">🎵 Music</TabsTrigger>
                        <TabsTrigger value="ambient" className="text-xs text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg h-7 font-semibold">🍃 Mixer</TabsTrigger>
                        <TabsTrigger value="presets" className="text-xs text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg h-7 font-semibold">✨ Presets</TabsTrigger>
                      </TabsList>

                      <TabsContent value="tracks" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none">
                        {/* Music Category filter */}
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3 border-b border-white/5">
                          {(["focus", "zen", "relax", "energy", "nature", "instrumental"] as const).map((cat) => {
                            const active = musicCat === cat
                            return (
                              <button
                                key={cat}
                                onClick={() => setMusicCat(cat)}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                                  active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-transparent text-white/40 border-white/5 hover:text-white"
                                }`}
                              >
                                {cat}
                              </button>
                            )
                          })}
                        </div>

                        {/* Tracks list */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1 min-h-[140px]">
                          {MUSIC_OPTIONS.filter(m => m.category === musicCat).map((track) => {
                            const active = activeMusic?.name === track.name && musicPlaying
                            return (
                              <button
                                key={track.name}
                                onClick={() => handleSelectFocusTrack(track)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left group ${
                                  active
                                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                    : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${active ? "bg-emerald-500/25" : "bg-white/5"}`}>
                                  {track.icon || "🎵"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold truncate">{track.name}</div>
                                  <div className="text-[10px] text-white/30 truncate mt-0.5">{track.description}</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {/* Audio Controls */}
                        <div className="mt-4 pt-3.5 border-t border-white/5 bg-slate-900/40 p-3.5 rounded-2xl border border-white/5">
                          {activeMusic ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-lg animate-pulse">{activeMusic.icon || "🎧"}</span>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate max-w-[120px]">{activeMusic.name}</div>
                                    <div className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{activeMusic.category}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleMusicPlay}
                                    className="w-8 h-8 rounded-full bg-white/5 text-white hover:bg-white/10"
                                  >
                                    {musicPlaying ? <Icons.pause className="w-4 h-4" /> : <Icons.play className="w-4 h-4 ml-0.5" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleStopFocusMusic}
                                    className="w-8 h-8 rounded-full bg-white/5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    <Icons.stop className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Icons.volume className="w-3.5 h-3.5 text-white/40" />
                                <Slider
                                  value={musicVol}
                                  onValueChange={setMusicVol}
                                  max={100}
                                  className="flex-1"
                                />
                                <span className="text-[10px] font-mono text-white/40 w-6 text-right">{musicVol[0]}%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-white/30 italic">No focus music playing. Select a track above!</div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="ambient" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none">
                        {/* Soundscapes grid */}
                        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                          {[
                            { name: "Rain Sounds", icon: <Icons.cloudRain className="w-4 h-4" />, label: "Rain" },
                            { name: "Forest Sounds", icon: <Icons.tree className="w-4 h-4" />, label: "Forest" },
                            { name: "Ocean Waves", icon: <Icons.droplets className="w-4 h-4" />, label: "Ocean" },
                            { name: "Fireplace Sounds", icon: <Icons.sun className="w-4 h-4" />, label: "Fire" },
                            { name: "Zen Temple Ambient", icon: <Icons.sprout className="w-4 h-4" />, label: "Zen Drone" }
                          ].map((scape) => {
                            const active = activeAmbients[scape.name] !== undefined
                            return (
                              <button
                                key={scape.name}
                                onClick={() => toggleAmbient(scape.name)}
                                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center min-h-[58px] ${
                                  active
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg"
                                    : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                                }`}
                              >
                                {scape.icon}
                                <span className="text-[10px] mt-1 font-bold tracking-wide">{scape.label}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Ambient Volume controls for active sounds */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 mt-3 pr-1 max-h-[180px]">
                          {Object.keys(activeAmbients).length > 0 ? (
                            Object.keys(activeAmbients).map((name) => {
                              const vol = activeAmbients[name]
                              return (
                                <div key={name} className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                                  <div className="flex justify-between items-center text-[10px] font-semibold text-emerald-400">
                                    <span>{name}</span>
                                    <button
                                      onClick={() => toggleAmbient(name)}
                                      className="text-red-400 hover:text-red-300 animate-fade-in"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icons.volume className="w-3 h-3 text-white/40" />
                                    <Slider
                                      value={[vol]}
                                      onValueChange={(val) => setAmbientVolumeSingle(name, val[0])}
                                      max={100}
                                      className="flex-1"
                                    />
                                    <span className="text-[9px] font-mono text-white/40 w-5 text-right">{vol}%</span>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="text-center py-6 text-[11px] text-white/30 italic">No ambient sounds active. Turn some on above!</div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="presets" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none">
                        {/* Save Preset Form */}
                        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 space-y-2 mb-3">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-white/60">Save Current Mix</Label>
                          <div className="flex gap-2">
                            <Input
                              id="preset-name-input"
                              placeholder="Preset name (e.g. Cozy Study)"
                              className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/25 focus-visible:ring-emerald-500/50"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = (e.target as HTMLInputElement).value.trim()
                                  if (val) {
                                    saveAudioPreset(val)
                                    ;(e.target as HTMLInputElement).value = ""
                                    toast.success(`Preset "${val}" saved! ✨`)
                                  }
                                }
                              }}
                            />
                            <Button
                              onClick={() => {
                                const input = document.getElementById("preset-name-input") as HTMLInputElement
                                const val = input?.value.trim()
                                if (val) {
                                  saveAudioPreset(val)
                                  input.value = ""
                                  toast.success(`Preset "${val}" saved! ✨`)
                                } else {
                                  toast.error("Please enter a preset name")
                                }
                              }}
                              className="h-8 text-xs rounded-xl px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex-shrink-0"
                            >
                              Save
                            </Button>
                          </div>
                        </div>

                        {/* Presets List */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1 min-h-[140px]">
                          {savedPresets.length > 0 ? (
                            savedPresets.map((preset) => (
                              <div
                                key={preset.name}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 group transition-all"
                              >
                                <button
                                  onClick={() => {
                                    loadAudioPreset(preset)
                                    toast.success(`Loaded preset "${preset.name}"! 🎧`)
                                  }}
                                  className="flex-1 text-left min-w-0"
                                >
                                  <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                                  <div className="text-[9px] text-white/30 truncate mt-0.5">
                                    {preset.activeMusic?.name || "No music"} • {Object.keys(preset.activeAmbients).length} sounds
                                  </div>
                                </button>
                                <button
                                  onClick={() => {
                                    deleteAudioPreset(preset.name)
                                    toast.success(`Deleted preset "${preset.name}"`)
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete Preset"
                                >
                                  <Icons.trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-[11px] text-white/30 italic">No saved presets yet. Save current mix above!</div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )
              })()}
            </div>

          </div>

          {/* 3. BOTTOM PANEL (Focus Goal Status Indicator) */}
          <div className="relative z-20 flex justify-center w-full pb-2">
            <div className="flex items-center gap-6 px-6 py-2.5 bg-white/5 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-white/5 shadow-md text-xs font-semibold text-white/60">
              <span className="flex items-center gap-1.5"><Icons.target className="w-4 h-4 text-emerald-400" /> Goal: {completedSessionsToday}/{focusGoal || "—"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span>Phase: {isBreak ? "Break Time" : "Focus Groove"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span>Streak: {completedSessionsToday > 0 ? "Active 🔥" : "None"}</span>
            </div>
          </div>

        </div>
      )}

      {/* Harvest Completion Modal */}
      <Dialog open={showHarvestModal} onOpenChange={setShowHarvestModal}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-100 dark:border-slate-800 shadow-2xl rounded-3xl p-6 text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 mb-4 animate-bounce">
              <Icons.sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              Harvest Complete! 🌟
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">
              Focus Garden Rewards
            </p>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="card-zen p-4 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 flex flex-col items-center">
                <Icons.sun className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Sunlight</span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-300">+15</span>
              </div>
              <div className="card-zen p-4 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 flex flex-col items-center">
                <Icons.droplets className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Water</span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-300">+10</span>
              </div>
            </div>

            {/* Wisdom Quote */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif-luxury max-w-sm mx-auto">
              "Patience and persistence turn the smallest seeds into the mightiest trees."
            </div>

            {/* Reflection Note */}
            <div className="text-left space-y-2">
              <Label htmlFor="reflectionNote" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Reflection Note (Optional)
              </Label>
              <Textarea
                id="reflectionNote"
                placeholder="How did this session go? Any insights or breakthroughs?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs rounded-xl resize-none text-slate-800 dark:text-slate-200"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowHarvestModal(false)
                handleSkip()
              }}
              className="flex-1 rounded-xl text-xs font-bold"
            >
              Take a Break
            </Button>
            <Button
              onClick={() => {
                if (reflectionText.trim()) {
                  toast.success("Reflection saved! 📝", { description: "Your thoughts have been logged with this session." })
                }
                setShowHarvestModal(false)
                setReflectionText("")
                handleStart()
              }}
              className="flex-1 btn-organic text-xs font-bold shadow-md"
            >
              Focus Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
