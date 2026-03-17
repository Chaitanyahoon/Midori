"use client"

/**
 * React hooks for Zod schema validation with react-hook-form integration.
 * Provides convenient methods for validating form data.
 */

import { useCallback } from "react"
import { z } from "zod"
import type {
  UseFormSetError,
  FieldValues,
  Path,
} from "react-hook-form"

/**
 * Hook for validating field values with a Zod schema
 */
export function useZodValidation<T extends FieldValues>(schema: z.ZodSchema<T>) {
  const validate = useCallback(
    async (data: unknown): Promise<{ valid: boolean; errors?: Record<string, string> }> => {
      const result = schema.safeParse(data)

      if (!result.success) {
        const errors: Record<string, string> = {}
        result.error.errors.forEach((err) => {
          const path = err.path.join(".")
          errors[path] = err.message
        })
        return { valid: false, errors }
      }

      return { valid: true }
    },
    [schema],
  )

  return { validate }
}

/**
 * Hook for syncing Zod schema errors to react-hook-form
 */
export function useZodErrors<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  setError: UseFormSetError<T>,
) {
  const syncErrors = useCallback(
    (data: unknown) => {
      const result = schema.safeParse(data)

      if (!result.success) {
        result.error.errors.forEach((err) => {
          const field = err.path[0] as Path<T>
          if (field) {
            setError(field, {
              type: "validation",
              message: err.message,
            })
          }
        })
        return false
      }

      return true
    },
    [schema, setError],
  )

  return { syncErrors }
}

/**
 * Hook for safe data transformation and validation
 */
export function useValidatedData<T, R = T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  transform?: (data: T) => R,
) {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      valid: false,
      data: null as any,
      errors: result.error.flatten().fieldErrors,
    }
  }

  const transformedData = transform ? transform(result.data) : (result.data as any as R)

  return {
    valid: true,
    data: transformedData,
    errors: undefined,
  }
}

/**
 * Hook for validating single field values in real-time
 */
export function useFieldValidation<T extends FieldValues>(schema: z.ZodSchema<T>) {
  const validateField = useCallback(
    async (fieldName: Path<T>, value: unknown): Promise<{ valid: boolean; error?: string }> => {
      try {
        // Create a schema for just this field if possible
        const field = schema instanceof z.ZodObject ? schema.shape[fieldName as string] : null

        if (!field) {
          return { valid: true }
        }

        const result = field.safeParse(value)

        if (!result.success) {
          return {
            valid: false,
            error: result.error.errors[0]?.message || "Validation failed",
          }
        }

        return { valid: true }
      } catch (error) {
        return {
          valid: false,
          error: "Validation error",
        }
      }
    },
    [schema],
  )

  return { validateField }
}

/**
 * Hook for batch field validation
 */
export function useBatchFieldValidation<T extends FieldValues>(schema: z.ZodSchema<T>) {
  const validateFields = useCallback(
    async (
      fields: Partial<Record<Path<T>, unknown>>,
    ): Promise<{ valid: boolean; errors?: Record<string, string> }> => {
      const errors: Record<string, string> = {}

      if (schema instanceof z.ZodObject) {
        for (const [fieldName, value] of Object.entries(fields)) {
          const field = schema.shape[fieldName]
          if (!field) continue

          const result = field.safeParse(value)
          if (!result.success) {
            errors[fieldName] = result.error.errors[0]?.message || "Validation failed"
          }
        }
      }

      return {
        valid: Object.keys(errors).length === 0,
        ...(Object.keys(errors).length > 0 && { errors }),
      }
    },
    [schema],
  )

  return { validateFields }
}
