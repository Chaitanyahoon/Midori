"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

// --- Sakura Particle Component ---
const SakuraParticles = () => {
    const [petals, setPetals] = useState<any[]>([])

    useEffect(() => {
        const petalCount = 15
        const newPetals = Array.from({ length: petalCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 10}s`,
            duration: `${10 + Math.random() * 15}s`,
            size: `${5 + Math.random() * 10}px`,
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
            className={`min-h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans ${isActive ? 'active' : ''}`}
        >
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Sakura Particles */}
            <SakuraParticles />

            {/* Cinematic Light Leaks */}
            <div 
                className="light-leak top-[-15%] left-[-15%] opacity-40 dark:opacity-50" 
                style={getParallaxStyle(80)}
            />
            <div 
                className="light-leak bottom-[-15%] right-[-15%] opacity-30 dark:opacity-40 bg-teal-500/20" 
                style={getParallaxStyle(-60)}
            />

            {/* Vertical Decorative Text (Ma) */}
            <div className="hidden lg:flex fixed left-10 top-1/2 -translate-y-1/2 flex-col items-center gap-12 opacity-[0.12] select-none pointer-events-none" style={getParallaxStyle(30)}>
                <span className="vertical-text text-7xl font-serif-luxury text-slate-800 dark:text-emerald-100 reveal-staggered delay-1">美どり</span>
                <div className="w-px h-32 bg-current reveal-staggered delay-2" />
                <span className="text-[10px] tracking-[1.5em] uppercase font-bold reveal-staggered delay-3">Midori</span>
            </div>
            
            <div className="hidden lg:flex fixed right-10 top-1/2 -translate-y-1/2 flex-col items-center gap-12 opacity-[0.12] select-none pointer-events-none" style={getParallaxStyle(-30)}>
                <span className="text-[10px] tracking-[1.5em] uppercase font-bold reveal-staggered delay-3">Zen</span>
                <div className="w-px h-32 bg-current reveal-staggered delay-2" />
                <span className="vertical-text text-7xl font-serif-luxury text-slate-800 dark:text-emerald-100 reveal-staggered delay-1">静寂</span>
            </div>

            {/* Floating Kanji Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span className="absolute top-[5%] left-[15%] text-[25rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow reveal-staggered delay-1" style={getParallaxStyle(120)}>緑</span>
                <span className="absolute bottom-[2%] right-[10%] text-[30rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow [animation-delay:5s] reveal-staggered delay-2" style={getParallaxStyle(-140)}>和</span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-5xl px-6">
                <div className="mb-16 flex flex-col items-center reveal-staggered delay-1">
                    <div className="p-10 bg-white/20 dark:bg-emerald-950/10 backdrop-blur-3xl rounded-[4rem] border border-white/40 dark:border-emerald-500/10 shadow-organic-2xl mb-12 transition-all hover:scale-105 duration-1000 relative group cursor-pointer">
                        <img src="/icon.svg" alt="Midori" className="w-28 h-28 pointer-events-none transition-transform group-hover:rotate-12 duration-700" />
                        <div className="absolute -bottom-4 -right-4 hanko-seal hanko-seal-filter animate-pulse-slow scale-125">
                            <span className="text-red-700 dark:text-red-500 font-serif font-black text-xl select-none">緑</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-16">
                    <h1 className="text-7xl md:text-9xl font-serif-luxury text-slate-900 dark:text-white tracking-tight leading-[0.9] reveal-staggered delay-2">
                        <span className="reveal-text"><span>Cultivate</span></span>{' '}
                        <span className="italic font-light opacity-80 reveal-text"><span>Focus.</span></span>
                        <br />
                        <span className="reveal-text"><span>Harvest</span></span>{' '}
                        <span className="text-emerald-700 dark:text-emerald-500 reveal-text"><span>Growth.</span></span>
                    </h1>
                </div>

                <p className="text-lg md:text-xl text-slate-500 dark:text-emerald-100/30 mb-16 font-medium tracking-[1em] uppercase reveal-staggered delay-3 ml-[1em]">
                    Your Digital Zen Sanctuary
                </p>

                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center reveal-staggered delay-4">
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="h-20 px-16 rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-black text-xl shadow-2xl transition-all hover:scale-110 active:scale-95 btn-masterpiece group overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-4">
                            Enter the Garden <span className="text-sm opacity-50 font-serif">/ 入園</span>
                        </span>
                    </button>
                    <button 
                        onClick={() => router.push("/login")}
                        className="px-8 py-4 text-slate-400 dark:text-emerald-100/20 hover:text-slate-900 dark:hover:text-emerald-400 font-bold uppercase tracking-[0.3em] transition-all hover:tracking-[0.4em] relative"
                    >
                        Sign In <span className="text-[10px] opacity-40 block mt-1 font-serif tracking-normal">/ ログイン</span>
                    </button>
                </div>

                <div className="mt-32 flex items-center justify-center gap-12 opacity-10 reveal-staggered delay-5">
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
