"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiLoader as Loader2, FiArrowLeft as ArrowLeft } from "react-icons/fi"
import { sendPasswordResetEmail } from "firebase/auth"
import { toast } from "sonner"
import { auth } from "@/lib/firebase/client"
import { ModeToggle } from "@/components/mode-toggle"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        setIsActive(true)
    }, [])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setSuccess(false)
        setLoading(true)

        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            toast.error("Configuration error: API Key is missing.")
            setLoading(false)
            return
        }

        try {
            await sendPasswordResetEmail(auth, email)
            setSuccess(true)
            toast.success("Reset link sent!")
        } catch (err: any) {
            console.error("Password reset error:", err)
            const msg = err.code?.replace("auth/", "").replace(/-/g, " ") ?? "Failed to send reset link"
            toast.error(msg.charAt(0).toUpperCase() + msg.slice(1))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans ${isActive ? 'active' : ''}`}>
            {/* Theme Toggle in Top Right */}
            <div className="absolute top-6 right-6 z-50 reveal-staggered delay-1">
                <ModeToggle />
            </div>
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Floating background Kanji */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-5">
                <span className="absolute top-8 left-8 text-[3.5rem] font-serif opacity-20">緑</span>
            </div>

            {/* Central Glow Aura behind Content Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none z-0" />

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-[390px] px-4 reveal-staggered delay-4">
                <div className="bg-white/30 dark:bg-emerald-950/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-emerald-500/5 shadow-2xl p-6 sm:p-8 overflow-hidden relative">
                    
                    {/* Logo Branding */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative p-3 bg-white/30 dark:bg-emerald-950/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-emerald-500/10 shadow-md mb-3 flex items-center justify-center group hover:border-emerald-500/20 transition-all duration-300">
                            <div className="bg-white/90 dark:bg-emerald-900/10 rounded-xl p-2.5 flex items-center justify-center shadow-inner">
                                <img src="/midori_logo.png" alt="Midori Logo" className="w-10 h-10 pointer-events-none transition-transform group-hover:rotate-6 duration-500" />
                            </div>
                        </div>
                        <h1 className="text-xl font-serif-luxury text-slate-900 dark:text-white mb-0 tracking-tight">Midori</h1>
                        <p className="text-xs text-slate-500 dark:text-emerald-100/40">Password Recovery</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleReset} className="space-y-4 flex flex-col">
                            <p className="text-xs text-center text-slate-600 dark:text-emerald-50/70 leading-relaxed mb-2">
                                Enter the email address associated with your account, and we'll send you a link to reset your password.
                            </p>

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

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-emerald-500/15"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-slate-800 dark:text-emerald-50">Check your inbox</h2>
                            <p className="text-xs text-center text-slate-650 dark:text-emerald-100/60 leading-relaxed">
                                We've sent a password reset link to <br/>
                                <span className="font-semibold text-slate-800 dark:text-emerald-100/80">{email}</span>
                            </p>
                        </div>
                    )}

                    <div className="mt-6 border-t border-slate-200/50 dark:border-white/5 pt-4">
                        <Link 
                            href="/login" 
                            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-emerald-100/40 hover:text-slate-800 dark:hover:text-emerald-100/80 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
