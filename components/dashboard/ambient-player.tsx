"use client"

import { useState, useRef, useEffect } from "react"
import { Icons } from "@/components/icons"
import { FiSkipForward } from "react-icons/fi"
import { toast } from "sonner"

const TRACKS = [
    { id: "rain", name: "Kyoto Rain", src: "/assets/audio/kyoto-rain.mp3" },
    { id: "wind", name: "Bamboo Wind Chimes", src: "/assets/audio/wind-chimes.mp3" },
    { id: "binaural", name: "Deep Focus (40Hz)", src: "/assets/audio/deep-focus.mp3" },
]

export function AmbientPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [volume, setVolume] = useState(0.3)
    const [isExpanded, setIsExpanded] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const currentTrack = TRACKS[currentTrackIndex]

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    const togglePlay = () => {
        if (!audioRef.current) return
        
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            // Attempt playback and catch missing file errors
            audioRef.current.play().then(() => {
                setIsPlaying(true)
            }).catch(err => {
                console.error("Audio playback failed:", err)
                toast.error("Audio file not found. Please add mp3 files to /public/assets/audio/")
                setIsPlaying(false)
            })
        }
    }

    const nextTrack = () => {
        const nextIdx = (currentTrackIndex + 1) % TRACKS.length
        setCurrentTrackIndex(nextIdx)
        if (isPlaying) {
            setTimeout(() => {
                audioRef.current?.play().catch(() => {})
            }, 50)
        }
    }

    return (
        <div className={`fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-[260px]' : 'w-12 sm:w-14'} h-12 sm:h-14 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex items-center group`}>
            
            {/* Toggle Button */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center text-slate-500 dark:text-emerald-100/70 hover:text-emerald-500 transition-colors bg-transparent border-none outline-none"
            >
                <Icons.music className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-emerald-500' : ''}`} />
            </button>

            {/* Expanded Controls */}
            <div className={`flex items-center gap-3 px-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col min-w-[100px]">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">Ambient Focus</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[110px]">{currentTrack.name}</span>
                </div>
                
                <button 
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors flex-shrink-0 shadow-md shadow-emerald-500/20 active:scale-95"
                >
                    {isPlaying ? <Icons.pause className="w-4 h-4" /> : <Icons.play className="w-4 h-4 ml-0.5" />}
                </button>
                
                <button 
                    onClick={nextTrack}
                    className="w-8 h-8 rounded-full text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors flex-shrink-0 active:scale-95"
                >
                    <FiSkipForward className="w-4 h-4" />
                </button>
            </div>

            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef}
                src={currentTrack.src}
                loop
            />
        </div>
    )
}
