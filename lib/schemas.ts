/**
 * Centralized validation schemas using Zod.
 * Ensures type-safe data validation across the entire application.
 */

import { z } from "zod"

// ============================================================================
// TASK SCHEMAS
// ============================================================================

export const RecurrencePatternSchema = z.object({
  type: z.enum(["none", "daily", "weekly", "biweekly", "monthly", "custom"]).default("none"),
  interval: z.number().int().min(1).max(365).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  endDate: z.string().datetime().optional(),
  maxOccurrences: z.number().int().min(1).optional(),
})

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  completed: z.boolean().default(false),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.enum(["work", "personal", "learning", "health"]).default("personal"),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)").optional(),
  recurrence: RecurrencePatternSchema.optional(),
  parentTaskId: z.string().optional(),
})

export const TaskCreateSchema = TaskSchema.omit({ id: true, createdAt: true })
export const TaskUpdateSchema = TaskSchema.partial().omit({ id: true, createdAt: true })

// ============================================================================
// POMODORO SESSION SCHEMAS
// ============================================================================

export const PomodoroSessionSchema = z.object({
  id: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().min(1).max(240),
  taskId: z.string().optional(),
  completed: z.boolean().default(false),
})

export const PomodoroSessionCreateSchema = PomodoroSessionSchema.omit({ id: true })
export const PomodoroSessionUpdateSchema = PomodoroSessionSchema.partial().omit({ id: true })

// ============================================================================
// USER SETTINGS SCHEMAS
// ============================================================================

export const UserSettingsSchema = z.object({
  userName: z.string().max(100).nullable().default(null),
  userTone: z.enum(["casual", "formal", "balanced", "energetic", "calm"]).nullable().default(null),
  aiStyle: z.enum(["brief", "detailed", "balanced"]).nullable().default(null),
  notifications: z.enum(["off", "minimal", "frequent", "all"]).nullable().default(null),
  dailyGoalTasks: z.number().int().min(1).max(100).default(5),
  dailyGoalPomodoros: z.number().int().min(1).max(50).default(6),
  dailyGoalHours: z.number().int().min(1).max(12).default(3),
})

export const UserSettingsUpdateSchema = UserSettingsSchema.partial()

// ============================================================================
// CUSTOM TRACK SCHEMAS
// ============================================================================

export const CustomTrackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  url: z.string().url(),
  category: z.enum(["focus", "relax", "energy", "nature", "instrumental"]),
  addedAt: z.string().datetime(),
})

export const CustomTrackCreateSchema = CustomTrackSchema.omit({ id: true, addedAt: true })

// ============================================================================
// USER STATS SCHEMAS
// ============================================================================

export const UserStatsSchema = z.object({
  totalTasks: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  totalPomodoros: z.number().int().min(0),
  totalFocusTime: z.number().int().min(0),
  streak: z.number().int().min(0),
  lastActiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// ============================================================================
// EXPORT DATA SCHEMAS
// ============================================================================

export const ExportDataSchema = z.object({
  version: z.string(),
  exportDate: z.string().datetime(),
  tasks: z.array(TaskSchema),
  pomodoros: z.array(PomodoroSessionSchema),
  settings: UserSettingsSchema,
  customTracks: z.array(CustomTrackSchema),
})

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

export const GrowthAiRequestSchema = z.object({
  message: z.string().min(1).max(1000).optional(),
  intent: z.enum(["schedule", "chat"]).default("chat"),
  context: z.object({
    userName: z.string().optional(),
    userTone: z.string().optional(),
    todayTasks: z.number().optional(),
    todayPomodoros: z.number().optional(),
    completionRate: z.number().optional(),
    pendingTasks: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        category: z.string(),
      })
    ).optional(),
  }).optional(),
})

export const SuggestedTaskSchema = z.object({
  title: z.string().min(1).max(200),
  duration: z.number().int().min(5).max(240),
  time: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["work", "personal", "learning", "health"]),
  originalId: z.string().optional(),
})

export const GrowthAiResponseSchema = z.object({
  response: z.string(),
  taskSuggestions: z.array(SuggestedTaskSchema).default([]),
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe parse with error handling
 */
export function safeTaskParse(data: unknown) {
  const result = TaskSchema.safeParse(data)
  if (!result.success) {
    console.error("Task validation error:", result.error.flatten())
    return null
  }
  return result.data
}

/**
 * Validate task creation data
 */
export function validateTaskCreate(data: unknown) {
  return TaskCreateSchema.safeParse(data)
}

/**
 * Validate pomodoro creation data
 */
export function validatePomodoroCreate(data: unknown) {
  return PomodoroSessionCreateSchema.safeParse(data)
}

/**
 * Validate user settings update
 */
export function validateSettingsUpdate(data: unknown) {
  return UserSettingsUpdateSchema.safeParse(data)
}

/**
 * Validate growth AI response
 */
export function validateAiResponse(data: unknown) {
  return GrowthAiResponseSchema.safeParse(data)
}

/**
 * Validate export data integrity
 */
export function validateExportData(data: unknown) {
  return ExportDataSchema.safeParse(data)
}

// ============================================================================
// TYPE EXPORTS (for TypeScript)
// ============================================================================

export type Task = z.infer<typeof TaskSchema>
export type TaskCreate = z.infer<typeof TaskCreateSchema>
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>

export type PomodoroSession = z.infer<typeof PomodoroSessionSchema>
export type PomodoroSessionCreate = z.infer<typeof PomodoroSessionCreateSchema>
export type PomodoroSessionUpdate = z.infer<typeof PomodoroSessionUpdateSchema>

export type UserSettings = z.infer<typeof UserSettingsSchema>
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>

export type CustomTrack = z.infer<typeof CustomTrackSchema>
export type CustomTrackCreate = z.infer<typeof CustomTrackCreateSchema>

export type UserStats = z.infer<typeof UserStatsSchema>

export type ExportData = z.infer<typeof ExportDataSchema>

export type GrowthAiRequest = z.infer<typeof GrowthAiRequestSchema>
export type GrowthAiResponse = z.infer<typeof GrowthAiResponseSchema>
export type SuggestedTask = z.infer<typeof SuggestedTaskSchema>
