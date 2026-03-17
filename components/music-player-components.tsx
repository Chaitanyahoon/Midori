"use client"

/**
 * Modular music player subcomponents.
 * Extracted from FocusMusicPlayer for better maintainability.
 */

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import type { MusicTrack } from "@/lib/hooks/useMusic"

/**
 * Track display card showing current track info
 */
export function MusicTrackDisplay({
  track,
  isPlaying,
  icon,
}: {
  track: MusicTrack | null
  isPlaying: boolean
  icon?: React.ReactNode
}) {
  if (!track) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No track selected</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">{track.name}</h4>
          <p className="text-xs text-muted-foreground">{track.description}</p>
        </div>
        {isPlaying && <Icons.play className="w-4 h-4 animate-pulse text-emerald-500" />}
      </div>
    </div>
  )
}

/**
 * Playback controls (play, pause, stop)
 */
export function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  disabled = false,
}: {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {!isPlaying ? (
        <Button
          size="sm"
          onClick={onPlay}
          disabled={disabled}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Icons.play className="w-4 h-4 mr-1" />
          Play
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={onPause}
          disabled={disabled}
          variant="secondary"
        >
          <Icons.pause className="w-4 h-4 mr-1" />
          Pause
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={onStop}
        disabled={disabled || !isPlaying}
      >
        <Icons.stop className="w-4 h-4" />
      </Button>
    </div>
  )
}

/**
 * Volume control slider
 */
export function VolumeControl({
  volume,
  onVolumeChange,
  label = "Volume",
}: {
  volume: number[]
  onVolumeChange: (volume: number[]) => void
  label?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-medium">{volume[0]}%</span>
      </div>
      <Slider
        value={volume}
        onValueChange={onVolumeChange}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  )
}

/**
 * Category tabs for track selection
 */
export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  onRandomClick,
}: {
  categories: Array<{ value: string; label: string; icon?: string }>
  activeCategory: string
  onCategoryChange: (category: string) => void
  onRandomClick: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Category</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRandomClick}
          className="h-6 px-2 text-xs"
        >
          🎲 Random
        </Button>
      </div>
      <div className="flex gap-1 flex-wrap">
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "outline"}
            onClick={() => onCategoryChange(cat.value)}
            className="cursor-pointer"
          >
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}

/**
 * Track list with play buttons
 */
export function TrackList({
  tracks,
  currentTrack,
  onTrackSelect,
}: {
  tracks: MusicTrack[]
  currentTrack: MusicTrack | null
  onTrackSelect: (track: MusicTrack) => void
}) {
  if (tracks.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-4">No tracks available</p>
  }

  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto">
      {tracks.map((track) => (
        <button
          key={track.url}
          onClick={() => onTrackSelect(track)}
          className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${
            currentTrack?.url === track.url
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{track.name}</p>
              <p className="text-muted-foreground text-xs">{track.description}</p>
            </div>
            {track.icon && <span>{track.icon}</span>}
          </div>
        </button>
      ))}
    </div>
  )
}

/**
 * Recently played tracks
 */
export function RecentlyPlayed({
  tracks,
  onTrackSelect,
}: {
  tracks: MusicTrack[]
  onTrackSelect: (track: MusicTrack) => void
}) {
  if (tracks.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Recently Played</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tracks.map((track) => (
          <Button
            key={track.url}
            size="sm"
            variant="outline"
            onClick={() => onTrackSelect(track)}
            className="whitespace-nowrap text-xs"
          >
            {track.icon} {track.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

/**
 * YouTube player iframe
 */
export function YouTubePlayer({
  videoId,
  volume,
  isPlaying,}: {
  videoId: string | null
  volume: number
  isPlaying: boolean
}) {
  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No track selected</p>
      </div>
    )
  }

  return (
    <iframe
      width="100%"
      height="280"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`}
      title="Music Player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="rounded-lg"
      style={{ opacity: volume / 100 }}
    />
  )
}
