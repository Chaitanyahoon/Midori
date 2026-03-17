/**
 * Offline data synchronization system.
 * Manages local caching, change tracking, and syncing when back online.
 */

import { z } from "zod"

export type SyncAction = "create" | "update" | "delete"

export interface QueuedChange {
  id: string
  type: "task" | "pomodoro" | "settings" | "track"
  action: SyncAction
  data: unknown
  timestamp: number
  retryCount: number
}

export interface OfflineState {
  isOnline: boolean
  syncInProgress: boolean
  pendingChanges: QueuedChange[]
  lastSyncTime: number | null
  errorCount: number
}

const STORAGE_KEYS = {
  CACHE: "midori_cache",
  QUEUE: "midori_sync_queue",
  STATE: "midori_offline_state",
  LAST_SYNC: "midori_last_sync",
}

/**
 * Local cache manager using localStorage
 */
export class CacheManager {
  private namespace: string

  constructor(namespace: string = "midori") {
    this.namespace = namespace
  }

  /**
   * Get cache item by key
   */
  get<T>(key: string, fallback?: T): T | undefined {
    try {
      const item = localStorage.getItem(`${this.namespace}_${key}`)
      return item ? JSON.parse(item) : fallback
    } catch (error) {
      console.error(`Failed to get cache item '${key}':`, error)
      return fallback
    }
  }

  /**
   * Set cache item
   */
  set<T>(key: string, value: T, expiresIn?: number): boolean {
    try {
      const data = {
        value,
        expiresAt: expiresIn ? Date.now() + expiresIn : null,
      }
      localStorage.setItem(`${this.namespace}_${key}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Failed to set cache item '${key}':`, error)
      return false
    }
  }

  /**
   * Check if cache item exists and is not expired
   */
  has(key: string): boolean {
    try {
      const item = localStorage.getItem(`${this.namespace}_${key}`)
      if (!item) return false

      const data = JSON.parse(item)
      if (data.expiresAt && data.expiresAt < Date.now()) {
        this.remove(key)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Remove cache item
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(`${this.namespace}_${key}`)
      return true
    } catch (error) {
      console.error(`Failed to remove cache item '${key}':`, error)
      return false
    }
  }

  /**
   * Clear all cache items
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith(`${this.namespace}_`)) {
          localStorage.removeItem(key)
        }
      }
      return true
    } catch (error) {
      console.error("Failed to clear cache:", error)
      return false
    }
  }

  /**
   * Get cache size in bytes
   */
  getSize(): number {
    let size = 0
    try {
      for (const key in localStorage) {
        if (key.startsWith(`${this.namespace}_`)) {
          size += localStorage[key].length + key.length
        }
      }
    } catch (error) {
      console.error("Failed to calculate cache size:", error)
    }
    return size
  }
}

/**
 * Sync queue manager for offline changes
 */
export class SyncQueue {
  private cache: CacheManager

  constructor(cache: CacheManager) {
    this.cache = cache
  }

  /**
   * Add change to queue
   */
  add(change: Omit<QueuedChange, "id" | "timestamp" | "retryCount">): QueuedChange {
    const queuedChange: QueuedChange = {
      id: `${change.type}_${Date.now()}_${Math.random()}`,
      ...change,
      timestamp: Date.now(),
      retryCount: 0,
    }

    const queue = this.getAll()
    queue.push(queuedChange)
    this.cache.set(STORAGE_KEYS.QUEUE, queue)

    console.log(`[SyncQueue] Added change: ${queuedChange.id}`)
    return queuedChange
  }

  /**
   * Get all queued changes
   */
  getAll(): QueuedChange[] {
    return this.cache.get(STORAGE_KEYS.QUEUE, [])
  }

  /**
   * Get changes by type
   */
  getByType(type: QueuedChange["type"]): QueuedChange[] {
    return this.getAll().filter((c) => c.type === type)
  }

  /**
   * Remove change from queue
   */
  remove(id: string): boolean {
    const queue = this.getAll().filter((c) => c.id !== id)
    this.cache.set(STORAGE_KEYS.QUEUE, queue)
    console.log(`[SyncQueue] Removed change: ${id}`)
    return true
  }

  /**
   * Update retry count
   */
  incrementRetry(id: string): void {
    const queue = this.getAll()
    const change = queue.find((c) => c.id === id)
    if (change) {
      change.retryCount++
      this.cache.set(STORAGE_KEYS.QUEUE, queue)
    }
  }

  /**
   * Clear all queued changes
   */
  clear(): void {
    this.cache.remove(STORAGE_KEYS.QUEUE)
    console.log("[SyncQueue] Cleared all changes")
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.getAll().length
  }
}

/**
 * Network status monitor
 */
export class NetworkMonitor {
  private listeners: Set<(isOnline: boolean) => void> = new Set()
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline())
      window.addEventListener("offline", () => this.handleOffline())
    }
  }

  /**
   * Subscribe to online/offline status changes
   */
  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get current online status
   */
  getStatus(): boolean {
    return this.isOnline
  }

  /**
   * Notify all listeners of status change
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener(this.isOnline))
  }

  private handleOnline(): void {
    console.log("[NetworkMonitor] Going online")
    this.isOnline = true
    this.notify()
  }

  private handleOffline(): void {
    console.log("[NetworkMonitor] Going offline")
    this.isOnline = false
    this.notify()
  }

  /**
   * Simulate offline mode (for testing)
   */
  simulateOffline(): void {
    this.isOnline = false
    this.notify()
  }

  /**
   * Simulate online mode (for testing)
   */
  simulateOnline(): void {
    this.isOnline = true
    this.notify()
  }
}

/**
 * Main offline manager combining cache, queue, and network monitoring
 */
export class OfflineManager {
  private cache: CacheManager
  private queue: SyncQueue
  private network: NetworkMonitor
  private state: OfflineState
  private syncCallbacks: Array<(changes: QueuedChange[]) => Promise<boolean>> = []

  constructor() {
    this.cache = new CacheManager()
    this.queue = new SyncQueue(this.cache)
    this.network = new NetworkMonitor()

    this.state = {
      isOnline: this.network.getStatus(),
      syncInProgress: false,
      pendingChanges: this.queue.getAll(),
      lastSyncTime: this.cache.get<number>(STORAGE_KEYS.LAST_SYNC),
      errorCount: 0,
    }

    // Subscribe to network changes
    this.network.subscribe((isOnline) => {
      this.state.isOnline = isOnline
      if (isOnline && this.state.pendingChanges.length > 0) {
        this.attemptSync()
      }
    })
  }

  /**
   * Register sync callback
   */
  onSync(callback: (changes: QueuedChange[]) => Promise<boolean>): void {
    this.syncCallbacks.push(callback)
  }

  /**
   * Queue a change
   */
  queueChange(change: Omit<QueuedChange, "id" | "timestamp" | "retryCount">): void {
    const queuedChange = this.queue.add(change)
    this.state.pendingChanges.push(queuedChange)
  }

  /**
   * Attempt to sync queued changes
   */
  async attemptSync(): Promise<boolean> {
    if (this.state.syncInProgress || !this.state.isOnline) {
      return false
    }

    this.state.syncInProgress = true
    const changes = this.queue.getAll()

    try {
      // Call all sync callbacks
      for (const callback of this.syncCallbacks) {
        const success = await callback(changes)
        if (!success) {
          throw new Error("Sync callback failed")
        }
      }

      // Clear queue on success
      this.queue.clear()
      this.state.pendingChanges = []
      this.state.lastSyncTime = Date.now()
      this.state.errorCount = 0
      this.cache.set(STORAGE_KEYS.LAST_SYNC, this.state.lastSyncTime)

      console.log("[OfflineManager] Sync successful")
      return true
    } catch (error) {
      this.state.errorCount++
      console.error("[OfflineManager] Sync failed:", error)

      // Increment retry counts
      changes.forEach((change) => this.queue.incrementRetry(change.id))

      return false
    } finally {
      this.state.syncInProgress = false
    }
  }

  /**
   * Get current offline state
   */
  getState(): OfflineState {
    return { ...this.state }
  }

  /**
   * Get pending changes count
   */
  getPendingCount(): number {
    return this.state.pendingChanges.length
  }

  /**
   * Force clear all offline data
   */
  reset(): void {
    this.queue.clear()
    this.cache.clear()
    this.state = {
      isOnline: this.network.getStatus(),
      syncInProgress: false,
      pendingChanges: [],
      lastSyncTime: null,
      errorCount: 0,
    }
    console.log("[OfflineManager] Reset complete")
  }

  /**
   * Get cache manager for custom operations
   */
  getCache(): CacheManager {
    return this.cache
  }

  /**
   * Get queue manager for custom operations
   */
  getQueue(): SyncQueue {
    return this.queue
  }
}

// Singleton instance
let offlineManager: OfflineManager | null = null

/**
 * Get or create offline manager singleton
 */
export function getOfflineManager(): OfflineManager {
  if (!offlineManager) {
    offlineManager = new OfflineManager()
  }
  return offlineManager
}
