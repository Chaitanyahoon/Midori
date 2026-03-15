"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
    const router = useRouter()
    
    // Mouse Parallax Effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
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
        transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
    })

    return (
        <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans">
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Cinematic Light Leaks */}
            <div 
                className="light-leak top-[-10%] left-[-10%] opacity-30 dark:opacity-40" 
                style={getParallaxStyle(60)}
            />
            <div 
                className="light-leak bottom-[-10%] right-[-10%] opacity-20 dark:opacity-25 bg-teal-500/20" 
                style={getParallaxStyle(-40)}
            />

            {/* Vertical Decorative Text (Ma) */}
            <div className="hidden lg:flex fixed left-16 top-1/2 -translate-y-1/2 flex-col items-center gap-16 opacity-[0.1] select-none pointer-events-none" style={getParallaxStyle(20)}>
                <span className="vertical-text text-8xl font-serif text-slate-800 dark:text-emerald-100 reveal-staggered delay-1">美どり</span>
                <div className="w-px h-48 bg-current reveal-staggered delay-2" />
                <span className="text-sm tracking-[1em] uppercase font-bold reveal-staggered delay-3">Midori</span>
            </div>
            <div className="hidden lg:flex fixed right-16 top-1/2 -translate-y-1/2 flex-col items-center gap-16 opacity-[0.1] select-none pointer-events-none" style={getParallaxStyle(-20)}>
                <span className="text-sm tracking-[1em] uppercase font-bold reveal-staggered delay-3">Zen</span>
                <div className="w-px h-48 bg-current reveal-staggered delay-2" />
                <span className="vertical-text text-8xl font-serif text-slate-800 dark:text-emerald-100 reveal-staggered delay-1">静寂</span>
            </div>

            {/* Floating Kanji Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span className="absolute top-[10%] left-[20%] text-[20rem] font-serif opacity-[0.04] dark:opacity-[0.03] animate-float-slow reveal-staggered delay-1" style={getParallaxStyle(80)}>緑</span>
                <span className="absolute bottom-[10%] right-[20%] text-[25rem] font-serif opacity-[0.04] dark:opacity-[0.03] animate-float-slow [animation-delay:5s] reveal-staggered delay-2" style={getParallaxStyle(-100)}>和</span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-4xl px-6">
                <div className="mb-12 flex flex-col items-center reveal-staggered delay-1">
                    <div className="p-8 bg-white/40 dark:bg-emerald-950/20 backdrop-blur-3xl rounded-[3rem] border border-white/30 dark:border-emerald-500/10 shadow-organic-2xl mb-10 transition-transform hover:scale-105 duration-1000 relative group">
                        <img src="/icon.svg" alt="Midori" className="w-24 h-24 pointer-events-none" />
                        <div className="absolute -bottom-3 -right-3 hanko-seal hanko-seal-filter animate-pulse-slow">
                            <span className="text-red-600 dark:text-red-500 font-serif font-bold text-lg select-none">緑</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter reveal-staggered delay-2 flex flex-col items-center gap-4">
                    <span>Cultivate Focus.</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Harvest Growth.</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 dark:text-emerald-100/40 mb-12 font-medium tracking-widest uppercase reveal-staggered delay-3">
                    Your Digital Zen Sanctuary — <span className="font-serif italic text-emerald-700/60 dark:text-emerald-400/40">Midori</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center reveal-staggered delay-4">
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="h-16 px-12 rounded-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-black text-xl shadow-2xl shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95 btn-masterpiece"
                    >
                        Enter the Garden / 入園
                    </button>
                    <button 
                        onClick={() => router.push("/login")}
                        className="text-slate-500 dark:text-emerald-100/30 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold uppercase tracking-[0.2em] transition-all"
                    >
                        Sign In / ログイン
                    </button>
                </div>

                <div className="mt-24 flex items-center justify-center gap-8 opacity-20 reveal-staggered delay-5">
                    <span className="text-xs font-bold uppercase tracking-widest">Minimal</span>
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-widest">Focused</span>
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-widest">Zen</span>
                </div>
            </div>
        </div>
    )
}
