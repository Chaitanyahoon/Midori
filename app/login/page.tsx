"use client"

import { useState } from "react"
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

export default function LoginPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState(0) // 0: Log In, 1: Sign Up
    const isSignUp = activeTab === 1
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)



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
        <div className="h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans">
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Simplified background for compact layout */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-5">
                <span className="absolute top-4 left-4 text-[3.5rem] font-serif opacity-10">緑</span>
            </div>

            {/* minimal svg placeholder kept for future small effects */}

            {/* Main Content */}
            <div 
                className="relative z-10 w-full max-w-sm px-4 py-2 reveal-staggered delay-4"
            >
                <div className="bg-white/40 dark:bg-emerald-950/14 backdrop-blur-sm border border-white/8 dark:border-emerald-500/6 rounded-xl p-4 overflow-hidden relative">
                    
                    {/* Subtle Internal Light Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

                    {/* Hanko-style Logo Branding */}
                    <div className="flex flex-col items-center mb-3">
                        <div className="p-1 bg-white/80 dark:bg-emerald-900/8 rounded-md shadow-sm mb-1">
                            <img src="/midori_logo.png" alt="Midori logo" className="w-10 h-10 pointer-events-none" />
                        </div>
                        <h1 className="text-lg font-serif-luxury text-slate-900 dark:text-white mb-0 tracking-tight">Midori</h1>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-100/40">Focus Garden — Kyōei</p>
                    </div>

                    {/* Tabs with Staggered Elements */}
                    <div className="flex rounded-lg bg-emerald-900/5 dark:bg-emerald-900/12 p-1 mb-4 border border-emerald-500/6">
                        {["Log In", "Sign Up"].map((label, i) => (
                            <button
                                key={label}
                                onClick={() => setActiveTab(i)}
                                className={`flex-1 py-3 text-xs sm:text-sm font-serif-luxury font-semibold rounded-xl transition-all duration-500
                                  ${activeTab === i
                                        ? "bg-emerald-500 dark:bg-emerald-500 text-emerald-950 shadow-[0_8px_16px_rgba(16,185,129,0.2)]"
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
                        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-emerald-900/6 border border-slate-100 dark:border-emerald-500/8 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 dark:text-emerald-50/80 mb-4 disabled:opacity-50"
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

                    <div className="relative mb-3">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5" /></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold"><span className="bg-transparent px-3 text-emerald-600/40">Or continue with email</span></div>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3 flex flex-col">
                        <div 
                            className={`group space-y-1 transition-all duration-300 ease-in-out overflow-hidden origin-top ${
                                isSignUp ? "max-h-[72px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                            }`}
                            aria-hidden={!isSignUp}
                        >
                            <label className="text-[10px] font-semibold text-slate-400 dark:text-emerald-100/30 uppercase tracking-[0.08em]" htmlFor="fullName">Full name</label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={isSignUp}
                                tabIndex={isSignUp ? 0 : -1}
                                className="w-full h-10 px-3 rounded-lg bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/6 dark:text-white placeholder:text-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                            />
                        </div>

                        <div className="group space-y-1">
                            <label className="text-[10px] font-semibold text-slate-400 dark:text-emerald-100/30 uppercase tracking-[0.08em]" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 px-5 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/5 dark:text-white placeholder:text-slate-300 dark:placeholder:text-emerald-100/10 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                            />
                        </div>
                        <div 
                            className="group space-y-1"
                            aria-hidden={false}
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-semibold text-slate-400 dark:text-emerald-100/30 uppercase tracking-[0.08em]" htmlFor="password">Password</label>
                                {!isSignUp && (
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    tabIndex={0}
                                    minLength={6}
                                    className="w-full h-10 px-3 rounded-lg bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/6 dark:text-white placeholder:text-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={0}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? "Sign up" : "Sign in")}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 dark:text-emerald-100/30 mt-4">
                        Built for Deep Work
                    </p>
                </div>
            </div>
        </div>
    )
}
