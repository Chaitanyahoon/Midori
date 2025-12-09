"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"
import { FocusMusicPlayer } from "@/components/dashboard/focus-music-player"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string>("general")
  const [sessionNote, setSessionNote] = useState("")
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [focusGoal, setFocusGoal] = useState(4)
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("pomodoroSettings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed.settings || settings)
      setAutoStartBreaks(parsed.autoStartBreaks || false)
      setAutoStartPomodoros(parsed.autoStartPomodoros || false)
      setSoundEnabled(parsed.soundEnabled !== false)
      setFocusGoal(parsed.focusGoal || 4)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(
      "pomodoroSettings",
      JSON.stringify({
        settings,
        autoStartBreaks,
        autoStartPomodoros,
        soundEnabled,
        focusGoal,
      }),
    )
  }, [settings, autoStartBreaks, autoStartPomodoros, soundEnabled, focusGoal])

  const [isZenMode, setIsZenMode] = useState(false)

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

  const { tasks, pomodoros, addPomodoro } = useData()
  const { toast } = useToast()

  const pendingTasks = tasks.filter((task) => !task.completed)
  const todaySessions = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  })

  const completedSessionsToday = todaySessions.length
  const isLongBreakTime = completedSessionsToday > 0 && completedSessionsToday % settings.sessionsUntilLongBreak === 0

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate encouraging compliments
  const getCompliment = () => {
    const compliments = [
      "Good work, sunshine!",
      "You're doing amazing, champ!",
      "Keep it up, superstar!",
      "You're on fire today!",
      "Fantastic work, rockstar!",
      "You're crushing it!",
      "Amazing progress, warrior!",
      "You're unstoppable!",
      "Brilliant work, champion!",
      "You're a productivity machine!",
      "Outstanding effort, hero!",
      "You're absolutely killing it!",
    ]
    return compliments[Math.floor(Math.random() * compliments.length)]
  }

  const getSessionCompliment = (sessionCount: number) => {
    if (sessionCount >= 8) return "Incredible! You're a focus master!"
    if (sessionCount >= 6) return "Outstanding dedication today!"
    if (sessionCount >= 4) return "Great momentum, keep going!"
    if (sessionCount >= 2) return "Nice progress, you're building a great habit!"
    return "Great start! Every session counts!"
  }

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false)
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, timeLeft])

  const handleTimerComplete = () => {
    if (!isBreak && sessionStartTime) {
      // Complete focus session
      addPomodoro({
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        duration: settings.focusTime,
        taskId: selectedTask === "general" ? undefined : selectedTask,
        completed: true,
      })

      // Play completion sound if enabled
      if (soundEnabled) {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZVA4PVK3l77FbGAg+ltryy3kpBSl+zfLZiTYIG2m98OScTgwOUKjk8LZjGwY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVQOD1St5e+xWxgIPpba8st5KQUpfs3y2Yk2CBtpvfDknE4MDlCo5PC2YxsGOJHX8sx5LAUkd8fw3ZBACg==")
        audio.volume = 0.3
        audio.play().catch(() => { })
      }

      const newSessionCount = completedSessionsToday + 1
      toast({
        title: `${getCompliment()} 🌟`,
        description: `${getSessionCompliment(newSessionCount)} You've completed ${newSessionCount} ${newSessionCount === 1 ? 'session' : 'sessions'} today.`,
      })

      setIsBreak(true)
      const breakDuration = isLongBreakTime ? settings.longBreak : settings.shortBreak
      setTimeLeft(breakDuration * 60)
      setSessionNote("")

      // Auto-start break if enabled
      if (autoStartBreaks) {
        setTimeout(() => {
          setIsActive(true)
        }, 1000)
      }
    } else {
      // Break completed
      if (soundEnabled) {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZVA4PVK3l77FbGAg+ltryy3kpBSl+zfLZiTYIG2m98OScTgwOUKjk8LZjGwY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVQOD1St5e+xWxgIPpba8st5KQUpfs3y2Yk2CBtpvfDknE4MDlCo5PC2YxsGOJHX8sx5LAUkd8fw3ZBACg==")
        audio.volume = 0.3
        audio.play().catch(() => { })
      }

      const breakCompliments = [
        "You've earned this break!",
        "Well-deserved rest!",
        "Time to recharge and shine!",
        "You're building great habits!",
      ]
      toast({
        title: isLongBreakTime ? "Long break complete! 💪" : "Break complete! ⚡",
        description: `${breakCompliments[Math.floor(Math.random() * breakCompliments.length)]} Ready for another focused session?`,
      })

      setIsBreak(false)
      setTimeLeft(settings.focusTime * 60)

      // Auto-start next pomodoro if enabled
      if (autoStartPomodoros) {
        setTimeout(() => {
          setSessionStartTime(new Date().toISOString())
          setIsActive(true)
        }, 1000)
      }
    }

    setSessionStartTime(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCurrentSessionDuration = () => {
    if (isBreak) {
      return isLongBreakTime ? settings.longBreak * 60 : settings.shortBreak * 60
    }
    return settings.focusTime * 60
  }

  const totalTime = getCurrentSessionDuration()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const handleStart = () => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
    // Play start sound if enabled
    if (soundEnabled && !isBreak) {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZVA4PVK3l77FbGAg+ltryy3kpBSl+zfLZiTYIG2m98OScTgwOUKjk8LZjGwY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVQOD1St5e+xWxgIPpba8st5KQUpfs3y2Yk2CBtpvfDknE4MDlCo5PC2YxsGOJHX8sx5LAUkd8fw3ZBACg==")
      audio.volume = 0.2
      audio.play().catch(() => { })
    }
  }

  const handlePause = () => setIsActive(false)

  const handleReset = () => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimeLeft(getCurrentSessionDuration())
    setSessionStartTime(null)
  }

  const getSessionHistory = () => {
    return pomodoros
      .filter((session) => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  }

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return "General Focus"
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.title : "Deleted Task"
  }

  // Get task analytics
  const getTaskAnalytics = () => {
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
  }

  const taskAnalytics = getTaskAnalytics()

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
            Focus Grove
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Deep work sessions with guided focus and study music</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleZenMode}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
          >
            <Icons.layout className="w-4 h-4" />
            Zen Mode
          </Button>
          <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold border border-emerald-200 dark:border-emerald-700">
            <Icons.target className="w-3.5 h-3.5 mr-1.5" />
            {completedSessionsToday} Sessions Today
          </Badge>
          {focusGoal > 0 && (
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 text-sm font-semibold border border-blue-200 dark:border-blue-700">
              <Icons.target className="w-3.5 h-3.5 mr-1.5" />
              Goal: {completedSessionsToday}/{focusGoal}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-emerald-100/50 dark:border-slate-700 shadow-xl rounded-3xl overflow-hidden">
            {/* Header with status indicator */}
            <div className={`h-2 ${isBreak ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`}></div>

            <CardHeader className="text-center pb-6 pt-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`p-3 rounded-2xl ${isBreak ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                  <Icons.timer className={`w-6 h-6 ${isBreak ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isBreak ? (isLongBreakTime ? "Long Break" : "Short Break") : "Focus Session"}
                </CardTitle>
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
                <div className="relative w-56 h-56 mx-auto mb-8">
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
                  <div className="absolute inset-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl border-4 border-white/50 dark:border-slate-700/50">
                    <div className="text-center">
                      <span className="text-5xl font-bold text-gray-900 dark:text-gray-100 block leading-none">{formatTime(timeLeft)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {Math.round(progress)}% complete
                      </span>
                    </div>
                  </div>

                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-6">
                  <Progress value={progress} className="h-2.5 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{Math.round(progress)}%</span>
                    <span>{isBreak ? "Break Time" : "Focus Time"}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  {!isActive ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-10 py-6 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Icons.play className="w-5 h-5 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-10 py-6 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Icons.pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <Icons.reset className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Task Selection */}
              {!isBreak && (
                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-slate-200/50 dark:border-slate-700/50">
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
                      <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11">
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
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm resize-none"
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
          <FocusMusicPlayer isActive={isActive} isBreak={isBreak} />

          {/* Today's Stats */}
          <Card className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-900/10 backdrop-blur-sm border border-emerald-100/50 dark:border-emerald-800/50 shadow-lg rounded-2xl">
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
                  <div className="pt-4 mt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Focus Streak</span>
                      </div>
                      <Badge className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-1">
                        {streak} days
                      </Badge>
                    </div>
                  </div>
                ) : null
              })()}
            </CardContent>
          </Card>

          {/* Task Analytics */}
          <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 backdrop-blur-sm border border-blue-100/50 dark:border-blue-800/50 shadow-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Icons.insights className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Focus Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-left">
              {taskAnalytics.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No focus sessions yet</p>
              ) : (
                taskAnalytics.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/70 dark:bg-slate-700/50 rounded-xl border border-blue-100/50 dark:border-blue-800/50 hover:bg-white/90 dark:hover:bg-slate-700/70 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {task.sessions} sessions • {(task.totalTime / 60).toFixed(1)}h
                      </p>
                    </div>
                    <Badge className="bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold ml-3 px-2.5 py-1">
                      {task.sessions}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/10 backdrop-blur-sm border border-purple-100/50 dark:border-purple-800/50 shadow-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Icons.settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Timer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              {/* Timer Durations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.timer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timer Durations</h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Focus Time</label>
                    <Select
                      value={settings.focusTime.toString()}
                      onValueChange={(value) => {
                        const newFocusTime = Number.parseInt(value)
                        setSettings({ ...settings, focusTime: newFocusTime })
                        if (!isActive && !isBreak) {
                          setTimeLeft(newFocusTime * 60)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10">
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
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Short Break</label>
                      <Select
                        value={settings.shortBreak.toString()}
                        onValueChange={(value) => {
                          const newShortBreak = Number.parseInt(value)
                          setSettings({ ...settings, shortBreak: newShortBreak })
                          if (!isActive && isBreak && !isLongBreakTime) {
                            setTimeLeft(newShortBreak * 60)
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10">
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
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Long Break</label>
                      <Select
                        value={settings.longBreak.toString()}
                        onValueChange={(value) => {
                          const newLongBreak = Number.parseInt(value)
                          setSettings({ ...settings, longBreak: newLongBreak })
                          if (!isActive && isBreak && isLongBreakTime) {
                            setTimeLeft(newLongBreak * 60)
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10">
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
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Sessions Until Long Break
                    </label>
                    <Input
                      type="number"
                      min="2"
                      max="10"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: Number.parseInt(e.target.value) || 4 })}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="pt-3 border-t border-purple-200/50 dark:border-purple-800/50 space-y-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preferences</h4>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/50 dark:border-purple-800/50">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start Breaks</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Start break automatically</p>
                    </div>
                    <Switch checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/50 dark:border-purple-800/50">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start Pomodoros</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Start next session automatically</p>
                    </div>
                    <Switch checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros} />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/50 dark:border-purple-800/50">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Notifications</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Play sounds for events</p>
                    </div>
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>
                </div>
              </div>

              {/* Daily Goal */}
              <div className="pt-3 border-t border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily Goal</h4>
                </div>
                <div className="p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/50 dark:border-purple-800/50">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={focusGoal}
                    onChange={(e) => setFocusGoal(Number.parseInt(e.target.value) || 0)}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10 mb-2"
                    placeholder="Set daily goal"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {focusGoal > 0
                      ? `${completedSessionsToday} of ${focusGoal} sessions completed today`
                      : "Set a daily focus goal to track your progress"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Focus Tips & Motivation */}
      <Card className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-900/10 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/50 shadow-lg rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Icons.sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Focus Tips & Best Practices
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">Enhance your productivity with these proven strategies</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "💡", title: "Eliminate Distractions", text: "Close unnecessary tabs and apps to maintain deep focus" },
              { icon: "🌿", title: "Respect Your Breaks", text: "Take breaks seriously - they help maintain long-term focus" },
              { icon: "🎯", title: "Single Task Focus", text: "One task at a time - multitasking reduces productivity" },
              { icon: "📝", title: "Track Progress", text: "Use session notes to track what you accomplished" },
              { icon: "🎵", title: "Find Your Sound", text: "Experiment with different focus music to find what works" },
              { icon: "⏰", title: "Consistent Timing", text: "Stick to your pomodoro schedule for better results" },
            ].map((tip, i) => (
              <div
                key={i}
                className="group flex flex-col gap-2.5 p-3 bg-white/80 dark:bg-slate-700/60 rounded-xl border border-indigo-100/50 dark:border-indigo-800/50 hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    {tip.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tip.title}</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card className="bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-800 dark:to-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <TabsTrigger value="today" className="rounded-md">
                Today
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-md">
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-3">
              {todaySessions.length === 0 ? (
                <div className="text-center py-6">
                  <Icons.timer className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No sessions completed today yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todaySessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 bg-emerald-500 dark:bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Icons.timer className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{getTaskTitle(session.taskId)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {session.duration} min • {new Date(session.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500 dark:bg-emerald-600 text-white font-semibold">
                        ✓
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-3">
              {getSessionHistory().length === 0 ? (
                <div className="text-center py-6">
                  <Icons.timer className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No sessions completed yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {getSessionHistory().map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/50 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Icons.timer className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{getTaskTitle(session.taskId)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {session.duration} min • {new Date(session.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <Badge className="bg-blue-500 dark:bg-blue-600 text-white font-semibold">
                        {session.duration}m
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Zen Mode Overlay */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-slate-950 to-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-700" />
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
                <span className={`text-[12rem] md:text-[14rem] font-thin text-white/90 tabular-nums tracking-tighter leading-none transition-all duration-300 ${isActive ? "scale-105" : "scale-100"}`}>
                  {formatTime(timeLeft)}
                </span>
                <p className="text-xl text-emerald-400/60 font-medium tracking-[0.2em] uppercase mt-4 animate-pulse">
                  {isBreak ? "Rest Phase" : isActive ? "Focusing..." : "Ready"}
                </p>
              </div>
            </div>

            {/* Controls are moved inside the minimal player or kept minimal here? 
                Actually, the minimal player HAS play/pause. We should hide duplicate controls here 
                if we want the player to be the main controller, BUT the main timer logic is here.
                Let's KEEP the timer controls minimal below the timer, and let the music player handle music.
             */}

            {/* Minimal Timer Controls */}
            <div className="flex items-center gap-8">
              {!isActive ? (
                <Button
                  onClick={handleStart}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-20 h-20 p-0 flex items-center justify-center border border-white/10 hover:border-emerald-500/50 hover:scale-105 transition-all"
                >
                  <Icons.play className="w-10 h-10 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-20 h-20 p-0 flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:scale-105 transition-all"
                >
                  <Icons.pause className="w-10 h-10" />
                </Button>
              )}

              <Button
                onClick={handleReset}
                variant="ghost"
                className="text-white/40 hover:text-white hover:bg-white/10 rounded-full w-14 h-14 p-0 border border-transparent hover:border-white/10"
              >
                <Icons.reset className="w-6 h-6" />
              </Button>
            </div>

            {/* Minimal Music Player */}
            <div className="w-full max-w-md mt-8">
              <FocusMusicPlayer isActive={isActive} isBreak={isBreak} variant="zen" className="animate-in slide-in-from-bottom-4 duration-700 delay-200" />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
