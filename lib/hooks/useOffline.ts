"use client"

/**
 * React hooks for offline functionality.
 * Provides offline state management and sync capabilities.
 */

import { useEffect, useState, useCallback } from "react"
import { getOfflineManager, type OfflineState, type QueuedChange } from "@/lib/offline-manager"

/**
 * Hook for monitoring offline state
 */
export function useOfflineState() {
  const [state, setState] = useState<OfflineState | null>(null)
  const manager = getOfflineManager()

  useEffect(() => {
    // Set initial state
    setState(manager.getState())

    // For now, we'll poll for state updates (could be improved with events)
    const interval = setInterval(() => {
      setState(manager.getState())
    }, 1000)

    return () => clearInterval(interval)
  }, [manager])

  return state
}

/**
 * Hook for managing offline changes
 */
export function useOfflineCache() {
  const manager = getOfflineManager()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    setPendingCount(manager.getPendingCount())

    const interval = setInterval(() => {
      setPendingCount(manager.getPendingCount())
    }, 1000)

    return () => clearInterval(interval)
  }, [manager])

  const queueChange = useCallback(
    (change: Omit<QueuedChange, "id" | "timestamp" | "retryCount">) => {
      manager.queueChange(change)
      setPendingCount(manager.getPendingCount())
    },
    [manager],
  )

  const sync = useCallback(async () => {
    return manager.attemptSync()
  }, [manager])

  const reset = useCallback(() => {
    manager.reset()
    setPendingCount(0)
  }, [manager])

  return {
    pendingCount,
    queueChange,
    sync,
    reset,
  }
}

/**
 * Hook for displaying offline indicator
 */
export function useOfflineIndicator() {
  const state = useOfflineState()

  if (!state) return { isOnline: true, showIndicator: false }

  return {
    isOnline: state.isOnline,
    showIndicator: !state.isOnline,
    pendingChanges: state.pendingChanges.length,
    isSyncing: state.syncInProgress,
  }
}

/**
 * Hook for cache operations
 */
export function useOfflineDataCache<T>(
  key: string,
  expiresIn?: number,
) {
  const manager = getOfflineManager()
  const cache = manager.getCache()

  const get = useCallback((): T | undefined => {
    return cache.get<T>(key)
  }, [cache, key])

  const set = useCallback(
    (value: T) => {
      return cache.set(key, value, expiresIn)
    },
    [cache, key, expiresIn],
  )

  const remove = useCallback(() => {
    return cache.remove(key)
  }, [cache, key])

  const exists = useCallback(() => {
    return cache.has(key)
  }, [cache, key])

  return { get, set, remove, exists }
}

/**
 * Hook for background sync
 */
export function useBackgroundSync(
  syncFn: (changes: QueuedChange[]) => Promise<boolean>,
  interval: number = 30000, // 30 seconds
) {
  const manager = getOfflineManager()
  const state = useOfflineState()

  useEffect(() => {
    // Register sync callback
    manager.onSync(syncFn)

    // Set up periodic sync attempts
    const intervalId = setInterval(() => {
      if (state?.isOnline && state.pendingChanges.length > 0) {
        manager.attemptSync()
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [manager, syncFn, interval, state?.isOnline, state?.pendingChanges.length])
}

/**
 * Hook for detecting timeout/connection issues
 */
export function useConnectionQuality() {
  const [quality, setQuality] = useState<"excellent" | "good" | "poor">("excellent")
  const manager = getOfflineManager()

  useEffect(() => {
    const state = manager.getState()

    if (!state.isOnline) {
      setQuality("poor")
    } else if (state.errorCount > 3) {
      setQuality("poor")
    } else if (state.errorCount > 0) {
      setQuality("good")
    } else {
      setQuality("excellent")
    }
  }, [manager])

  return quality
}
