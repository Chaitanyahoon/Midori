"use client"

/**
 * Hook for managing custom music tracks.
 * Extracted from FocusMusicPlayer for reusability.
 */

import { useState, useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"
import type { MusicTrack } from "@/lib/hooks/useMusic"

/**
 * Validate YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)
  return match ? match[1] : null
}

/**
 * Hook for custom track management
 */
export function useCustomTracks() {
  const [newTrackName, setNewTrackName] = useState("")
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const { customTracks, addCustomTrack, removeCustomTrack } = useData()
  const { toast } = useToast()

  const validateAndAddTrack = useCallback(async () => {
    // Validation
    if (!newTrackName.trim()) {
      toast({
        title: "Missing track name",
        description: "Please enter a track name.",
        variant: "destructive",
      })
      return false
    }

    if (!newTrackUrl.trim()) {
      toast({
        title: "Missing track URL",
        description: "Please enter a YouTube URL.",
        variant: "destructive",
      })
      return false
    }

    const videoId = extractVideoId(newTrackUrl)
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL (youtube.com or youtu.be).",
        variant: "destructive",
      })
      return false
    }

    // Check for duplicates
    if (customTracks?.some((t) => t.url === newTrackUrl)) {
      toast({
        title: "Track already exists",
        description: "This track is already in your collection.",
        variant: "destructive",
      })
      return false
    }

    // Add track
    setIsAdding(true)
    try {
      await addCustomTrack({
        name: newTrackName,
        url: newTrackUrl,
        category: "focus",
      })

      toast({
        title: "Track added! 🎵",
        description: `"${newTrackName}" has been added to your collection.`,
      })

      // Reset form
      setNewTrackName("")
      setNewTrackUrl("")
      return true
    } catch (error) {
      toast({
        title: "Failed to add track",
        description: "Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsAdding(false)
    }
  }, [newTrackName, newTrackUrl, customTracks, addCustomTrack, toast])

  const handleRemoveTrack = useCallback(
    async (trackId: string) => {
      try {
        await removeCustomTrack(trackId)
        toast({
          title: "Track removed",
          description: "The track has been removed from your collection.",
        })
      } catch (error) {
        toast({
          title: "Failed to remove track",
          description: "Please try again.",
          variant: "destructive",
        })
      }
    },
    [removeCustomTrack, toast],
  )

  return {
    // State
    newTrackName,
    newTrackUrl,
    customTracks: customTracks || [],
    isAdding,

    // Form methods
    setNewTrackName,
    setNewTrackUrl,
    validateAndAddTrack,
    handleRemoveTrack,

    // Utility
    extractVideoId,
  }
}
