/**
 * Task utilities for handling recurring tasks, patterns, and scheduling logic.
 */

export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "custom"

export interface RecurrencePattern {
  type: RecurrenceType
  interval?: number // For custom recurrence (every N days)
  daysOfWeek?: number[] // 0-6 for weekly/biweekly (0=Sunday)
  dayOfMonth?: number // 1-31 for monthly
  endDate?: string // ISO string, when recurrence should stop
  maxOccurrences?: number // Total number of occurrences to create
}

/**
 * Generate recurring task instances for a given time period.
 * Returns array of task start dates (ISO strings).
 */
export function generateRecurrenceInstances(
  startDate: string,
  pattern: RecurrencePattern,
  fromDate: string = new Date().toISOString().split("T")[0],
  numDays: number = 90,
): string[] {
  if (pattern.type === "none") return []

  const instances: string[] = []
  const start = new Date(startDate)
  const from = new Date(fromDate + "T00:00:00Z")
  const until = new Date(from.getTime() + numDays * 24 * 60 * 60 * 1000)

  let current = new Date(start)
  let occurrenceCount = 0

  // Check end conditions
  const hasEndDate = pattern.endDate ? new Date(pattern.endDate) : null
  const hasMaxOccurrences = pattern.maxOccurrences ? pattern.maxOccurrences : Infinity

  while (current <= until && occurrenceCount < hasMaxOccurrences) {
    if (hasEndDate && current > hasEndDate) break
    if (current >= from) {
      instances.push(current.toISOString().split("T")[0])
      occurrenceCount++
    }

    // Calculate next occurrence
    switch (pattern.type) {
      case "daily":
        current.setDate(current.getDate() + 1)
        break

      case "weekly":
        current.setDate(current.getDate() + 7)
        break

      case "biweekly":
        current.setDate(current.getDate() + 14)
        break

      case "monthly":
        if (pattern.dayOfMonth) {
          current.setMonth(current.getMonth() + 1)
          current.setDate(pattern.dayOfMonth)
        } else {
          current.setMonth(current.getMonth() + 1)
        }
        break

      case "custom":
        if (pattern.interval) {
          current.setDate(current.getDate() + pattern.interval)
        }
        break

      default:
        break
    }
  }

  return instances
}

/**
 * Get human-readable recurrence description.
 */
export function getRecurrenceDescription(pattern: RecurrencePattern): string {
  switch (pattern.type) {
    case "none":
      return "No recurrence"
    case "daily":
      return "Every day"
    case "weekly":
      return "Every week"
    case "biweekly":
      return "Every two weeks"
    case "monthly":
      return pattern.dayOfMonth ? `Monthly on the ${pattern.dayOfMonth}th` : "Monthly"
    case "custom":
      return pattern.interval ? `Every ${pattern.interval} days` : "Custom"
    default:
      return "Unknown"
  }
}

/**
 * Check if a date matches a recurrence pattern.
 */
export function dateMatchesRecurrence(date: string, pattern: RecurrencePattern, originalDate: string): boolean {
  if (pattern.type === "none") return false

  const target = new Date(date + "T00:00:00Z")
  const original = new Date(originalDate + "T00:00:00Z")
  const diffDays = Math.floor((target.getTime() - original.getTime()) / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return false

  switch (pattern.type) {
    case "daily":
      return true
    case "weekly":
      return diffDays % 7 === 0
    case "biweekly":
      return diffDays % 14 === 0
    case "monthly":
      return target.getDate() === (pattern.dayOfMonth || original.getDate())
    case "custom":
      return pattern.interval ? diffDays % pattern.interval === 0 : false
    default:
      return false
  }
}

/**
 * Calculate the next occurrence date after a given date.
 */
export function getNextRecurrenceDate(
  currentDate: string,
  pattern: RecurrencePattern,
  originalDate: string,
): string | null {
  if (pattern.type === "none") return null

  const instances = generateRecurrenceInstances(
    originalDate,
    pattern,
    currentDate,
    365, // Look ahead 1 year
  )

  return instances.length > 0 ? instances[0] : null
}
