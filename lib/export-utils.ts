/**
 * Data export utilities for exporting user data in various formats.
 * Supports JSON and CSV formats for different data types.
 */

import type { Task, PomodoroSession, UserSettings, CustomTrack } from "@/components/local-data-provider"

export interface ExportData {
  version: string
  exportDate: string
  tasks: Task[]
  pomodoros: PomodoroSession[]
  settings: UserSettings
  customTracks: CustomTrack[]
}

/**
 * Generate JSON export of all user data.
 */
export function generateJsonExport(
  tasks: Task[],
  pomodoros: PomodoroSession[],
  settings: UserSettings,
  customTracks: CustomTrack[],
): string {
  const data: ExportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    tasks,
    pomodoros,
    settings,
    customTracks,
  }

  return JSON.stringify(data, null, 2)
}

/**
 * Generate CSV export of tasks.
 */
export function generateTasksCsv(tasks: Task[]): string {
  const headers = [
    "Title",
    "Description",
    "Category",
    "Priority",
    "Status",
    "Created Date",
    "Due Date",
    "Completed Date",
  ]

  const rows = tasks.map((task) => [
    `"${task.title.replace(/"/g, '""')}"`, // Escape quotes
    `"${(task.description || "").replace(/"/g, '""')}"`,
    task.category,
    task.priority,
    task.completed ? "Completed" : "Pending",
    new Date(task.createdAt).toLocaleDateString(),
    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
    task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "",
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

/**
 * Generate CSV export of pomodoro sessions.
 */
export function generatePomodorosCsv(pomodoros: PomodoroSession[]): string {
  const headers = ["Date", "Start Time", "End Time", "Duration (min)", "Status", "Task ID"]

  const rows = pomodoros.map((session) => {
    const start = new Date(session.startTime)
    const startDate = start.toLocaleDateString()
    const startTime = start.toLocaleTimeString()
    const endTime = session.endTime ? new Date(session.endTime).toLocaleTimeString() : ""

    return [
      startDate,
      startTime,
      endTime,
      session.duration,
      session.completed ? "Completed" : "Incomplete",
      session.taskId || "",
    ]
  })

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

/**
 * Generate productivity summary CSV.
 */
export function generateProductivitySummaryCsv(
  tasks: Task[],
  pomodoros: PomodoroSession[],
): string {
  // Group by week
  const weeks = new Map<string, { tasks: number; completed: number; pomodoros: number }>()

  tasks.forEach((task) => {
    const date = new Date(task.createdAt)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, { tasks: 0, completed: 0, pomodoros: 0 })
    }

    const week = weeks.get(weekKey)!
    week.tasks++
    if (task.completed) week.completed++
  })

  pomodoros.forEach((session) => {
    const date = new Date(session.startTime)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, { tasks: 0, completed: 0, pomodoros: 0 })
    }

    const week = weeks.get(weekKey)!
    if (session.completed) week.pomodoros++
  })

  const headers = ["Week Starting", "Total Tasks", "Completed Tasks", "Focus Sessions", "Completion Rate (%)"]

  const rows = Array.from(weeks.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([weekKey, data]) => {
      const rate = data.tasks > 0 ? Math.round((data.completed / data.tasks) * 100) : 0
      return [weekKey, data.tasks, data.completed, data.pomodoros, rate]
    })

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

/**
 * Download data as file.
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export all data as ZIP file (requires additional library).
 * For now, returns multiple exports.
 */
export function generateMultipleExports(
  tasks: Task[],
  pomodoros: PomodoroSession[],
  settings: UserSettings,
  customTracks: CustomTrack[],
) {
  const dateStr = new Date().toISOString().split("T")[0]

  return {
    json: {
      content: generateJsonExport(tasks, pomodoros, settings, customTracks),
      filename: `midori-backup-${dateStr}.json`,
    },
    tasksCsv: {
      content: generateTasksCsv(tasks),
      filename: `midori-tasks-${dateStr}.csv`,
    },
    pomodorosCsv: {
      content: generatePomodorosCsv(pomodoros),
      filename: `midori-pomodoros-${dateStr}.csv`,
    },
    summaryCsv: {
      content: generateProductivitySummaryCsv(tasks, pomodoros),
      filename: `midori-summary-${dateStr}.csv`,
    },
  }
}
