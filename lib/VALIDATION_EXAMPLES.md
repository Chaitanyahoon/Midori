/**
 * VALIDATION USAGE EXAMPLES
 *
 * This file demonstrates how to use the Zod schemas throughout the application.
 * Copy these patterns into your components and API routes.
 */

// ============================================================================
// EXAMPLE 1: FORM VALIDATION WITH REACT-HOOK-FORM
// ============================================================================

/*
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TaskCreateSchema, validateTaskCreate } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function TaskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(TaskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "personal",
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    // Data is automatically validated by Zod
    const validation = validateTaskCreate(data)
    if (!validation.success) {
      console.error("Validation failed:", validation.error.flatten())
      return
    }

    // Use validated data
    const validData = validation.data
    console.log("Valid task:", validData)
    // Send to API...
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          {...register("title")}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <Textarea
          placeholder="Description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit">Create Task</Button>
    </form>
  )
}
*/

// ============================================================================
// EXAMPLE 2: API ROUTE WITH VALIDATION
// ============================================================================

/*
// app/api/tasks/route.ts

import { NextRequest } from "next/server"
import { TaskCreateSchema } from "@/lib/schemas"
import {
  validateRequestBody,
  apiJsonResponse,
  apiErrorResponse,
  withErrorHandling
} from "@/lib/api-validation"
import { db } from "@/lib/firebase/client"
import { addDoc, collection } from "firebase/firestore"

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Validate request body
    const { data, error } = await validateRequestBody(request, TaskCreateSchema)

    if (error) {
      return apiErrorResponse(error.message, error.status, error.details)
    }

    // Use validated data
    const newTask = {
      ...data,
      createdAt: new Date().toISOString(),
    }

    // Save to database
    const docRef = await addDoc(collection(db, "tasks"), newTask)

    return apiJsonResponse(
      { id: docRef.id, ...newTask },
      201,
    )
  }, { logErrors: true })
}
*/

// ============================================================================
// EXAMPLE 3: COMPONENT WITH FIELD VALIDATION
// ============================================================================

/*
"use client"

import { useState } from "react"
import { useFieldValidation } from "@/lib/hooks/useValidation"
import { TaskCreateSchema } from "@/lib/schemas"
import { Input } from "@/components/ui/input"

export function TaskTitleInput() {
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")
  const { validateField } = useFieldValidation(TaskCreateSchema)

  const handleChange = async (value: string) => {
    setTitle(value)

    // Real-time validation
    const result = await validateField("title", value)
    setError(result.error || "")
  }

  return (
    <div>
      <Input
        value={title}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Task title"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 4: BATCH VALIDATION
// ============================================================================

/*
"use client"

import { useBatchFieldValidation } from "@/lib/hooks/useValidation"
import { TaskCreateSchema } from "@/lib/schemas"

export function TaskFormValidator() {
  const { validateFields } = useBatchFieldValidation(TaskCreateSchema)

  const validateForm = async () => {
    const result = await validateFields({
      title: "My Task",
      priority: "high",
      category: "work",
    })

    if (!result.valid) {
      console.error("Validation errors:", result.errors)
      return
    }

    console.log("Form is valid!")
  }

  return (
    <button onClick={validateForm}>
      Validate Form
    </button>
  )
}
*/

// ============================================================================
// EXAMPLE 5: DATA TRANSFORMATION WITH VALIDATION
// ============================================================================

/*
import { useValidatedData } from "@/lib/hooks/useValidation"
import { TaskSchema } from "@/lib/schemas"

export function useTaskTransform(rawData: unknown) {
  const { valid, data, errors } = useValidatedData(
    rawData,
    TaskSchema,
    (task) => ({
      ...task,
      // Transform data after validation
      displayTitle: `[${task.priority.toUpperCase()}] ${task.title}`,
      isOverdue: task.dueDate ? new Date(task.dueDate) < new Date() : false,
    }),
  )

  return { valid, data, errors }
}
*/

// ============================================================================
// EXAMPLE 6: RESPONSE VALIDATION
// ============================================================================

/*
import { validateResponse, apiJsonResponse } from "@/lib/api-validation"
import { GrowthAiResponseSchema } from "@/lib/schemas"

export async function POST(request: Request) {
  // ... process request ...

  const response = {
    response: "Here's your schedule...",
    taskSuggestions: [
      {
        title: "Review project",
        duration: 30,
        time: "09:00",
        priority: "high",
        category: "work",
      },
    ],
  }

  // Validate before sending
  const { valid, data: validatedResponse, error } = validateResponse(
    response,
    GrowthAiResponseSchema,
  )

  if (!valid) {
    return apiJsonResponse({ error: "Failed to format response" }, 500)
  }

  return apiJsonResponse(validatedResponse, 200)
}
*/

// ============================================================================
// BENEFITS OF THIS APPROACH
// ============================================================================

/*
✅ Type Safety: Full TypeScript support throughout your app
✅ Runtime Validation: Catches bugs before they hit production
✅ Consistent Errors: Unified error handling across forms and APIs
✅ Self-Documenting: Schemas serve as API documentation
✅ Easy Refactoring: Change validation in one place
✅ Testing: Schemas are easy to test and mock
✅ Constraint Checking: Min/max lengths, enums, format validation
✅ Composition: Nest and combine schemas for complex data structures
*/

export {}
