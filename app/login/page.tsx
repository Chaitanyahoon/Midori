"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiEye as Eye, FiEyeOff as EyeOff, FiLoader as Loader2 } from "react-icons/fi"
import { toast } from "sonner"
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { useAuth } from "@/components/auth-provider"
import { ModeToggle } from "@/components/mode-toggle"

export default function LoginPage() {
    const router = useRouter()
    const { setMockUser } = useAuth()
    const [activeTab, setActiveTab] = useState(0) // 0: Log In, 1: Sign Up
    const isSignUp = activeTab === 1
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        setIsActive(true)
    }, [])

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Diagnostic check
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            console.error("Firebase API Key is missing from environment variables.")
            toast.error("Configuration error: API Key is missing. Check your .env setup.")
            setLoading(false)
            return
        }

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                if (name.trim() && userCredential.user) {
                    await updateProfile(userCredential.user, { displayName: name.trim() })
                }
                toast.success("Account created successfully!")
            } else {
                await signInWithEmailAndPassword(auth, email, password)
                toast.success("Welcome back!")
            }
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Email auth error:", err)
            const msg = err.code?.replace("auth/", "").replace(/-/g, " ") ?? "Something went wrong"
            toast.error(msg.charAt(0).toUpperCase() + msg.slice(1))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setLoading(true)

        // Diagnostic check
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            console.error("Firebase API Key is missing from environment variables.")
            toast.error("Configuration error: API Key is missing.")
            setLoading(false)
            return
        }

        try {
            await signInWithPopup(auth, new GoogleAuthProvider())
            toast.success("Successfully signed in with Google")
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Google sign-in error details:", {
                code: err.code,
                message: err.message,
                customData: err.customData,
                email: err.customData?.email
            })
            
            if (err.code === "auth/operation-not-allowed") {
                toast.error("Google sign-in is not enabled in Firebase Console.")
            } else if (err.code === "auth/unauthorized-domain") {
                toast.error("This domain is not authorized for Firebase Authentication.")
            } else {
                toast.error("Google sign-in failed. Check the console for more details.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans ${isActive ? 'active' : ''}`}>
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Theme Toggle in Top Right */}
            <div className="absolute top-6 right-6 z-50 reveal-staggered delay-1">
                <ModeToggle />
            </div>

            {/* Floating background Kanji */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-5">
                <span className="absolute top-8 left-8 text-[3.5rem] font-serif opacity-20">緑</span>
            </div>

            {/* Central Glow Aura behind Content Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none z-0" />

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-[390px] px-4 reveal-staggered delay-4">
                <div className="bg-white/30 dark:bg-emerald-950/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-emerald-500/5 shadow-2xl p-6 sm:p-8 overflow-hidden relative">
                    
                    {/* Subtle Internal Light Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

                    {/* Logo Branding */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative p-3.5 bg-gradient-to-tr from-white/20 to-white/10 dark:from-emerald-950/20 dark:to-emerald-950/5 backdrop-blur-xl rounded-full border border-white/20 dark:border-emerald-500/10 shadow-md mb-3 flex items-center justify-center group hover:border-emerald-500/20 transition-all duration-300">
                            <div className="flex items-center justify-center">
                                <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                    </defs>
                                    <path
                                        d="M 50,15 A 35,35 0 1,1 25,28"
                                        stroke="url(#goldGrad)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        fill="none"
                                        className="opacity-70 dark:opacity-85"
                                    />
                                    <path
                                        d="M 50,22 C 65,22 75,35 75,55 C 75,70 60,78 50,78 C 40,78 25,70 25,55 C 25,35 35,22 50,22 Z"
                                        fill="url(#leafGrad)"
                                        className="drop-shadow-sm"
                                    />
                                    <path
                                        d="M 50,22 C 53,35 55,60 50,78"
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            {/* Hanko Seal */}
                            <div className="absolute -bottom-1 -right-1 hanko-seal hanko-seal-filter scale-90">
                                <span className="text-red-700 dark:text-red-500 font-serif font-black text-[10px] select-none">緑</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-serif-luxury text-slate-900 dark:text-white mb-0 tracking-tight">Midori</h1>
                        <p className="text-xs text-slate-500 dark:text-emerald-100/40">Focus Garden — Kyōei</p>
                    </div>

                    {/* Tabs switcher */}
                    <div className="flex rounded-2xl bg-slate-900/5 dark:bg-emerald-950/20 p-1 mb-5 border border-slate-200/50 dark:border-emerald-500/5">
                        {["Log In", "Sign Up"].map((label, i) => (
                            <button
                                key={label}
                                onClick={() => setActiveTab(i)}
                                className={`flex-1 py-2.5 text-xs sm:text-sm font-serif-luxury font-bold rounded-xl transition-all duration-300 active:scale-95
                                  ${activeTab === i
                                        ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 dark:text-emerald-100/40 dark:hover:text-emerald-100/70 font-medium"
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
                        className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-[0.98] mb-5 disabled:opacity-50 shadow-sm"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>Continue with Google</span>
                    </button>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/50 dark:border-white/5" /></div>
                        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.25em] font-bold"><span className="bg-transparent px-3 text-emerald-600/40 dark:text-emerald-500/20">Or continue with email</span></div>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4 flex flex-col">
                        <div 
                            className={`group space-y-1 transition-all duration-300 ease-in-out overflow-hidden origin-top ${
                                isSignUp ? "max-h-[76px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                            }`}
                            aria-hidden={!isSignUp}
                        >
                            <label className="text-[10px] font-bold text-slate-400 dark:text-emerald-100/30 uppercase tracking-[0.08em] block mb-0.5" htmlFor="fullName">Full name</label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={isSignUp}
                                tabIndex={isSignUp ? 0 : -1}
                                className="w-full h-12 px-4 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-200 dark:border-white/5 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-100/20 focus:outline-none focus:border-emerald-450 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="group space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-emerald-100/30 uppercase tracking-[0.08em] block mb-0.5" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 px-4 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-200 dark:border-white/5 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-100/20 focus:outline-none focus:border-emerald-450 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="group space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-emerald-100/30 uppercase tracking-[0.08em]" htmlFor="password">Password</label>
                                {!isSignUp && (
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (min 6 chars)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    tabIndex={0}
                                    minLength={6}
                                    className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-200 dark:border-white/5 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-100/20 focus:outline-none focus:border-emerald-450 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={0}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-emerald-500/15"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (isSignUp ? "Sign Up" : "Sign In")}
                        </button>
                    </form>

                    <p className="text-center text-[10px] tracking-wider uppercase font-semibold text-slate-400 dark:text-emerald-100/20 mt-6">
                        Built for Deep Work
                    </p>
                </div>
            </div>
        </div>
    )
}
