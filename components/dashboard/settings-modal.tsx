"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useData } from "@/components/local-data-provider"
import { useTheme } from "next-themes"
import { Icons } from "@/components/icons"

interface SettingsModalProps {
  isOpen: boolean
  onCloseAction: () => void
}

export function SettingsModal({ isOpen, onCloseAction }: SettingsModalProps) {
  const { theme: currentTheme, setTheme: setThemeMode } = useTheme()
  const [aiStyle, setAiStyle] = useState("balanced")
  const [notifications, setNotifications] = useState("frequent")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { settings, updateSettings, exportData } = useData()
  const [displayName, setDisplayName] = useState<string>(settings.userName || "")
  const [tone, setTone] = useState<string>(settings.userTone || "balanced")
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const dataString = await exportData()
      if (!dataString) throw new Error("No data returned")

      const blob = new Blob([dataString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const dateStr = new Date().toISOString().split("T")[0]
      a.download = `planthesia-backup-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export failed", e)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setAiStyle(settings.aiStyle || "balanced")
      setNotifications(settings.notifications || "frequent")
      const savedTheme = settings.theme || "light"
      setIsDarkMode(savedTheme === "dark")
      if (settings.userName) {
        setDisplayName(settings.userName)
      }
      if (settings.tone) {
        setTone(settings.tone)
      }
      if (savedTheme !== currentTheme) {
        setThemeMode(savedTheme)
      }
    } else {
      // Initialize from current theme
      setIsDarkMode(currentTheme === "dark")
    }
  }, [isOpen, currentTheme, setThemeMode])

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked)
    const newTheme = checked ? "dark" : "light"
    setThemeMode(newTheme)
    // Save immediately
    const savedSettings = localStorage.getItem("appSettings")
    const settings = savedSettings ? JSON.parse(savedSettings) : {}
    settings.theme = newTheme
    localStorage.setItem("appSettings", JSON.stringify(settings))
  }

  const handleSaveChanges = () => {
    const localSettingsObj = { aiStyle, notifications, theme: isDarkMode ? "dark" : "light", userName: displayName, tone }
    localStorage.setItem("appSettings", JSON.stringify(localSettingsObj))

    // Also save to global data provider
    try {
      updateSettings({
        userName: displayName || null,
        userTone: tone || null
      })
    } catch (e) { }
    onCloseAction()
  }


  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-md w-full h-[85vh] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Settings</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 mt-1.5">
              Customize your BloomMind experience
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 py-6">
            {/* Display name (moved to top) */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Display name</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your name will be used in greetings and appreciation messages</p>
              </div>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* AI Communication Style */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Communication Style</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose how BloomMind communicates with you</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "motivational", label: "Motivational", icon: "🚀", desc: "Inspiring & energetic" },
                  { value: "balanced", label: "Balanced", icon: "⚖️", desc: "Mix of advice & motivation" },
                  { value: "analytical", label: "Analytical", icon: "📊", desc: "Data-focused & detailed" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAiStyle(option.value)}
                    className={`group w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${aiStyle === option.value
                      ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-400"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${aiStyle === option.value
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                      }`}>
                      <span className="text-lg">{option.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{option.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display name */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Display name</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your name will be used in greetings and appreciation messages</p>
              </div>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Tone selector */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Message tone</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose how appreciation messages sound</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'affectionate', label: 'Affectionate', desc: 'Warm & playful' },
                  { value: 'balanced', label: 'Balanced', desc: 'Friendly & neutral' },
                  { value: 'professional', label: 'Professional', desc: 'Polite & formal' },
                  { value: 'playful', label: 'Playful', desc: 'Cheeky & fun' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`group w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${tone === opt.value
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${tone === opt.value
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                      }`}>
                      <span className="text-sm font-medium">{opt.label[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{opt.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Notification Frequency</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Control how often you receive updates</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "frequent", label: "Frequent", icon: "📬", desc: "All updates" },
                  { value: "balanced", label: "Balanced", icon: "📭", desc: "Important only" },
                  { value: "minimal", label: "Minimal", icon: "🔇", desc: "Critical alerts only" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setNotifications(option.value)}
                    className={`group w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${notifications === option.value
                      ? "border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 dark:border-violet-400"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${notifications === option.value
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                      }`}>
                      <span className="text-lg">{option.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{option.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 p-4 rounded-xl">
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Dark Mode
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle light / dark theme</p>
              </div>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
              />
            </div>

            {/* Data Export */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 p-4 rounded-xl">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Data Backup
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Download a JSON copy of your garden</p>
              </div>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {isExporting ? <Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> : <Icons.download className="w-4 h-4 mr-2" />}
                Export
              </Button>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your preferences will be saved automatically and synced across your devices.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCloseAction}
              className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-xl py-2.5 text-slate-600 dark:text-slate-400 transition-all duration-150"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-2.5 shadow-sm hover:shadow-md transition-all duration-150"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
