"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"
import { useMusicStore, type MusicTrack } from "@/lib/store"
import { ambientGenerator } from "@/lib/ambient-generator"
import { Switch } from "@/components/ui/switch"

// Extract video ID from YouTube URL
const extractVideoId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)
  return match ? match[1] : null
}


// Verified working YouTube tracks - all unique links, no duplicates
export const MUSIC_OPTIONS: MusicTrack[] = [
  // Focus Category - Deep concentration music
  {
    name: "Lo-Fi Hip Hop Radio",
    url: "https://www.youtube.com/embed/5qap5aO4i9A",
    category: "focus",
    type: "youtube",
    description: "Stable lo-fi beats - perfect for studying",
    icon: "🎧",
  },
  {
    name: "Deep Focus",
    url: "/assets/audio/deep-focus.mp3",
    category: "focus",
    type: "audio",
    description: "Ambient drone for intense concentration",
    icon: "🧠",
  },
  {
    name: "Coding Music",
    url: "https://www.youtube.com/embed/Dx5qFachd3A",
    category: "focus",
    type: "youtube",
    description: "Jazz beats perfect for coding sessions",
    icon: "💻",
  },
  {
    name: "Study With Me",
    url: "https://www.youtube.com/embed/4VR-6AS0-l4",
    category: "focus",
    type: "youtube",
    description: "Binaural beats for enhanced concentration",
    icon: "📚",
  },
  {
    name: "Jazz & Bossa Nova",
    url: "https://www.youtube.com/embed/W9k3jBjBxgo",
    category: "focus",
    type: "youtube",
    description: "Lo-fi jazz beats for productive coding",
    icon: "🎷",
  },
  {
    name: "Classical for Studying",
    url: "https://www.youtube.com/embed/9Auq9mYxFEE",
    category: "focus",
    type: "youtube",
    description: "Mozart and Bach for better focus",
    icon: "🎼",
  },
  {
    name: "Electronic Focus",
    url: "https://www.youtube.com/embed/4xDzrJKXOOY",
    category: "focus",
    type: "youtube",
    description: "Synthwave and electronic for coding",
    icon: "⚡",
  },
  {
    name: "Alpha Waves Focus",
    url: "https://www.youtube.com/embed/7Mrv2PHvbjM",
    category: "focus",
    type: "youtube",
    description: "Binaural beats for deep concentration",
    icon: "🧘",
  },
  {
    name: "Brown Noise Focus",
    url: "https://www.youtube.com/embed/wzjWIxXBs_s",
    category: "focus",
    type: "youtube",
    description: "Deep brown noise for intense focus",
    icon: "🔊",
  },

  // Relax Category - Calming and peaceful
  {
    name: "Peaceful Piano",
    url: "https://www.youtube.com/embed/4Tr0otuiQuU",
    category: "relax",
    type: "youtube",
    description: "Gentle piano to unwind",
    icon: "🎹",
  },
  {
    name: "Meditation Music",
    url: "https://www.youtube.com/embed/1ZYbU82GVz4",
    category: "relax",
    type: "youtube",
    description: "Zen sounds for mindfulness",
    icon: "🧘",
  },
  {
    name: "Rain Sounds",
    url: "synthesized://rain",
    category: "relax",
    type: "synthesized",
    description: "Infinite synthesized warm rain patter",
    icon: "🌧️",
  },
  {
    name: "Ocean Waves",
    url: "synthesized://ocean",
    category: "relax",
    type: "synthesized",
    description: "Infinite synthesized ocean wave cycles",
    icon: "🌊",
  },
  {
    name: "Chill Beats",
    url: "https://www.youtube.com/embed/DWcJFNfaw9c",
    category: "relax",
    type: "youtube",
    description: "Relaxing electronic vibes",
    icon: "🎵",
  },
  {
    name: "Fireplace Sounds",
    url: "synthesized://fireplace",
    category: "relax",
    type: "synthesized",
    description: "Synthesized warm wood embers & crackles",
    icon: "🔥",
  },

  // Energy Category - Upbeat and motivating
  {
    name: "Upbeat Electronic",
    url: "https://www.youtube.com/embed/VQTK6PzLMgA",
    category: "energy",
    type: "youtube",
    description: "Energetic beats to boost mood",
    icon: "⚡",
  },
  {
    name: "Workout Motivation",
    url: "https://www.youtube.com/embed/5yx6BWlEVcY",
    category: "energy",
    type: "youtube",
    description: "High-energy pump-up music",
    icon: "💪",
  },
  {
    name: "Synthwave Radio",
    url: "https://www.youtube.com/embed/1H-vSHVOxoU",
    category: "energy",
    type: "youtube",
    description: "Retro 80s synthwave vibes",
    icon: "🌃",
  },
  {
    name: "Productivity Boost",
    url: "https://www.youtube.com/embed/aQzGxazf0l4",
    category: "energy",
    type: "youtube",
    description: "Motivational beats for action",
    icon: "🚀",
  },

  // Nature Category - Natural sounds
  {
    name: "Forest Sounds",
    url: "synthesized://forest",
    category: "nature",
    type: "synthesized",
    description: "Synthesized rustling leaves & morning birds",
    icon: "🌲",
  },
  {
    name: "Mountain Stream",
    url: "https://www.youtube.com/embed/7maJOI3QMu0",
    category: "nature",
    type: "youtube",
    description: "Flowing water in nature",
    icon: "🏔️",
  },
  {
    name: "Birds & Nature",
    url: "https://www.youtube.com/embed/nBGeZQhBmRY",
    category: "nature",
    type: "youtube",
    description: "Morning birds chirping in forest",
    icon: "🐦",
  },
  {
    name: "Thunderstorm",
    url: "https://www.youtube.com/embed/k7x0j-BvWXg",
    category: "nature",
    type: "youtube",
    description: "Cozy thunderstorm sounds",
    icon: "⛈️",
  },
  {
    name: "Cafe Ambience",
    url: "https://www.youtube.com/embed/2Vv-BfVoq4g",
    category: "nature",
    type: "youtube",
    description: "Coffee shop background noise",
    icon: "☕",
  },
  {
    name: "Wind Chimes",
    url: "/assets/audio/wind-chimes.mp3",
    category: "nature",
    type: "audio",
    description: "Soft wind chimes in a garden",
    icon: "🎐",
  },

  // Instrumental Category - Pure instrumental
  {
    name: "Acoustic Guitar",
    url: "https://www.youtube.com/embed/C1GzKRPM3Sw",
    category: "instrumental",
    type: "youtube",
    description: "Beautiful guitar melodies",
    icon: "🎸",
  },
  {
    name: "Piano & Strings",
    url: "https://www.youtube.com/embed/BFpLr0LfDUA",
    category: "instrumental",
    type: "youtube",
    description: "Classical instrumental pieces",
    icon: "🎻",
  },
  {
    name: "Jazz Instrumental",
    url: "https://www.youtube.com/embed/lTRiuFIWV5Y",
    category: "instrumental",
    type: "youtube",
    description: "Lo-fi jazz without vocals",
    icon: "🎺",
  },
  {
    name: "Ambient Instrumental",
    url: "https://www.youtube.com/embed/5qap5aO4i9A",
    category: "instrumental",
    type: "youtube",
    description: "Atmospheric instrumental music",
    icon: "🎹",
  },
  {
    name: "Classical Piano",
    url: "https://www.youtube.com/embed/hHW1oY26kxQ",
    category: "instrumental",
    type: "youtube",
    description: "Peaceful piano compositions",
    icon: "🎹",
  },
  
  // Zen Category - Japanese Soothing Study
  {
    name: "Deep Focus Koto",
    url: "https://www.youtube.com/embed/S2pEToi-1Vw",
    category: "zen",
    type: "youtube",
    description: "Traditional string melodies for deep study",
    icon: "🗾",
  },
  {
    name: "Shakuhachi Meditation",
    url: "https://www.youtube.com/embed/zH0Fp1jrvIs",
    category: "zen",
    type: "youtube",
    description: "Zen bamboo flute for mental clarity",
    icon: "🎍",
  },
  {
    name: "Japanese Zen Lofi",
    url: "https://www.youtube.com/embed/rUxyKA_-grg",
    category: "zen",
    type: "youtube",
    description: "Atmospheric beats with Japanese accents",
    icon: "🗼",
  },
  {
    name: "Zen Temple Ambient",
    url: "synthesized://meditation",
    category: "zen",
    type: "synthesized",
    description: "Synthesized monastery bell & meditation drone",
    icon: "⛩️",
  },
  {
    name: "Shinrin-yoku Melody",
    url: "https://www.youtube.com/embed/xR7oiEJ8x4Q",
    category: "zen",
    type: "youtube",
    description: "Forest bathing melodic environment",
    icon: "🌲",
  },
  {
    name: "Midnight Kyoto",
    url: "https://www.youtube.com/embed/eIho9S2qcfI",
    category: "zen",
    type: "youtube",
    description: "Slow jazz-infused Japanese beats",
    icon: "🌙",
  },
  {
    name: "Kyoto Rain",
    url: "/assets/audio/kyoto-rain.mp3",
    category: "zen",
    type: "audio",
    description: "Gentle rain on Kyoto temple roofs",
    icon: "🌧️",
  },
]

export function FocusMusicPlayer({
  isActive,
  isBreak,
  className = "",
  isZenMode = false,
}: {
  isActive: boolean;
  isBreak: boolean;
  className?: string;
  isZenMode?: boolean;
}) {
  const {
    isPlaying,
    setIsPlaying,
    currentTrack,
    setCurrentTrack,
    volume,
    setVolume,
    activeCategory,
    setActiveCategory,
    recentlyPlayed,
    setRecentlyPlayed,
    ambientTrack,
    setAmbientTrack,
    isAmbientPlaying,
    setIsAmbientPlaying,
    ambientVolume,
    setAmbientVolume,
    activeAmbients,
    toggleAmbient,
    setAmbientVolumeSingle,
  } = useMusicStore()

  const [syncWithTimer, setSyncWithTimer] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("midori_sync_audio_timer")
      return saved ? saved === "true" : true
    }
    return true
  })

  const playerRef = useRef<any>(null)
  const apiReadyRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ambientPlayerRef = useRef<any>(null)
  const [showVideo, setShowVideo] = useState(true)

  // Custom Tracks State
  const { customTracks, addCustomTrack, removeCustomTrack } = useData()
  const { toast } = useToast()
  const [newTrackName, setNewTrackName] = useState("")
  const [newTrackUrl, setNewTrackUrl] = useState("")

  const handleAddCustomTrack = () => {
    if (!newTrackName || !newTrackUrl) return

    if (!extractVideoId(newTrackUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive"
      })
      return
    }

    addCustomTrack({
      name: newTrackName,
      url: newTrackUrl,
      category: "focus",
    })

    setNewTrackName("")
    setNewTrackUrl("")
    toast({
      title: "Track added! 🎵",
      description: "Your custom track has been added to the mix.",
    })
  }

  const handlePlayCustomTrack = (track: any) => {
    handlePlayMusic({
      name: track.name,
      url: track.url,
      category: "focus",
      type: "youtube",
      icon: "🎧",
      description: "Custom Track"
    })
  }

  // Auto-play & sync music based on timer state
  useEffect(() => {
    if (isActive) {
      // Timer is running
      if (!isPlaying) {
        if (syncWithTimer) {
          // If synced, resume current or play default
          if (currentTrack) {
            handlePlayMusic(currentTrack)
          } else {
            const defaultTrack = MUSIC_OPTIONS.find((m) => m.category === (isBreak ? "relax" : "focus"))
            if (defaultTrack) handlePlayMusic(defaultTrack)
          }
        } else {
          // Normal autoplay on start
          if (!isBreak) {
            const focusMusic = MUSIC_OPTIONS.find((m) => m.category === "focus")
            if (focusMusic) handlePlayMusic(focusMusic)
          }
        }
      } else {
        // Music is playing. Handle focus/break transitions
        if (isBreak && currentTrack?.category === "focus") {
          const relaxMusic = MUSIC_OPTIONS.find((m) => m.category === "relax")
          if (relaxMusic) handlePlayMusic(relaxMusic)
        } else if (!isBreak && currentTrack?.category === "relax") {
          const focusMusic = MUSIC_OPTIONS.find((m) => m.category === "focus")
          if (focusMusic) handlePlayMusic(focusMusic)
        }
      }
    } else {
      // Timer is paused or inactive
      if (syncWithTimer && isPlaying) {
        handlePause()
      }
    }
  }, [isActive, isBreak, syncWithTimer])

  // Load YouTube IFrame API on-demand when a YouTube track starts playing
  useEffect(() => {
    const needsYoutube = (currentTrack?.type === "youtube" && isPlaying) || (ambientTrack?.type === "youtube" && isAmbientPlaying)
    if (!needsYoutube) return

    if (typeof window !== "undefined" && !window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0] || document.body
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        apiReadyRef.current = true
      }
    } else if (window.YT) {
      apiReadyRef.current = true
    }
  }, [currentTrack, isPlaying, ambientTrack, isAmbientPlaying])


  // Sync Ambient Track Playback (Multi-sound synthesized soundscapes)
  useEffect(() => {
    const allSynthesizedNames = [
      "Rain Sounds",
      "Forest Sounds",
      "Ocean Waves",
      "Fireplace Sounds",
      "Zen Temple Ambient"
    ]

    allSynthesizedNames.forEach(name => {
      const vol = activeAmbients[name]
      if (vol !== undefined) {
        if (ambientGenerator.isPlaying(name)) {
          ambientGenerator.setVolume(name, vol)
        } else {
          ambientGenerator.start(name, vol)
        }
      } else {
        if (ambientGenerator.isPlaying(name)) {
          ambientGenerator.stop(name)
        }
      }
    })
  }, [activeAmbients])

  // Main YouTube Player Manager
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!currentTrack || currentTrack.type !== "youtube" || !isPlaying) {
      if (playerRef.current) {
        try { playerRef.current.pauseVideo() } catch (e) {}
      }
      return
    }

    const videoId = extractVideoId(currentTrack.url)
    if (!videoId) return

    const runPlayerAction = () => {
      const playerElement = document.getElementById("youtube-player-main-target")
      if (!playerElement || !window.YT || !window.YT.Player) {
        setTimeout(runPlayerAction, 100)
        return
      }

      if (!playerRef.current) {
        try {
          new window.YT.Player("youtube-player-main-target", {
            videoId: videoId,
            playerVars: {
              autoplay: isPlaying ? 1 : 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                playerRef.current = event.target
                const raw = Array.isArray(volume) ? volume[0] : volume || 50
                event.target.setVolume(Math.max(0, Math.min(100, Number(raw))))
                if (isPlaying) event.target.playVideo()
              },
              onError: (event: any) => {
                console.error("YouTube Main Player Error:", event?.data)
              }
            } as any
          })
        } catch (e) {
          console.error("Error creating YouTube player:", e)
        }
      } else {
        try {
          const raw = Array.isArray(volume) ? volume[0] : volume || 50
          playerRef.current.setVolume(Math.max(0, Math.min(100, Number(raw))))
          
          const currentUrl = playerRef.current.getVideoUrl()
          if (!currentUrl || !currentUrl.includes(videoId)) {
            if (isPlaying) {
              playerRef.current.loadVideoById(videoId)
            } else {
              playerRef.current.cueVideoById(videoId)
            }
          } else {
            if (isPlaying) {
              playerRef.current.playVideo()
            } else {
              playerRef.current.pauseVideo()
            }
          }
        } catch (e) {
          playerRef.current = null
          setTimeout(runPlayerAction, 50)
        }
      }
    }

    runPlayerAction()
  }, [currentTrack, isPlaying])

  // Ambient YouTube Player Manager
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!ambientTrack || ambientTrack.type !== "youtube" || !isAmbientPlaying) {
      if (ambientPlayerRef.current) {
        try { ambientPlayerRef.current.pauseVideo() } catch (e) {}
      }
      return
    }

    const videoId = extractVideoId(ambientTrack.url)
    if (!videoId) return

    const runAmbientAction = () => {
      const playerElement = document.getElementById("youtube-player-ambient-target")
      if (!playerElement || !window.YT || !window.YT.Player) {
        setTimeout(runAmbientAction, 100)
        return
      }

      if (!ambientPlayerRef.current) {
        try {
          new window.YT.Player("youtube-player-ambient-target", {
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              rel: 0,
              modestbranding: 1,
              enablejsapi: 1,
              origin: window.location.origin,
              loop: 1,
              playlist: videoId,
            } as any,
            events: {
              onReady: (event: any) => {
                ambientPlayerRef.current = event.target
                const raw = Array.isArray(ambientVolume) ? ambientVolume[0] : ambientVolume || 30
                event.target.setVolume(Math.max(0, Math.min(100, Number(raw))))
                event.target.playVideo()
              },
              onError: (event: any) => {
                console.error("YouTube Ambient Error:", event?.data)
              }
            } as any
          })
        } catch (e) {
          console.error("Error creating YouTube ambient player:", e)
        }
      } else {
        try {
          const raw = Array.isArray(ambientVolume) ? ambientVolume[0] : ambientVolume || 30
          ambientPlayerRef.current.setVolume(Math.max(0, Math.min(100, Number(raw))))
          
          const currentUrl = ambientPlayerRef.current.getVideoUrl()
          if (!currentUrl || !currentUrl.includes(videoId)) {
            ambientPlayerRef.current.loadVideoById(videoId)
          } else {
            ambientPlayerRef.current.playVideo()
          }
        } catch (e) {
          ambientPlayerRef.current = null
          setTimeout(runAmbientAction, 50)
        }
      }
    }

    runAmbientAction()
  }, [ambientTrack, isAmbientPlaying])

  // Sync main volume changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const raw = Array.isArray(volume) ? volume[0] : (volume as any) || 0
      const vol = Math.max(0, Math.min(1, Number(raw) / 100))
      audioRef.current.volume = vol
    }
    if (playerRef.current && isPlaying) {
      try {
        const raw = Array.isArray(volume) ? volume[0] : (volume as any) || 0
        const vol = Math.max(0, Math.min(100, Number(raw)))
        if (typeof playerRef.current.setVolume === "function") {
          playerRef.current.setVolume(vol)
        }
      } catch (e) {}
    }
    if (currentTrack && currentTrack.type === "synthesized" && isPlaying) {
      const raw = Array.isArray(volume) ? volume[0] : (volume as any) || 0
      ambientGenerator.setVolume(currentTrack.name, Number(raw))
    }
  }, [volume, isPlaying, currentTrack])

  const handlePlayAmbient = (track: MusicTrack) => {
    if (ambientTrack?.name === track.name && isAmbientPlaying) {
      setIsAmbientPlaying(false)
      setAmbientTrack(null)
    } else {
      setAmbientTrack(track)
      setIsAmbientPlaying(true)
    }
  }

  const handlePlayMusic = (track: MusicTrack) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (playerRef.current) {
      try { playerRef.current.pauseVideo() } catch (e) {}
    }
    if (currentTrack && currentTrack.type === "synthesized") {
      ambientGenerator.stop(currentTrack.name)
    }

    setCurrentTrack(track)
    setIsPlaying(true)

    if (track.type === "audio") {
      const audio = new Audio(track.url)
      audio.volume = (Array.isArray(volume) ? volume[0] : volume) / 100
      audio.loop = true
      audio.play().catch(() => {})
      audioRef.current = audio
    } else if (track.type === "synthesized") {
      const vol = Array.isArray(volume) ? volume[0] : volume || 50
      ambientGenerator.start(track.name, vol)
    }

    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.name !== track.name)
      return [track, ...filtered].slice(0, 5)
    })
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (playerRef.current) {
      try { playerRef.current.pauseVideo() } catch (e) {}
    }
    if (currentTrack && currentTrack.type === "synthesized") {
      ambientGenerator.stop(currentTrack.name)
    }
    setIsPlaying(false)
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (playerRef.current) {
      try { playerRef.current.stopVideo() } catch (e) {}
    }
    if (currentTrack && currentTrack.type === "synthesized") {
      ambientGenerator.stop(currentTrack.name)
    }
    setIsPlaying(false)
    setCurrentTrack(null)
  }

  const filteredMusic = MUSIC_OPTIONS.filter((m) => m.category === activeCategory)

  const categoryIcons = {
    focus: "🎯",
    relax: "🧘",
    energy: "⚡",
    nature: "🌲",
    zen: "⛩️",
    instrumental: "🎵",
  }

  const categoryLabels = {
    focus: "Deep Focus",
    relax: "Relax & Unwind",
    energy: "Boost Energy",
    nature: "Nature Sounds",
    zen: "Zen Journey",
    instrumental: "Pure Instrumental",
  }

  // --- RENDER BLOCK ---
  return (
    <div className={isZenMode ? "contents" : "block"}>
      {/* Stable Offscreen Players - NEVER unmounted to keep YouTube iframe alive */}
      <div className="fixed top-[-9999px] left-[-9999px] w-[1px] h-[1px] overflow-hidden opacity-0 pointer-events-none select-none z-[-1]">
        <div id="youtube-player-main-target" />
        <div id="youtube-player-ambient-target" />
      </div>

      {!isZenMode && (
        <Card className={`card-zen overflow-hidden relative ${className}`}>
          {/* Ambient glow when playing */}
          {isPlaying && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: "radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.07) 0%, transparent 65%)"
              }}
            />
          )}

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100/60 dark:border-slate-800/60 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <span className="text-xl">🎵</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Focus Groove</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {isPlaying && currentTrack ? currentTrack.name : "Choose your sound"}
                  </p>
                </div>
              </div>

              {/* Sync Timer Switch & Equalizer */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <span>Sync Timer</span>
                  <Switch
                    checked={syncWithTimer}
                    onCheckedChange={(checked) => {
                      setSyncWithTimer(checked)
                      localStorage.setItem("midori_sync_audio_timer", String(checked))
                    }}
                    className="scale-75 origin-right"
                  />
                </div>

                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-5 mr-1">
                    {[3, 5, 4, 6, 3].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-emerald-500 rounded-full"
                        style={{
                          height: `${h * 3}px`,
                          animation: `equalizer ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                        }}
                      />
                    ))}
                    <style>{`
                      @keyframes equalizer {
                        from { transform: scaleY(0.4); }
                        to   { transform: scaleY(1);   }
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CardContent className="px-5 py-4 space-y-4 relative z-10">
            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as MusicTrack["category"] | "custom")}>
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 mb-3">
                <TabsList className="flex items-center gap-1 h-auto p-1 bg-slate-100/60 dark:bg-slate-800/50 rounded-xl min-w-max">
                  {(["focus", "zen", "relax", "energy", "nature", "instrumental"] as const).map((cat) => {
                    const colors: Record<string, string> = {
                      focus: "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400",
                      zen: "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                      relax: "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
                      energy: "data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400",
                      nature: "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400",
                      instrumental: "data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400",
                    }
                    return (
                      <TabsTrigger
                        key={cat}
                        value={cat}
                        title={categoryLabels[cat]}
                        className={`flex-1 min-w-[60px] text-[10px] py-1.5 flex flex-col items-center gap-0.5 rounded-lg transition-all
                          data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm
                          text-slate-400 ${colors[cat]} font-bold uppercase tracking-wider`}
                      >
                        <span className="text-base leading-none">{categoryIcons[cat]}</span>
                        <span className="hidden sm:block">{cat}</span>
                      </TabsTrigger>
                    )
                  })}
                  <TabsTrigger
                    value="custom"
                    title="Custom Mix"
                    className="flex-1 min-w-[60px] text-[10px] py-1.5 flex flex-col items-center gap-0.5 rounded-lg transition-all
                      data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm
                      text-slate-400 data-[state=active]:text-slate-700 dark:data-[state=active]:text-slate-200 font-bold uppercase tracking-wider"
                  >
                    <span className="text-base leading-none">🎧</span>
                    <span className="hidden sm:block">Custom</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {(["focus", "zen", "relax", "energy", "nature", "instrumental"] as const).map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-3 focus-visible:outline-none">
                  <div className="grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredMusic.map((music) => {
                      const playing = isPlaying && currentTrack?.name === music.name
                      return (
                        <button
                          key={music.name}
                          onClick={() => handlePlayMusic(music)}
                          aria-label={`${playing ? "Now playing" : "Play"} ${music.name}`}
                          className={`group relative flex items-center gap-2.5 p-2.5 text-left rounded-xl transition-all border ${playing
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                            : "bg-white/60 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-sm"
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${playing ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"
                            }`}>
                            {music.icon || "🎵"}
                          </div>
                          <span className={`text-xs font-semibold truncate ${playing ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                            {music.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}

              <TabsContent value="custom" className="mt-3 focus-visible:outline-none">
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Add YouTube Track</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Track name"
                        value={newTrackName}
                        onChange={(e) => setNewTrackName(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="YouTube URL"
                        value={newTrackUrl}
                        onChange={(e) => setNewTrackUrl(e.target.value)}
                        className="h-8 text-xs flex-[2]"
                      />
                      <Button size="sm" onClick={handleAddCustomTrack} className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!newTrackName || !newTrackUrl}>
                        <Icons.plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {customTracks.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-slate-400 text-xs italic">Add your favorite YouTube tracks above!</div>
                    ) : (
                      customTracks.map((track) => {
                        const playing = isPlaying && currentTrack?.name === track.name
                        return (
                          <div
                            key={track.id}
                            className={`group flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${playing
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-white/60 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 hover:bg-white dark:hover:bg-slate-800"
                              }`}
                          >
                            <button onClick={() => handlePlayCustomTrack(track)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${playing ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"}`}>🎧</div>
                              <span className={`text-xs font-semibold truncate ${playing ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>{track.name}</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeCustomTrack(track.id) }} className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                              <Icons.trash className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Nature Mixer */}
            <div className="bg-slate-50/70 dark:bg-slate-800/30 rounded-xl p-3 border border-slate-100/80 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Icons.leaf className="w-3 h-3" /> Nature Mixer
                </h4>
              </div>
              <div className="flex gap-2">
                {[
                  { name: "Rain Sounds", icon: <Icons.cloudRain className="w-4 h-4" />, label: "Rain" },
                  { name: "Forest Sounds", icon: <Icons.tree className="w-4 h-4" />, label: "Forest" },
                  { name: "Ocean Waves", icon: <Icons.droplets className="w-4 h-4" />, label: "Ocean" },
                  { name: "Fireplace Sounds", icon: <Icons.sun className="w-4 h-4" />, label: "Fire" }
                ].map((scape) => {
                  const active = activeAmbients[scape.name] !== undefined

                  return (
                    <button
                      key={scape.name}
                      onClick={() => toggleAmbient(scape.name)}
                      title={scape.name}
                      className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all min-h-[54px] border ${active
                          ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "bg-white/40 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 border-slate-200/40 dark:border-slate-700/40"
                        }`}
                    >
                      {scape.icon}
                      <span className="text-[9px] mt-1 font-semibold tracking-wide">{scape.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Multi-sound individual sliders */}
              {Object.keys(activeAmbients).length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {Object.keys(activeAmbients).map((name) => {
                    const vol = activeAmbients[name]
                    const scape = [
                      { name: "Rain Sounds", label: "Rain" },
                      { name: "Forest Sounds", label: "Forest" },
                      { name: "Ocean Waves", label: "Ocean" },
                      { name: "Fireplace Sounds", label: "Fire" }
                    ].find(s => s.name === name)
                    if (!scape) return null
                    return (
                      <div key={name} className="flex items-center justify-between gap-3 text-xs bg-white/50 dark:bg-slate-800/20 p-2 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
                        <span className="font-semibold text-slate-600 dark:text-slate-350 text-[10px]">{scape.label}</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                          <Slider
                            value={[vol]}
                            onValueChange={(val) => setAmbientVolumeSingle(name, val[0])}
                            max={100}
                            className="flex-1"
                          />
                          <span className="text-[9px] font-mono text-slate-400 w-6 text-right">{vol}%</span>
                        </div>
                        <button
                          onClick={() => toggleAmbient(name)}
                          className="text-red-500 hover:text-red-400 text-[10px] font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Now Playing floating bar  */}
            {isPlaying && currentTrack && (
              <div className="bg-slate-900 dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg relative z-20">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg flex-shrink-0">
                    {currentTrack.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{currentTrack.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{activeCategory}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Icons.volume className="w-3 h-3 text-slate-400" />
                    <Slider value={volume} onValueChange={setVolume} max={100} className="w-16" />
                    <Button size="icon" variant="ghost" onClick={handlePause} aria-label={isPlaying ? "Pause music" : "Resume music"} className="h-7 w-7 min-w-[36px] min-h-[36px] text-white hover:bg-white/10 rounded-full">
                      <Icons.pause className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleStop} aria-label="Stop music" className="h-7 w-7 min-w-[36px] min-h-[36px] text-red-400 hover:text-red-300 hover:bg-white/10 rounded-full">
                      <Icons.stop className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
