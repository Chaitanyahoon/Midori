"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

// --- Sakura Particle Component ---
const SakuraParticles = () => {
    const [petals, setPetals] = useState<any[]>([])

    useEffect(() => {
        // fewer petals for a lighter, simpler look
        const petalCount = 6
        const newPetals = Array.from({ length: petalCount }).map((_, i) => ({
            id: i,
            left: `${10 + Math.random() * 80}%`,
            delay: `${Math.random() * 6}s`,
            duration: `${8 + Math.random() * 10}s`,
            size: `${6 + Math.random() * 6}px`,
        }))
        setPetals(newPetals)
    }, [])

    return (
        <div className="sakura-container overflow-hidden">
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="sakura"
                    style={{
                        left: petal.left,
                        animationDelay: petal.delay,
                        animationDuration: petal.duration,
                        width: petal.size,
                        height: petal.size,
                    }}
                />
            ))}
        </div>
    )
}

export default function HomePage() {
    const router = useRouter()
    const [isActive, setIsActive] = useState(false)
    
    // Mouse Parallax Effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsActive(true)
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            const x = (clientX / innerWidth) - 0.5
            const y = (clientY / innerHeight) - 0.5
            setMousePos({ x, y })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const getParallaxStyle = (strength: number) => ({
        transform: `translate3d(${mousePos.x * strength}px, ${mousePos.y * strength}px, 0)`,
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
    })

    return (
        <div 
            ref={containerRef} 
            className={`h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans pt-8 px-4 ${isActive ? 'active' : ''}`}
        >
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Sakura Particles */}
            <SakuraParticles />

            {/* Cinematic Light Leaks */}
            <div 
                className="light-leak top-[-10%] left-[-10%] opacity-20 dark:opacity-25" 
                style={getParallaxStyle(30)}
            />
            <div 
                className="light-leak bottom-[-8%] right-[-8%] opacity-15 dark:opacity-20 bg-teal-500/10" 
                style={getParallaxStyle(-20)}
            />

            {/* Vertical Decorative Text (Ma) */}
            {/* simplified: hide large decorative vertical text on desktop for compact design */}

            {/* Floating Kanji Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span className="absolute top-[6%] left-[8%] text-[6rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow" style={getParallaxStyle(30)}>緑</span>
                <span className="absolute bottom-[4%] right-[8%] text-[8rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow" style={getParallaxStyle(-40)}>和</span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-3xl px-4">
                <div className="mb-8 md:mb-12 flex flex-col items-center reveal-staggered delay-1">
                    <div className="p-4 md:p-6 bg-white/30 dark:bg-emerald-950/8 backdrop-blur-md rounded-2xl border border-white/30 dark:border-emerald-500/8 shadow-sm mb-6 md:mb-8 transition-all duration-500 flex items-center justify-center">
                        <div className="bg-white/90 dark:bg-emerald-900/10 rounded-xl p-3 md:p-4 flex items-center justify-center">
                            <img src="/midori_logo.png" alt="Midori" className="w-12 h-12 md:w-14 md:h-14 pointer-events-none transition-transform group-hover:rotate-6 duration-500" />
                        </div>
                    </div>
                        <div className="absolute -bottom-3 -right-3 hanko-seal hanko-seal-filter animate-pulse-slow scale-110">
                            <span className="text-red-700 dark:text-red-500 font-serif font-black text-lg select-none">緑</span>
                        </div>
                </div>

                <div className="space-y-3 mb-8 md:mb-10">
                    <h1 className="text-3xl md:text-5xl font-serif-luxury text-slate-900 dark:text-white tracking-tight leading-[1.05] reveal-staggered delay-2"> 
                        <span className="reveal-text"><span>Cultivate</span></span>{' '}
                        <span className="italic font-light opacity-80 reveal-text"><span>Focus.</span></span>
                        <br />
                        <span className="reveal-text"><span>Harvest</span></span>{' '}
                        <span className="text-emerald-700 dark:text-emerald-500 reveal-text"><span>Growth.</span></span>
                    </h1>
                </div>

                <p className="text-base md:text-lg text-slate-500 dark:text-emerald-100/40 mb-8 md:mb-10 font-medium tracking-[0.5em] uppercase reveal-staggered delay-3">
                    Your Digital Zen Sanctuary
                </p>

                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center reveal-staggered delay-4">
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="h-12 md:h-14 px-8 md:px-12 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-serif-luxury font-medium text-base md:text-lg shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Enter the Garden <span className="text-xs opacity-60 font-serif italic">/ 入園</span>
                        </span>
                    </button>
                    <button 
                        onClick={() => router.push("/login")}
                        className="px-4 py-2 text-slate-500 dark:text-emerald-100/30 hover:text-slate-900 dark:hover:text-emerald-400 font-serif-luxury font-medium uppercase tracking-[0.25em] transition-all relative"
                    >
                        Sign In <span className="text-[9px] opacity-40 block mt-1 font-serif italic tracking-normal">/ ログイン</span>
                    </button>
                </div>

                <div className="mt-16 md:mt-24 flex items-center justify-center gap-8 md:gap-12 opacity-10 reveal-staggered delay-5">
                    <span className="text-[10px] font-bold uppercase tracking-[1em]">Minimal</span>
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[1em]">Focused</span>
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[1em]">Zen</span>
                </div>
            </div>
        </div>
    )
}
