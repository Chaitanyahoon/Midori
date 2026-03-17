/**
 * Toast utility functions for error, success, info, and warning messages.
 * Provides a centralized way to display notifications across the app.
 */

// Since we're using the toast hook in components, this module provides
// client-side utilities. Import useToast from hooks/use-toast in components that need it.

export const errorToast = (title: string, description: string) => {
  // This is a placeholder - the actual toast will be triggered in components
  // that have access to the useToast hook
  console.error(`${title}: ${description}`)
}

export const successToast = (title: string, description: string) => {
  console.log(`${title}: ${description}`)
}

export const infoToast = (title: string, description: string) => {
  console.info(`${title}: ${description}`)
}

export const warningToast = (title: string, description: string) => {
  console.warn(`${title}: ${description}`)
}
