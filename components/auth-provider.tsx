"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"

interface AuthContextType {
    user: any
    loading: boolean
    signOut: () => Promise<void>
    setMockUser: (user: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for mock user in local storage
        if (typeof window !== "undefined") {
            const mockUserStr = localStorage.getItem("mockUser")
            if (mockUserStr) {
                try {
                    setUser(JSON.parse(mockUserStr))
                    setLoading(false)
                    return
                } catch (e) {
                    // ignore
                }
            }
        }

        // auth is null during SSR (Firebase only initializes on the client)
        if (!auth) {
            setLoading(false)
            return
        }
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
            } else {
                if (typeof window !== "undefined") {
                    const currentMock = localStorage.getItem("mockUser")
                    if (currentMock) {
                        try {
                            setUser(JSON.parse(currentMock))
                        } catch (e) {
                            setUser(null)
                        }
                    } else {
                        setUser(null)
                    }
                } else {
                    setUser(null)
                }
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const setMockUser = (mockUser: any) => {
        if (mockUser) {
            localStorage.setItem("mockUser", JSON.stringify(mockUser))
            setUser(mockUser)
        } else {
            localStorage.removeItem("mockUser")
            setUser(null)
        }
    }

    const signOut = async () => {
        localStorage.removeItem("mockUser")
        if (auth) {
            try {
                await firebaseSignOut(auth)
            } catch (e) {
                // ignore
            }
        }
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut, setMockUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
