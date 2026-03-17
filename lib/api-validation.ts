/**
 * API validation utilities and middleware for request/response validation.
 * Ensures all API endpoints properly validate input and output.
 */

import { z } from "zod"
import type { NextRequest } from "next/server"

export interface ValidatedRequest<T> {
  data: T
  error?: never
}

export interface ValidationError {
  data?: never
  error: {
    status: number
    message: string
    details: Record<string, string[]>
  }
}

/**
 * Parse and validate JSON request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): Promise<ValidatedRequest<T> | ValidationError> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const details = result.error.flatten().fieldErrors as Record<string, string[]>
      return {
        error: {
          status: 400,
          message: "Invalid request body",
          details,
        },
      }
    }

    return { data: result.data }
  } catch (error) {
    return {
      error: {
        status: 400,
        message: "Failed to parse request body",
        details: {
          body: [error instanceof Error ? error.message : "Invalid JSON"],
        },
      },
    }
  }
}

/**
 * Validate response data before sending
 */
export function validateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): { valid: boolean; data?: T; error?: string } {
  const result = schema.safeParse(data)

  if (!result.success) {
    console.error("Response validation failed:", result.error)
    return {
      valid: false,
      error: "Internal server error: Invalid response format",
    }
  }

  return { valid: true, data: result.data }
}

/**
 * Create a typed API response JSON helper
 */
export function apiJsonResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>,
) {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  })
}

/**
 * Create an error response
 */
export function apiErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>,
) {
  return Response.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status },
  )
}

/**
 * Middleware factory for validating requests
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    const { data, error } = await validateRequestBody(request, schema)

    if (error) {
      return apiErrorResponse(error.message, error.status, error.details)
    }

    return { validatedData: data }
  }
}

/**
 * Try-catch wrapper for API routes with automatic error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<Response>,
  options?: { logErrors?: boolean; includeStack?: boolean },
): Promise<Response> {
  try {
    return await fn()
  } catch (error) {
    if (options?.logErrors) {
      console.error("API error:", error)
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    const stack = options?.includeStack && error instanceof Error ? error.stack : undefined

    return apiErrorResponse(
      "Internal server error",
      500,
      process.env.NODE_ENV === "development" ? { message, stack } : undefined,
    )
  }
}
