"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FiEye as Eye, FiEyeOff as EyeOff, FiLoader as Loader2 } from "react-icons/fi"
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase/client"

export default function LoginPage() {
    const router = useRouter()
    const [isSignUp, setIsSignUp] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    
    // Mouse Parallax Effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            // Normalize to -0.5 to 0.5
            const x = (clientX / innerWidth) - 0.5
            const y = (clientY / innerHeight) - 0.5
            setMousePos({ x, y })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                if (name.trim() && userCredential.user) {
                    await updateProfile(userCredential.user, { displayName: name.trim() })
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password)
            }
            router.push("/dashboard")
        } catch (err: any) {
            const msg = err.code?.replace("auth/", "").replace(/-/g, " ") ?? "Something went wrong"
            setError(msg.charAt(0).toUpperCase() + msg.slice(1))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError("")
        setLoading(true)
        try {
            await signInWithPopup(auth, new GoogleAuthProvider())
            router.push("/dashboard")
        } catch (err: any) {
            setError("Google sign-in failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Parallax Helpers
    const getParallaxStyle = (strength: number) => ({
        transform: `translate3d(${mousePos.x * strength}px, ${mousePos.y * strength}px, 0)`,
        transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
    })

    return (
        <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans">
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Cinematic Light Leaks (Mouse Driven) */}
            <div 
                className="light-leak top-[-10%] left-[-10%] opacity-20 dark:opacity-30" 
                style={getParallaxStyle(40)}
            />
            <div 
                className="light-leak bottom-[-10%] right-[-10%] opacity-15 dark:opacity-20 bg-teal-500/20" 
                style={getParallaxStyle(-30)}
            />

            {/* Vertical Decorative Text (Ma) with Parallax */}
            <div className="hidden lg:flex fixed left-12 top-1/2 -translate-y-1/2 flex-col items-center gap-12 opacity-[0.08] select-none pointer-events-none" style={getParallaxStyle(15)}>
                <span className="vertical-text text-6xl font-serif text-slate-800 dark:text-emerald-100 reveal-staggered delay-3">静寂</span>
                <div className="w-px h-32 bg-current reveal-staggered delay-4" />
                <span className="text-sm tracking-[0.5em] uppercase font-medium reveal-staggered delay-5">Stillness</span>
            </div>
            <div className="hidden lg:flex fixed right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-12 opacity-[0.08] select-none pointer-events-none" style={getParallaxStyle(-15)}>
                <span className="text-sm tracking-[0.5em] uppercase font-medium reveal-staggered delay-5">Growth</span>
                <div className="w-px h-32 bg-current reveal-staggered delay-4" />
                <span className="vertical-text text-6xl font-serif text-slate-800 dark:text-emerald-100 reveal-staggered delay-3">成長</span>
            </div>

            {/* Floating Kanji Background with Depth Parallax */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span 
                    className="absolute top-[15%] left-[10%] text-[12rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow reveal-staggered delay-1"
                    style={getParallaxStyle(50)}
                >緑</span>
                <span 
                    className="absolute bottom-[20%] right-[15%] text-[15rem] font-serif opacity-[0.03] dark:opacity-[0.02] animate-float-slow [animation-delay:4s] reveal-staggered delay-2"
                    style={getParallaxStyle(-60)}
                >心</span>
                <span 
                    className="absolute top-[40%] right-[10%] text-[10rem] font-serif opacity-[0.02] dark:opacity-[0.01] animate-float-slow [animation-delay:8s] reveal-staggered delay-3"
                    style={getParallaxStyle(30)}
                >空</span>
            </div>

            {/* Realistic Hanko Stamp SVG Filter */}
            <svg className="hidden">
                <filter id="hanko-ink-spread">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="blur" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                    <feDisplacementMap in="blur" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                    <feComposite in="SourceGraphic" operator="atop" />
                </filter>
            </svg>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-lg px-6 py-12 reveal-staggered delay-4">
                <div className="bg-white/40 dark:bg-emerald-950/20 backdrop-blur-3xl border border-white/20 dark:border-emerald-500/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] p-10 lg:p-14 overflow-hidden relative group/card">
                    
                    {/* Subtle Internal Light Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

                    {/* Hanko-style Logo Branding */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative mb-6">
                            <div className="p-4 bg-white/50 dark:bg-emerald-900/40 rounded-2xl shadow-sm border border-white/40 dark:border-white/5 relative group transition-all duration-700 hover:scale-110 hover:-rotate-3">
                                <img src="/icon.svg" alt="Midori logo" className="w-16 h-16 pointer-events-none" />
                                {/* Hanko Seal Element with realistic filter */}
                                <div className="absolute -bottom-2 -right-3 hanko-seal hanko-seal-filter transition-all hover:scale-110 cursor-default">
                                    <span className="text-red-600 dark:text-red-500 font-serif font-bold text-xs select-none [text-shadow:0_0_1px_rgba(0,0,0,0.1)]">みどり</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight flex items-baseline gap-3">
                            Midori
                            <span className="text-lg font-serif text-slate-400/60 dark:text-emerald-300/30">みどり</span>
                        </h1>
                        <p className="text-slate-500 dark:text-emerald-100/40 text-sm font-medium uppercase tracking-widest text-center">
                            Focus Garden — <span className="text-emerald-600/60 dark:text-emerald-400/40 italic">Kyōei</span>
                        </p>
                    </div>

                    {/* Tabs with Staggered Elements */}
                    <div className="flex rounded-2xl bg-emerald-900/5 dark:bg-emerald-900/20 p-1.5 mb-8 border border-emerald-500/10 backdrop-blur-sm">
                        {["Log In", "Sign Up"].map((label, i) => (
                            <button
                                key={label}
                                onClick={() => { setIsSignUp(i === 1); setError("") }}
                                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-500
                                  ${(isSignUp ? i === 1 : i === 0)
                                        ? "bg-emerald-500 dark:bg-emerald-500 text-emerald-950 shadow-[0_8px_16px_rgba(16,185,129,0.2)]"
                                        : "text-slate-500 hover:text-slate-800 dark:text-emerald-100/40 dark:hover:text-emerald-100/70"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Google button */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-white/80 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-emerald-500/5 transition-all duration-300 text-sm font-semibold text-slate-700 dark:text-emerald-50/80 mb-6 disabled:opacity-50 btn-masterpiece"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold"><span className="bg-transparent px-4 text-emerald-600/40 dark:text-emerald-400/30">Haimen — Entry</span></div>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && (
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-emerald-100/20 uppercase tracking-[0.1em] ml-1">Namae — Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full h-12 px-5 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/5 dark:text-white placeholder:text-slate-300 dark:placeholder:text-emerald-100/10 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-all font-medium"
                                />
                            </div>
                        )}
                        <div className="group space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-emerald-100/20 uppercase tracking-[0.1em] ml-1">Yūbin — Email</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 px-5 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/5 dark:text-white placeholder:text-slate-300 dark:placeholder:text-emerald-100/10 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-all font-medium"
                            />
                        </div>
                        <div className="group space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-emerald-100/20 uppercase tracking-[0.1em] ml-1">Aikotoba — Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full h-12 px-5 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/5 dark:text-white placeholder:text-slate-300 dark:placeholder:text-emerald-100/10 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-500 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl animate-shake font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-bold text-base shadow-xl shadow-emerald-600/20 dark:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group mt-4 btn-masterpiece"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Begin Your Journey / 始めましょう" : "Enter the Garden / ログイン")}
                        </button>
                    </form>

                    <p className="text-center text-[9px] text-slate-400 dark:text-emerald-100/20 uppercase tracking-[0.3em] mt-10 font-bold">
                        Midori Sanctuary — Built for <span className="text-emerald-500 dark:text-emerald-400">Deep Work</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
