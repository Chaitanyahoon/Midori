"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import type { User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // auth is null during SSR (Firebase only initializes on the client)
        if (!auth) {
            setLoading(false)
            return
        }
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const signOut = async () => {
        if (auth) {
            await firebaseSignOut(auth)
        }
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
