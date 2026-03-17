"use client"

import React, { ReactNode, ReactElement } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactElement
  onError?: (error: Error, info: { componentStack: string }) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component to catch and handle errors gracefully.
 * Wraps components to prevent full app crashes.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Error caught by boundary:", error, info)

    // Log to external service if available
    if (this.props.onError) {
      this.props.onError(error, info)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    {this.state.error?.message || "An unexpected error occurred"}
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === "development" && (
                <details className="text-xs text-amber-700 dark:text-amber-300 border-t border-amber-200 dark:border-amber-800 pt-3">
                  <summary className="cursor-pointer font-mono">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words bg-amber-100 dark:bg-amber-950 p-2 rounded text-amber-900 dark:text-amber-50 overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}

              <Button
                onClick={this.resetError}
                size="sm"
                className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
