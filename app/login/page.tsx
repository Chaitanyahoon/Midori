"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 px-4">
            {/* Decorative blobs */}
            <div className="fixed top-[-10%] left-[-5%] w-72 h-72 bg-emerald-200/40 dark:bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 bg-teal-200/40 dark:bg-teal-900/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-100 dark:border-emerald-900 rounded-3xl shadow-2xl shadow-emerald-100/50 dark:shadow-emerald-950/50 p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 mb-3 drop-shadow-xl">
                            <img src="/icon.svg" alt="Planthesia logo" className="w-full h-full" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planthesia</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Grow your focus, one task at a time</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                        {["Sign In", "Sign Up"].map((label, i) => (
                            <button
                                key={label}
                                onClick={() => { setIsSignUp(i === 1); setError("") }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                  ${(isSignUp ? i === 1 : i === 0)
                                        ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-200 text-sm font-medium text-slate-700 dark:text-slate-200 mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        <span className="text-xs text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                        {isSignUp && (
                            <input
                                type="text"
                                placeholder="Display Name (e.g. Chaitanya)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors"
                        />
                        <input
                            type="password"
                            placeholder="Password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors"
                        />

                        {error && (
                            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 dark:shadow-emerald-900 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
                        >
                            {loading ? "Please wait..." : (isSignUp ? "Create Account 🌱" : "Sign In →")}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-5">
                        By signing in, you agree to our{" "}
                        <span className="text-emerald-600 cursor-pointer hover:underline">Terms</span> and{" "}
                        <span className="text-emerald-600 cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
