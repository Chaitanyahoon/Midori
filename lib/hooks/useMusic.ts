"use client"

/**
 * React hook for managing music playback and track selection.
 * Extracts core logic from FocusMusicPlayer for reusability.
 */

import { useState, useRef, useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export interface MusicTrack {
  id?: string
  name: string
  url: string
  category: "focus" | "relax" | "energy" | "nature" | "instrumental" | "zen"
  description?: string
  icon?: string
}

export const MUSIC_OPTIONS: MusicTrack[] = [
  {
    name: "Rainforest Ambience",
    url: "https://www.youtube.com/embed/1ZYbU82FVjU",
    category: "nature",
    icon: "🌧️",
    description: "Calming rainforest sounds"
  },
  {
    name: "Ocean Waves",
    url: "https://www.youtube.com/embed/jW7zuqss4SU",
    category: "nature",
    icon: "🌊",
    description: "Gentle ocean waves"
  },
  {
    name: "Lo-fi Beats",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk",
    category: "focus",
    icon: "🎧",
    description: "Chill lo-fi hip hop"
  },
  {
    name: "Jazz Café",
    url: "https://www.youtube.com/embed/Xw3GzJnbHa4",
    category: "focus",
    icon: "🎷",
    description: "Smooth jazz for concentration"
  },
  {
    name: "Uplifting Electronic",
    url: "https://www.youtube.com/embed/YxH5_l6vX-w",
    category: "energy",
    icon: "⚡",
    description: "Energetic electronic music"
  },
  {
    name: "Zen Garden",
    url: "https://www.youtube.com/embed/a9pS0YPSGSw",
    category: "zen",
    icon: "🧘",
    description: "Pure relaxation"
  },
]

/**
 * Hook for managing music player state and playback
 */
export function useMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [volume, setVolume] = useState([50])
  const [activeCategory, setActiveCategory] = useState<MusicTrack["category"] | "custom">("focus")
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicTrack[]>([])
  const playerRef = useRef<any>(null)
  const { toast } = useToast()
  const { customTracks } = useData()

  const playTrack = useCallback((track: MusicTrack) => {
    setCurrentTrack(track)
    setIsPlaying(true)

    // Add to recently played
    if (!recentlyPlayed.find((t) => t.url === track.url)) {
      setRecentlyPlayed((prev) => [track, ...prev.slice(0, 4)])
    }
  }, [recentlyPlayed])

  const pauseTrack = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const resumeTrack = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(true)
    }
  }, [currentTrack])

  const getTracksByCategory = useCallback(
    (category: MusicTrack["category"] | "custom") => {
      if (category === "custom") {
        return customTracks || []
      }
      return MUSIC_OPTIONS.filter((t) => t.category === category)
    },
    [customTracks],
  )

  const getRandomTrackFromCategory = useCallback(
    (category: MusicTrack["category"] | "custom") => {
      const tracks = getTracksByCategory(category)
      if (tracks.length === 0) return null
      return tracks[Math.floor(Math.random() * tracks.length)]
    },
    [getTracksByCategory],
  )

  return {
    // State
    isPlaying,
    currentTrack,
    volume,
    activeCategory,
    recentlyPlayed,
    allTracks: MUSIC_OPTIONS,
    customTracks,

    // Actions
    playTrack,
    pauseTrack,
    resumeTrack,
    setVolume,
    setActiveCategory,
    getTracksByCategory,
    getRandomTrackFromCategory,
    playerRef,
  }
}

/**
 * Hook for managing ambient layer
 */
export function useAmbientMusic() {
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false)
  const [ambientTrack, setAmbientTrack] = useState<MusicTrack | null>(null)
  const [ambientVolume, setAmbientVolume] = useState([30])
  const ambientPlayerRef = useRef<any>(null)

  const playAmbient = useCallback((track: MusicTrack) => {
    setAmbientTrack(track)
    setIsAmbientPlaying(true)
  }, [])

  const stopAmbient = useCallback(() => {
    setIsAmbientPlaying(false)
  }, [])

  return {
    isAmbientPlaying,
    ambientTrack,
    ambientVolume,
    playAmbient,
    stopAmbient,
    setAmbientVolume,
    ambientPlayerRef,
  }
}
