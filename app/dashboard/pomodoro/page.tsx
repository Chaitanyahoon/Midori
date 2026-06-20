"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { FocusMusicPlayer } from "@/components/dashboard/focus-music-player"
import { SakuraParticles } from "@/components/dashboard/sakura-particles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePomodoro } from "@/lib/hooks/usePomodoro"

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

  const { tasks, pomodoros } = useData()

  const [isZenMode, setIsZenMode] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

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
                      (p) => p.completed && p.startTime.split("T")[0] === dateString,
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
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="absolute inset-0 washi-overlay pointer-events-none opacity-20" />
          <SakuraParticles count={15} opacity={0.25} className="absolute inset-0 pointer-events-none" />

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
          </div>

          <Button
            onClick={toggleZenMode}
            variant="ghost"
            className="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Icons.close className="w-6 h-6 mr-2" />
            Exit Zen Mode
          </Button>

          <div className="relative z-10 flex flex-col items-center gap-16 max-w-4xl w-full">

            {/* Main Timer Display */}
            <div className="relative group cursor-default">
              {/* Breathing Glow */}
              <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 ${isActive ? "bg-emerald-500/20 scale-125 opacity-100" : "bg-blue-500/10 scale-100 opacity-50"
                }`} />

              <div className="relative flex flex-col items-center justify-center">
                <span className={`text-7xl sm:text-8xl md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-thin text-white/95 tabular-nums tracking-tighter leading-none transition-all duration-500 ${isActive ? (isBreak ? "drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-105" : "drop-shadow-[0_0_40px_rgba(245,158,11,0.3)] scale-105") : "drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-100"}`}>
                  {formatTime(timeLeft)}
                </span>
                <p className="text-sm sm:text-lg md:text-xl text-emerald-400/60 font-medium tracking-[0.2em] uppercase mt-4 animate-pulse">
                  {isBreak ? "Rest Phase" : isActive ? "Focusing..." : "Ready"}
                </p>
              </div>
            </div>

            {/* Minimal Timer Controls */}
            <div className="flex items-center gap-8 z-10">
              {!isActive ? (
                <Button
                  onClick={handleStart}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-emerald-500/10 hover:text-emerald-400 rounded-full w-20 h-20 p-0 flex items-center justify-center border border-white/10 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-emerald-500/10"
                >
                  <Icons.play className="w-8 h-8 ml-1 text-emerald-400" />
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-amber-500/10 hover:text-amber-400 rounded-full w-20 h-20 p-0 flex items-center justify-center border border-white/10 hover:border-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-amber-500/10"
                >
                  <Icons.pause className="w-8 h-8 text-amber-400" />
                </Button>
              )}

              <Button
                onClick={handleReset}
                variant="ghost"
                className="text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-full w-14 h-14 p-0 border border-transparent hover:border-rose-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
                title="Reset Session"
              >
                <Icons.reset className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full w-14 h-14 p-0 border border-transparent hover:border-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
                title="Skip Session"
              >
                <Icons.skip className="w-5 h-5" />
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
