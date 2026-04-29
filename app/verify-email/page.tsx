"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { toast } from "sonner"
import { FiLoader as Loader2 } from "react-icons/fi"

export default function VerifyEmailPage() {
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "promptEmail" | "error" | "success">("loading")
    const [email, setEmail] = useState("")
    const processedRef = useRef(false)

    useEffect(() => {
        // Prevent double-execution in React strict mode
        if (processedRef.current) return
        processedRef.current = true

        const verifyLink = async () => {
            if (!isSignInWithEmailLink(auth, window.location.href)) {
                setStatus("error")
                toast.error("Invalid or expired sign-in link.")
                return
            }

            let savedEmail = window.localStorage.getItem("emailForSignIn")
            
            if (!savedEmail) {
                // If opened on a different device, we don't have the email in localStorage.
                setStatus("promptEmail")
                return
            }

            completeSignIn(savedEmail)
        }

        verifyLink()
    }, [])

    const completeSignIn = async (signInEmail: string) => {
        setStatus("loading")
        try {
            await signInWithEmailLink(auth, signInEmail, window.location.href)
            window.localStorage.removeItem("emailForSignIn")
            setStatus("success")
            toast.success("Successfully signed in!")
            
            // Short delay to show success state before redirecting
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        } catch (err: any) {
            console.error("Sign in error", err)
            setStatus("error")
            const msg = err.code?.replace("auth/", "").replace(/-/g, " ") ?? "Failed to sign in"
            toast.error(msg.charAt(0).toUpperCase() + msg.slice(1))
        }
    }

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        completeSignIn(email)
    }

    return (
        <div className="h-screen w-full flex items-center justify-center zen-gradient-bg relative overflow-hidden font-sans">
            <div className="washi-overlay pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none select-none opacity-5">
                <span className="absolute top-4 left-4 text-[3.5rem] font-serif opacity-10">緑</span>
            </div>

            <div className="relative z-10 w-full max-w-sm px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/40 dark:bg-emerald-950/14 backdrop-blur-sm border border-white/8 dark:border-emerald-500/6 rounded-xl p-8 overflow-hidden relative text-center">
                    
                    <div className="flex flex-col items-center mb-6">
                        <div className="p-1 bg-white/80 dark:bg-emerald-900/8 rounded-md shadow-sm mb-3">
                            <img src="/midori_logo.png" alt="Midori logo" className="w-12 h-12 pointer-events-none" />
                        </div>
                        <h1 className="text-xl font-serif-luxury text-slate-900 dark:text-white tracking-tight">Authenticating</h1>
                    </div>

                    {status === "loading" && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <p className="text-sm text-slate-500 dark:text-emerald-100/60">Verifying your magic link...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-emerald-50 font-medium">Redirecting to garden...</p>
                        </div>
                    )}

                    {status === "promptEmail" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
                            <p className="text-xs text-center text-slate-600 dark:text-emerald-50/70 mb-4">
                                You opened this link on a different device. Please confirm your email to continue.
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
                                    className="w-full h-12 px-5 rounded-2xl bg-white/40 dark:bg-emerald-950/40 border border-slate-100 dark:border-white/5 dark:text-white placeholder:text-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!email}
                                className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                            >
                                Confirm Email
                            </button>
                        </form>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-emerald-100/60">This link is invalid or has expired.</p>
                            <button
                                onClick={() => router.push("/login")}
                                className="px-4 py-2 mt-2 rounded-lg bg-white/50 dark:bg-emerald-900/20 text-slate-700 dark:text-emerald-100/80 text-sm font-medium hover:bg-white/80 dark:hover:bg-emerald-900/40 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
