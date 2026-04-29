"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiLoader as Loader2, FiArrowLeft as ArrowLeft } from "react-icons/fi"
import { sendPasswordResetEmail } from "firebase/auth"
import { toast } from "sonner"
import { auth } from "@/lib/firebase/client"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

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
        <div className="h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans">
            {/* Washi Texture Overlay */}
            <div className="washi-overlay pointer-events-none" />

            {/* Simplified background for compact layout */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-5">
                <span className="absolute top-4 left-4 text-[3.5rem] font-serif opacity-10">緑</span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-sm px-4 py-2 reveal-staggered delay-4">
                <div className="bg-white/40 dark:bg-emerald-950/14 backdrop-blur-sm border border-white/8 dark:border-emerald-500/6 rounded-xl p-6 overflow-hidden relative">
                    
                    {/* Hanko-style Logo Branding */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="p-1 bg-white/80 dark:bg-emerald-900/8 rounded-md shadow-sm mb-1">
                            <img src="/midori_logo.png" alt="Midori logo" className="w-10 h-10 pointer-events-none" />
                        </div>
                        <h1 className="text-lg font-serif-luxury text-slate-900 dark:text-white mb-0 tracking-tight">Midori</h1>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-100/40">Password Recovery</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleReset} className="space-y-4 flex flex-col">
                            <p className="text-xs text-center text-slate-600 dark:text-emerald-50/70 leading-relaxed mb-2">
                                Enter the email address associated with your account, and we'll send you a link to reset your password.
                            </p>

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

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
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
                            <p className="text-xs text-center text-slate-600 dark:text-emerald-100/60 leading-relaxed">
                                We've sent a password reset link to <br/>
                                <span className="font-medium text-slate-800 dark:text-emerald-100/80">{email}</span>
                            </p>
                        </div>
                    )}

                    <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
                        <Link 
                            href="/login" 
                            className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-emerald-100/40 hover:text-slate-800 dark:hover:text-emerald-100/80 transition-colors"
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
