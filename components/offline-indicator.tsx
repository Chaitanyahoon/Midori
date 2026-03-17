"use client"

import { useOfflineIndicator, useBackgroundSync, useConnectionQuality } from "@/lib/hooks/useOffline"
import { getOfflineManager, type QueuedChange } from "@/lib/offline-manager"
import { AlertCircle, Wifi, WifiOff, Cloud, CloudOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCallback } from "react"

interface OfflineIndicatorProps {
  onSync?: () => Promise<boolean>
}

/**
 * Offline indicator component for top navigation
 * Shows sync status and pending changes
 */
export function OfflineIndicator({ onSync }: OfflineIndicatorProps) {
  const { isOnline, showIndicator, pendingChanges, isSyncing } = useOfflineIndicator()
  const quality = useConnectionQuality()
  const manager = getOfflineManager()

  // Register sync callback if provided
  useBackgroundSync(
    onSync || (async () => true),
    30000,
  )

  const handleManualSync = useCallback(async () => {
    await manager.attemptSync()
  }, [manager])

  if (!showIndicator) {
    return null
  }

  const bgColor =
    quality === "excellent"
      ? "bg-emerald-50 dark:bg-emerald-950/30"
      : quality === "good"
        ? "bg-amber-50 dark:bg-amber-950/30"
        : "bg-red-50 dark:bg-red-950/30"

  const borderColor =
    quality === "excellent"
      ? "border-emerald-200 dark:border-emerald-800"
      : quality === "good"
        ? "border-amber-200 dark:border-amber-800"
        : "border-red-200 dark:border-red-800"

  const textColor =
    quality === "excellent"
      ? "text-emerald-900 dark:text-emerald-100"
      : quality === "good"
        ? "text-amber-900 dark:text-amber-100"
        : "text-red-900 dark:text-red-100"

  const iconColor = !isOnline ? "text-red-600" : "text-amber-600"

  return (
    <Card className={`${bgColor} ${borderColor} border p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className={`w-4 h-4 ${iconColor}`} />
              <span className={`text-sm font-medium ${textColor}`}>Offline Mode</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span className={`text-sm font-medium ${textColor}`}>
                {pendingChanges > 0 ? `Syncing (${pendingChanges} changes)` : "Online"}
              </span>
            </>
          )}
        </div>

        {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}

        {pendingChanges > 0 && !isSyncing && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            className="h-7 px-2 text-xs"
          >
            Sync Now
          </Button>
        )}
      </div>

      {!isOnline && (
        <p className={`text-xs ${textColor}`}>
          💾 Changes are being saved locally. They'll sync when you're back online.
        </p>
      )}

      {pendingChanges > 0 && (
        <p className={`text-xs ${textColor}`}>
          ⏳ {pendingChanges} pending change{pendingChanges !== 1 ? "s" : ""}
        </p>
      )}

      {quality === "poor" && isOnline && (
        <div className="flex items-start gap-2 mt-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <p className="text-xs text-red-900 dark:text-red-100">
            Connection issues detected. Keep trying to sync.
          </p>
        </div>
      )}
    </Card>
  )
}

/**
 * Simplified offline badge for status bar
 */
export function OfflineBadge() {
  const { isOnline, showIndicator, pendingChanges } = useOfflineIndicator()

  if (!showIndicator) return null

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
      {!isOnline ? (
        <WifiOff className="w-3 h-3 text-red-600" />
      ) : (
        <CloudOff className="w-3 h-3 text-amber-600" />
      )}
      <span className="text-xs font-medium text-amber-900 dark:text-amber-100">
        {pendingChanges > 0 ? `${pendingChanges} pending` : "Offline"}
      </span>
    </div>
  )
}
