"use client"

import { useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import {
  generateRecurrenceInstances,
  type RecurrencePattern,
  type Task,
} from "@/lib/task-utils"

/**
 * Hook for managing recurring tasks.
 * Handles creation and management of recurring task instances.
 */
export function useRecurringTasks() {
  const { addTask, tasks, updateTask } = useData()

  /**
   * Create a recurring task and its instances.
   * @param baseTask - The task to create with recurrence
   * @param pattern - The recurrence pattern
   * @param numDaysAhead - How many days ahead to generate instances (default: 90)
   */
  const createRecurringTask = useCallback(
    async (
      baseTask: Omit<Task, "id" | "createdAt">,
      pattern: RecurrencePattern,
      numDaysAhead: number = 90,
    ) => {
      if (pattern.type === "none") {
        // No recurrence, just create a regular task
        await addTask(baseTask)
        return
      }

      // Create the first/parent instance
      const now = new Date().toISOString()
      const firstInstance = await addTask({
        ...baseTask,
        recurrence: pattern,
        createdAt: now,
      })

      // Generate future instances
      const startDate = baseTask.dueDate || new Date().toISOString().split("T")[0]
      const instanceDates = generateRecurrenceInstances(
        startDate,
        pattern,
        startDate,
        numDaysAhead,
      )

      // Skip the first date as we already created that instance
      for (let i = 1; i < instanceDates.length; i++) {
        await addTask({
          ...baseTask,
          dueDate: instanceDates[i],
          parentTaskId: "", // Would be filled with parent task ID in real implementation
          recurrence: { type: "none" },
          createdAt: now,
        })
      }
    },
    [addTask],
  )

  /**
   * Update a recurring task pattern.
   * Optionally regenerate future instances.
   */
  const updateRecurringPattern = useCallback(
    async (
      taskId: string,
      newPattern: RecurrencePattern,
      regenerateFutureInstances: boolean = true,
    ) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      await updateTask(taskId, { recurrence: newPattern })

      if (regenerateFutureInstances && newPattern.type !== "none") {
        // In a real implementation, this would:
        // 1. Delete future instances of this recurring task
        // 2. Regenerate new instances based on the new pattern
        // For now, we just update the pattern
      }
    },
    [tasks, updateTask],
  )

  /**
   * Delete a recurring task and all its instances.
   */
  const deleteRecurringTask = useCallback(
    async (parentTaskId: string) => {
      // Find and delete all instances of this recurring task
      const instancesOfTask = tasks.filter(
        (t) => t.parentTaskId === parentTaskId || t.id === parentTaskId,
      )

      for (const instance of instancesOfTask) {
        // In real implementation, this would call deleteTask
        await updateTask(instance.id, { completed: true })
      }
    },
    [tasks, updateTask],
  )

  /**
   * Get all instances of a recurring task.
   */
  const getRecurringTaskInstances = useCallback(
    (parentTaskId: string) => {
      return tasks.filter(
        (t) => t.parentTaskId === parentTaskId || (t.id === parentTaskId && t.recurrence?.type !== "none"),
      )
    },
    [tasks],
  )

  /**
   * Auto-generate upcoming instances for active recurring tasks.
   * Should be called periodically (e.g., on app load).
   */
  const refreshRecurringInstances = useCallback(async () => {
    const recurringTasks = tasks.filter((t) => t.recurrence?.type !== "none")

    for (const task of recurringTasks) {
      if (!task.recurrence || task.recurrence.type === "none") continue

      const instanceDates = generateRecurrenceInstances(
        task.dueDate || task.createdAt.split("T")[0],
        task.recurrence,
        new Date().toISOString().split("T")[0],
        30, // Look 30 days ahead
      )

      // Create instances that don't yet exist
      for (const date of instanceDates) {
        const existingInstance = tasks.find(
          (t) => t.parentTaskId === task.id && t.dueDate === date,
        )
        if (!existingInstance) {
          await addTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            completed: false,
            dueDate: date,
            parentTaskId: task.id,
            recurrence: { type: "none" },
            createdAt: new Date().toISOString(),
          })
        }
      }
    }
  }, [tasks, addTask])

  return {
    createRecurringTask,
    updateRecurringPattern,
    deleteRecurringTask,
    getRecurringTaskInstances,
    refreshRecurringInstances,
  }
}
