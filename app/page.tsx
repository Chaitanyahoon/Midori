"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SakuraParticles } from "@/components/dashboard/sakura-particles"
import { ModeToggle } from "@/components/mode-toggle"

export default function HomePage() {
    const router = useRouter()
    const [isActive, setIsActive] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsActive(true)
        const container = containerRef.current
        if (!container) return
        
        container.style.setProperty("--mouse-x", "0")
        container.style.setProperty("--mouse-y", "0")

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            const x = (clientX / innerWidth) - 0.5
            const y = (clientY / innerHeight) - 0.5
            
            container.style.setProperty("--mouse-x", x.toString())
            container.style.setProperty("--mouse-y", y.toString())
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div 
            ref={containerRef} 
            className={`h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans pt-8 px-4 ${isActive ? 'active' : ''}`}
        >
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Theme Toggle in Top Right */}
            <div className="absolute top-6 right-6 z-50 reveal-staggered delay-1">
                <ModeToggle />
            </div>

            {/* Sakura Particles */}
            <SakuraParticles />

            {/* Cinematic Light Leaks */}
            <div 
                className="light-leak top-[-10%] left-[-10%] opacity-20 dark:opacity-25" 
                style={{
                    transform: "translate3d(calc(var(--mouse-x, 0) * 30px), calc(var(--mouse-y, 0) * 30px), 0)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            />
            <div 
                className="light-leak bottom-[-8%] right-[-8%] opacity-15 dark:opacity-20 bg-teal-500/10" 
                style={{
                    transform: "translate3d(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * -20px), 0)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            />

            {/* Floating Kanji Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span 
                    className="absolute top-[8%] left-[8%] text-[6rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow" 
                    style={{
                        transform: "translate3d(calc(var(--mouse-x, 0) * 30px), calc(var(--mouse-y, 0) * 30px), 0)",
                        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                >
                    緑
                </span>
                <span 
                    className="absolute bottom-[6%] right-[8%] text-[8rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow" 
                    style={{
                        transform: "translate3d(calc(var(--mouse-x, 0) * -40px), calc(var(--mouse-y, 0) * -40px), 0)",
                        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                >
                    和
                </span>
            </div>

            {/* Central Glow Aura behind Content Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0" />

            {/* Main Content Card */}
            <div className="relative z-10 text-center max-w-xl w-full px-6 py-10 md:py-14 bg-white/30 dark:bg-emerald-950/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-emerald-500/5 shadow-2xl mx-4 transition-all duration-700 hover:border-white/30 dark:hover:border-emerald-500/10 hover:shadow-emerald-500/5 animate-bloom">
                
                {/* Custom Glassmorphic SVG Logo */}
                <div className="mb-6 md:mb-8 flex flex-col items-center reveal-staggered delay-1">
                    <div className="relative p-5 bg-gradient-to-tr from-white/20 to-white/10 dark:from-emerald-950/20 dark:to-emerald-950/5 backdrop-blur-xl rounded-full border border-white/20 dark:border-emerald-500/10 shadow-lg transition-all duration-500 hover:scale-105 group hover:border-emerald-500/20 flex items-center justify-center">
                        <div className="flex items-center justify-center">
                            <svg className="w-14 h-14 md:w-16 md:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="leafGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                    <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#F59E0B" />
                                        <stop offset="50%" stopColor="#D97706" />
                                        <stop offset="100%" stopColor="#B45309" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <path
                                    d="M 50,15 A 35,35 0 1,1 25,28"
                                    stroke="url(#goldGrad)"
                                    strokeWidth="4.5"
                                    strokeLinecap="round"
                                    fill="none"
                                    className="opacity-70 dark:opacity-85"
                                    filter="url(#glow)"
                                />
                                <path
                                    d="M 48,22 C 63,30 65,58 48,76 C 33,58 35,30 48,22 Z"
                                    fill="url(#leafGrad)"
                                    className="drop-shadow-md"
                                />
                                <path
                                    d="M 52,48 C 66,48 72,36 62,30 C 52,36 50,44 52,48 Z"
                                    fill="url(#leafGrad)"
                                    className="drop-shadow-md"
                                    opacity="0.85"
                                />
                                <path
                                    d="M 48,22 C 47,38 47,60 48,76"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        {/* Hanko Seal */}
                        <div className="absolute -bottom-1 -right-1 hanko-seal hanko-seal-filter animate-pulse-slow scale-110">
                            <span className="text-red-700 dark:text-red-500 font-serif font-black text-sm select-none">緑</span>
                        </div>
                    </div>
                </div>

                {/* Typography Header */}
                <div className="space-y-3 mb-8">
                    <h1 className="text-3xl md:text-5xl font-serif-luxury text-slate-900 dark:text-white tracking-tight leading-[1.1] reveal-staggered delay-2"> 
                        <span className="reveal-text"><span>Cultivate</span></span>{' '}
                        <span className="italic font-light opacity-80 reveal-text"><span>Focus.</span></span>
                        <br />
                        <span className="reveal-text"><span>Harvest</span></span>{' '}
                        <span className="text-emerald-700 dark:text-emerald-500 reveal-text"><span>Growth.</span></span>
                    </h1>
                </div>

                <p className="text-xs md:text-sm text-slate-500 dark:text-emerald-100/40 mb-10 font-semibold tracking-[0.45em] uppercase reveal-staggered delay-3">
                    Your Digital Zen Sanctuary
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center reveal-staggered delay-4">
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="btn-masterpiece w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-serif-luxury font-medium text-base md:text-lg shadow-md hover:shadow-emerald-500/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>Enter the Garden</span>
                        <span className="text-xs opacity-65 font-serif italic">/ 入園</span>
                    </button>
                    <button 
                        onClick={() => router.push("/login")}
                        className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-full border border-slate-300 dark:border-emerald-500/20 text-slate-700 dark:text-emerald-300 hover:bg-slate-50/50 dark:hover:bg-emerald-950/20 font-serif-luxury font-medium text-base hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>Sign In</span>
                        <span className="text-xs opacity-65 font-serif italic">/ ログイン</span>
                    </button>
                </div>

                {/* Minimalist zen values */}
                <div className="mt-12 md:mt-16 flex items-center justify-center gap-6 md:gap-8 opacity-25 reveal-staggered delay-5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.8em]">Minimal</span>
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.8em]">Focused</span>
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.8em]">Zen</span>
                </div>
            </div>
        </div>
    )
}
