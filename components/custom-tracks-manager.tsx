"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useCustomTracks } from "@/lib/hooks/useCustomTracks"
import { Badge } from "@/components/ui/badge"

/**
 * Custom track management component
 */
export function CustomTracksManager() {
  const {
    newTrackName,
    newTrackUrl,
    customTracks,
    isAdding,
    setNewTrackName,
    setNewTrackUrl,
    validateAndAddTrack,
    handleRemoveTrack,
  } = useCustomTracks()

  return (
    <div className="space-y-4">
      {/* Add New Track Form */}
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Add Custom Track</h4>
        <div className="space-y-2">
          <Input
            placeholder="Track name (e.g., 'My Favorite Lofi')"
            value={newTrackName}
            onChange={(e) => setNewTrackName(e.target.value)}
            disabled={isAdding}
            className="text-sm"
          />
          <Input
            placeholder="YouTube URL (youtu.be/... or youtube.com/watch?v=...)"
            value={newTrackUrl}
            onChange={(e) => setNewTrackUrl(e.target.value)}
            disabled={isAdding}
            className="text-sm"
          />
          <Button
            onClick={validateAndAddTrack}
            disabled={isAdding}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
          >
            {isAdding ? "Adding..." : "Add Track"}
          </Button>
        </div>
      </Card>

      {/* Custom Tracks List */}
      {customTracks.length > 0 && (
        <Card className="p-4 space-y-3">
          <h4 className="font-semibold text-sm">Your Tracks ({customTracks.length})</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {customTracks.map((track) => (
              <div
                key={track.id || track.url}
                className="flex items-center justify-between p-2 rounded bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.url}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveTrack(track.id || track.url)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0 ml-2"
                >
                  <Icons.trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3 text-xs text-blue-900 dark:text-blue-100 space-y-1">
        <p className="font-medium">💡 Tips for custom tracks:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Use YouTube links (youtube.com or youtu.be)</li>
          <li>Must be publicly available videos</li>
          <li>Longer videos work best (hours of music)</li>
          <li>Lo-fi, ambience, and instrumental work great</li>
        </ul>
      </div>
    </div>
  )
}
