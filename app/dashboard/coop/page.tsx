"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import { useAuth } from "@/components/auth-provider"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { collection, addDoc, onSnapshot, query, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

interface ChatMessage {
    id: string
    text: string
    userId: string
    userName: string
    createdAt: string
}

interface CoopSign {
    id: string
    text: string
    userName: string
    createdAt: string
}

const PLANT_NAMES: Record<string, string> = {
    sakura: "Sakura Tree",
    maple: "Maple Tree",
    pine: "Pine Tree",
    sunflower: "Sunflower",
    tulip: "Tulip",
    orchid: "Orchid",
}

export default function CoopPage() {
    const { sharedGarden, joinSharedGarden, createSharedGarden, updateSettings, settings, updateSharedGarden } = useData()
    const { user } = useAuth()
    const [joinCode, setJoinCode] = useState("")
    const [gardenName, setGardenName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sendingMsg, setSendingMsg] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const [activeTab, setActiveTab] = useState<"join" | "create">("join")
    const [memberCount, setMemberCount] = useState(0)
    const [rightTab, setRightTab] = useState<"chat" | "nursery" | "board">("chat")
    const [signs, setSigns] = useState<CoopSign[]>([])
    const [newSignText, setNewSignText] = useState("")

    const handleNurture = async (plantId: string) => {
        if (!sharedGarden) return
        const costSun = 20
        const costWater = 20
        
        if (sharedGarden.sunlightPool < costSun || sharedGarden.waterPool < costWater) {
            toast.error("Not enough communal resources! Complete tasks & focus sessions to earn more.")
            return
        }

        const updatedPlants = (sharedGarden.plants || []).map((p: any) => {
            if (p.id === plantId) {
                const currentNurture = p.nurtureLevel ?? 0
                return { ...p, nurtureLevel: Math.min(currentNurture + 20, 100) }
            }
            return p
        })

        try {
            await updateSharedGarden({
                sunlightPool: sharedGarden.sunlightPool - costSun,
                waterPool: sharedGarden.waterPool - costWater,
                plants: updatedPlants
            })
            toast.success("Communal plant nurtured! Check visual garden to watch it grow. 💧☀️")
        } catch (e) {
            console.error("Nurture error:", e)
            toast.error("Failed to nurture plant")
        }
    }

    const handleHarvest = async (plantId: string) => {
        if (!sharedGarden) return
        const plant = (sharedGarden.plants || []).find((p: any) => p.id === plantId)
        if (!plant) return
        
        const bonusSun = 100
        const bonusWater = 50

        const updatedPlants = (sharedGarden.plants || []).map((p: any) => {
            if (p.id === plantId) {
                return { ...p, status: "mature", nurtureLevel: 100 }
            }
            return p
        })

        try {
            await updateSharedGarden({
                sunlightPool: (sharedGarden.sunlightPool || 0) + bonusSun,
                waterPool: (sharedGarden.waterPool || 0) + bonusWater,
                plants: updatedPlants
            })
            toast.success(`🎉 Landmark complete! Earned +${bonusSun} Sun & +${bonusWater} Water pool rewards!`)
        } catch (e) {
            console.error("Harvest error:", e)
            toast.error("Failed to harvest plant")
        }
    }

    const handleRemovePlant = async (plantId: string) => {
        if (!sharedGarden) return
        const updatedPlants = (sharedGarden.plants || []).filter((p: any) => p.id !== plantId)
        try {
            await updateSharedGarden({ plants: updatedPlants })
            toast.info("Plant removed from Co-op Garden.")
        } catch (e) {
            toast.error("Failed to remove plant")
        }
    }

    // Real-time signs listener
    useEffect(() => {
        if (!sharedGarden?.id) return
        
        if (!db) {
            const storageKey = `midori_mock_signs_${sharedGarden.id}`
            try {
                const stored = localStorage.getItem(storageKey)
                if (stored) {
                    setSigns(JSON.parse(stored))
                } else {
                    const defaultSigns: CoopSign[] = [
                        {
                            id: "sign-1",
                            text: "Remember to breathe today! 🧘‍♂️",
                            userName: "ZenMaster",
                            createdAt: new Date(Date.now() - 7200000).toISOString()
                        },
                        {
                            id: "sign-2",
                            text: "Let's focus on the Sakura tree! 🌸",
                            userName: "Hana",
                            createdAt: new Date(Date.now() - 3600000).toISOString()
                        }
                    ]
                    setSigns(defaultSigns)
                    localStorage.setItem(storageKey, JSON.stringify(defaultSigns))
                }
            } catch (e) {}
            return
        }

        const q = query(
            collection(db, "shared_gardens", sharedGarden.id, "signs"),
            orderBy("createdAt", "desc"),
            limit(10)
        )
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CoopSign)).reverse()
            setSigns(list)
        }, (err) => {
            console.error("Signs listener error:", err)
        })
        return () => unsub()
    }, [sharedGarden?.id])

    const handlePinSign = async () => {
        if (!newSignText.trim() || !sharedGarden?.id || !user) return
        const text = newSignText.trim()
        
        if (!db) {
            const newSign: CoopSign = {
                id: Math.random().toString(36).substring(7),
                text,
                userName: settings.userName || user.displayName || user.email?.split("@")[0] || "Anonymous",
                createdAt: new Date().toISOString()
            }
            setSigns(prev => {
                const next = [...prev, newSign]
                const storageKey = `midori_mock_signs_${sharedGarden.id}`
                try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch (e) {}
                return next
            })
            setNewSignText("")
            toast.success("Wooden sign pinned to the master board! 🪵")
            return
        }

        try {
            await addDoc(collection(db, "shared_gardens", sharedGarden.id, "signs"), {
                text,
                userId: user.uid,
                userName: settings.userName || user.displayName || user.email?.split("@")[0] || "Anonymous",
                createdAt: new Date().toISOString()
            })
            setNewSignText("")
            toast.success("Wooden sign pinned to the master board! 🪵")
        } catch (e) {
            console.error("Pin sign error:", e)
            toast.error("Failed to pin sign")
        }
    }

    // Cross-tab real-time sync for offline/mock messages and signs
    useEffect(() => {
        if (db || !sharedGarden?.id) return
        const handleStorage = (e: StorageEvent) => {
            try {
                if (e.key === `midori_mock_chat_${sharedGarden.id}` && e.newValue) {
                    setMessages(JSON.parse(e.newValue))
                }
                if (e.key === `midori_mock_signs_${sharedGarden.id}` && e.newValue) {
                    setSigns(JSON.parse(e.newValue))
                }
            } catch (err) {
                console.error("Storage event chat/signs sync error:", err)
            }
        }
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [sharedGarden?.id, db])

    // Real-time chat listener
    useEffect(() => {
        if (!sharedGarden?.id) return
        
        if (!db) {
            const storageKey = `midori_mock_chat_${sharedGarden.id}`
            try {
                const stored = localStorage.getItem(storageKey)
                if (stored) {
                    setMessages(JSON.parse(stored))
                } else {
                    const defaultMsgs: ChatMessage[] = [
                        {
                            id: "mock-1",
                            text: "Hey everyone! Welcome to our new co-op garden! 🌱",
                            userId: "user-sora",
                            userName: "Sora",
                            createdAt: new Date(Date.now() - 3600000).toISOString()
                        },
                        {
                            id: "mock-2",
                            text: "Awesome! I just finished a 25-minute Pomodoro, added some water to the pool 💧",
                            userId: "user-hana",
                            userName: "Hana",
                            createdAt: new Date(Date.now() - 1800000).toISOString()
                        },
                        {
                            id: "mock-3",
                            text: "Nice work Hana! I'm about to finish my daily tasks to get us some sunlight ☀️",
                            userId: "user-zenmaster",
                            userName: "ZenMaster",
                            createdAt: new Date(Date.now() - 900000).toISOString()
                        }
                    ]
                    setMessages(defaultMsgs)
                    localStorage.setItem(storageKey, JSON.stringify(defaultMsgs))
                }
            } catch (e) {
                console.error("Failed to load mock messages:", e)
            }
            return
        }

        const q = query(
            collection(db, "shared_gardens", sharedGarden.id, "messages"),
            orderBy("createdAt", "desc"),
            limit(100)
        )
        const unsub = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse()
            setMessages(msgs)
        }, (err) => {
            console.error("Chat listener error:", err)
        })
        return () => unsub()
    }, [sharedGarden?.id])

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleCreate = async () => {
        if (!gardenName.trim()) { toast.error("Enter a garden name"); return }
        setIsLoading(true)
        try {
            const code = await createSharedGarden(gardenName.trim())
            if (code) {
                toast.success(`Garden created! Code: ${code}`)
                setGardenName("")
            }
        } catch (e: any) {
            console.error("Create error:", e)
            toast.error(e?.message || "Failed to create. Check console for details.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoin = async () => {
        const code = joinCode.trim().toUpperCase()
        if (!code || code.length < 4) { toast.error("Enter a valid code"); return }
        setIsLoading(true)
        try {
            await joinSharedGarden(code)
            toast.success("Joined the garden!")
            setJoinCode("")
        } catch (e: any) {
            console.error("Join error:", e)
            toast.error(e?.message || "Garden not found. Check the code.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLeave = async () => {
        try {
            await updateSettings({ activeSharedGardenId: null })
            toast.info("Left the shared garden")
        } catch (e: any) {
            console.error("Leave error:", e)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !sharedGarden?.id || !user) return
        setSendingMsg(true)

        if (!db) {
            const newMsg: ChatMessage = {
                id: Math.random().toString(36).substring(7),
                text: newMessage.trim(),
                userId: user.uid,
                userName: settings.userName || user.displayName || user.email?.split("@")[0] || "Anonymous",
                createdAt: new Date().toISOString()
            }
            
            setMessages(prev => {
                const next = [...prev, newMsg]
                const storageKey = `midori_mock_chat_${sharedGarden.id}`
                try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch (e) {}
                return next
            })
            setNewMessage("")
            setSendingMsg(false)

            // Simulate replies from other members for offline sandbox testing
            setTimeout(() => {
                const botNames = ["Hana", "Sora", "ZenMaster"]
                const botResponses = [
                    "Let's keep going! 🚀",
                    "Amazing focus! 🌟 Keep it up!",
                    "Our plants are looking happy today! 🌸",
                    "Pomodoro time! Let's get that water pool filled 💧",
                    "Task completed! You're doing great! ☀️"
                ]
                const randomName = botNames[Math.floor(Math.random() * botNames.length)]
                const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
                
                const replyMsg: ChatMessage = {
                    id: Math.random().toString(36).substring(7),
                    text: randomResponse,
                    userId: `bot-${randomName.toLowerCase()}`,
                    userName: randomName,
                    createdAt: new Date().toISOString()
                }

                setMessages(prev => {
                    const next = [...prev, replyMsg]
                    const storageKey = `midori_mock_chat_${sharedGarden.id}`
                    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch (e) {}
                    return next
                })
            }, 1200)
            return
        }

        try {
            await addDoc(collection(db, "shared_gardens", sharedGarden.id, "messages"), {
                text: newMessage.trim(),
                userId: user.uid,
                userName: settings.userName || user.displayName || user.email?.split("@")[0] || "Anonymous",
                createdAt: new Date().toISOString()
            })
            setNewMessage("")
        } catch (e: any) {
            console.error("Send message error:", e)
            toast.error("Failed to send message")
        } finally {
            setSendingMsg(false)
        }
    }

    const copyCode = () => {
        if (sharedGarden?.id) {
            navigator.clipboard.writeText(sharedGarden.id)
            toast.success("Code copied!")
        }
    }

    // ── NO GARDEN: LANDING VIEW ──
    if (!sharedGarden) {
        return (
            <div className="w-full min-h-full ambient-bg px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <div className="max-w-2xl mx-auto space-y-6 sm:space-y-10">
                    {/* Header */}
                    <div className="text-center mb-10 animate-bloom">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-5">
                            <Icons.heart className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
                            Kyōei Co-op Garden
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                            共栄 — Shared Prosperity. Grow together with friends. Every task completed and pomodoro finished contributes to a shared resource pool.
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6 max-w-xs mx-auto">
                        <button
                            onClick={() => setActiveTab("join")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "join" ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-300" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            Join Garden
                        </button>
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "create" ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-300" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            Create Garden
                        </button>
                    </div>

                    {/* Forms */}
                    <div className="card-zen p-6 sm:p-8">
                        {activeTab === "join" ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Garden Invite Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. A7X9BQ"
                                        className={`w-full h-12 bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 text-lg font-mono uppercase tracking-widest text-center placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none transition-all ${
                                            joinCode.trim().length === 6
                                                ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 dark:border-emerald-500"
                                                : joinCode.trim().length > 0
                                                    ? "border-amber-400 focus:ring-2 focus:ring-amber-400/40 dark:border-amber-400"
                                                    : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
                                        }`}
                                        value={joinCode}
                                        onChange={e => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                                        maxLength={6}
                                        onKeyDown={e => e.key === "Enter" && handleJoin()}
                                    />
                                    <p className="text-xs text-slate-400 mt-2">Ask a friend for their 6-character garden code</p>
                                </div>
                                <button
                                    onClick={handleJoin}
                                    disabled={isLoading || !joinCode.trim()}
                                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:cursor-not-allowed text-sm"
                                >
                                    {isLoading ? "Joining..." : "Join Garden"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Garden Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Zen Masters"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                        value={gardenName}
                                        onChange={e => setGardenName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleCreate()}
                                    />
                                </div>
                                <button
                                    onClick={handleCreate}
                                    disabled={isLoading || !gardenName.trim()}
                                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:cursor-not-allowed text-sm"
                                >
                                    {isLoading ? "Creating..." : "Create Garden"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {[
                            { icon: "☀️", title: "Shared Sunlight", desc: "Tasks completed by any member add sunlight to the pool" },
                            { icon: "💧", title: "Shared Water", desc: "Pomodoro sessions fill the communal water reserve" },
                            { icon: "💬", title: "Real-time Chat", desc: "Talk with your garden members while you focus" },
                        ].map(card => (
                            <div key={card.title} className="card-zen p-4 text-center hover:scale-105 transition-transform duration-300 cursor-default">
                                <span className="text-2xl">{card.icon}</span>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-2">{card.title}</h3>
                                <p className="text-[11px] text-slate-500 mt-1">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ── ACTIVE GARDEN VIEW ──
    return (
        <div className="w-full h-full flex flex-col md:flex-row ambient-bg">
            {/* Left panel: Garden Info */}
            <div className="w-full md:w-72 lg:w-80 xl:w-96 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 overflow-y-auto">
                {/* Garden header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{sharedGarden.name}</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kyōei Co-op Garden</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                        <Icons.heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                {/* Invite Code */}
                <div className="card-zen p-4 mb-5 [transform:none_!important] hover:translate-y-0">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Invite Code</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-lg px-3 py-2 font-mono font-bold text-lg tracking-[0.25em] text-emerald-700 dark:text-emerald-300 text-center select-all">
                            {sharedGarden.id}
                        </code>
                        <button
                            onClick={copyCode}
                            className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                            title="Copy code"
                        >
                            <Icons.check className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Resource Pools */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="card-zen p-4 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 hover:scale-[1.02]">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                            <Icons.sun className="w-4 h-4" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Sunlight</span>
                        </div>
                        <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{sharedGarden.sunlightPool ?? 0}</p>
                    </div>
                    <div className="card-zen p-4 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 hover:scale-[1.02]">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-2">
                            <Icons.droplets className="w-4 h-4" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Water</span>
                        </div>
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{sharedGarden.waterPool ?? 0}</p>
                    </div>
                </div>

                {/* How it works */}
                <div className="card-zen p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 mb-5 hover:translate-y-0 [transform:none_!important]">
                    <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider mb-2">How it works</h3>
                    <ul className="space-y-1.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                        <li>✅ Complete a task → +5 sunlight to pool</li>
                        <li>🍅 Finish a pomodoro → +water per minute</li>
                        <li>📤 Share code with friends to grow together</li>
                    </ul>
                </div>

                {/* Leave button */}
                <button
                    onClick={handleLeave}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                    Leave Garden
                </button>
            </div>

            {/* Right panel: Chat / Nursery */}
            <div className="flex-1 flex flex-col min-h-0 bg-transparent">
                {/* Chat & Nursery Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            {rightTab === "chat" ? (
                                <Icons.zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <Icons.sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                    {rightTab === "chat" ? "Garden Chat" : rightTab === "nursery" ? "Kyōei Nursery" : "Master Board"}
                                </h2>
                                {!db && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 animate-pulse">
                                        Simulated Offline
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                                {rightTab === "chat" 
                                    ? `${!db ? "Local Sandbox" : "Real-time"} • ${messages.length} messages` 
                                    : rightTab === "nursery"
                                        ? `Communal Growth • ${(sharedGarden.plants || []).length} active projects`
                                        : `Leaderboards & Signs • ${signs.length} signs pinned`}
                            </p>
                        </div>
                    </div>

                    {/* Tab Switch Buttons */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-700/40 self-start sm:self-auto gap-0.5">
                        <button
                            onClick={() => setRightTab("chat")}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all ${
                                rightTab === "chat" 
                                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            💬 Chat
                        </button>
                        <button
                            onClick={() => setRightTab("nursery")}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all ${
                                rightTab === "nursery" 
                                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            🌱 Nursery
                        </button>
                        <button
                            onClick={() => setRightTab("board")}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all ${
                                rightTab === "board" 
                                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            🏆 Board
                        </button>
                    </div>
                </div>

                {rightTab === "chat" ? (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                    <span className="text-4xl mb-3">🌱</span>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No messages yet</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Say hello to your garden members!</p>
                                </div>
                            )}
                            {messages.map(msg => {
                                const isMe = msg.userId === user?.uid
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] sm:max-w-[60%] ${isMe ? "order-2" : ""}`}>
                                            {!isMe && (
                                                <p className="text-[10px] font-semibold text-slate-500 mb-1 px-1">{msg.userName}</p>
                                            )}
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                                ? "bg-emerald-500 text-white rounded-br-md"
                                                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md"
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <p className={`text-[9px] text-slate-400 mt-1 px-1 ${isMe ? "text-right" : ""}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                    disabled={sendingMsg}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={sendingMsg || !newMessage.trim()}
                                    className="h-11 w-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    <Icons.chevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : rightTab === "nursery" ? (
                    /* NURSERY TAB */
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                        <div className="mb-2">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Active Growth Projects</h3>
                            <p className="text-xs text-slate-500">Nurture plants by spending communal Sunlight and Water points</p>
                        </div>

                        {(sharedGarden.plants || []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center card-zen p-6">
                                <span className="text-4xl mb-3">🍁</span>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No active growth projects</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                                    To plant seeds here, go to the **Visual Garden** on your Dashboard home page, click **Shared View**, open the plant store, and purchase a seed!
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                {(sharedGarden.plants || []).map((plant: any) => {
                                    const nurture = plant.nurtureLevel ?? 0
                                    const isMature = plant.status === "mature" || nurture >= 100
                                    const name = PLANT_NAMES[plant.subtype] || plant.subtype || "Unknown Plant"
                                    const plantIcons: Record<string, string> = {
                                        sakura: "🌸", maple: "🍁", pine: "🌲", sunflower: "🌻", tulip: "🌷", orchid: "🌺"
                                    }
                                    const icon = plantIcons[plant.subtype] || (plant.type === 'tree' ? '🌳' : '🌱')
                                    
                                    return (
                                        <div key={plant.id} className="card-zen p-4 flex flex-col justify-between border-slate-200/50 dark:border-slate-800/80 hover:translate-y-0 hover:scale-[1.02] transition-all">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-xl">
                                                        {icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{name}</h4>
                                                        <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                                                            {plant.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isMature ? (
                                                    <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] uppercase px-2 py-0.5 animate-bounce">
                                                        ⭐ Mature
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px] dark:border-slate-800 dark:text-slate-400">
                                                        {nurture}% Grown
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-3 mt-auto">
                                                {/* Progress Bar */}
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full transition-all duration-500"
                                                        style={{ width: `${nurture}%` }}
                                                    />
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-1">
                                                    {!isMature ? (
                                                        <button
                                                            onClick={() => handleNurture(plant.id)}
                                                            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm hover:shadow-emerald-500/10"
                                                        >
                                                            <span>💧☀️</span> Nurture (-20)
                                                        </button>
                                                    ) : plant.status !== "mature" ? (
                                                        <button
                                                            onClick={() => handleHarvest(plant.id)}
                                                            className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm hover:shadow-amber-500/10"
                                                        >
                                                            <span>🎉</span> Harvest (+100 Sun)
                                                        </button>
                                                    ) : (
                                                        <div className="flex-1 text-center py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-lg border border-emerald-500/20">
                                                            Communal Trophy 🏆
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemovePlant(plant.id)}
                                                        className="p-2 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-all active:scale-95"
                                                        title="Remove plant"
                                                    >
                                                        <Icons.trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* MASTER BOARD TAB */
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
                        {/* Leaderboard Section */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">🏆 Master Garden Leaderboard</h3>
                                <p className="text-xs text-slate-500">All-time contribution ranks in the co-op garden</p>
                            </div>
                            <div className="card-zen p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                                {[
                                    { rank: "🥇", name: "ZenMaster", sun: 310, water: 240, role: "Master Gardener" },
                                    { rank: "🥈", name: "Hana", sun: 220, water: 180, role: "Active Sprouts" },
                                    { rank: "🥉", name: "Sora", sun: 150, water: 120, role: "Sprout Helper" },
                                    {
                                        rank: "🌿",
                                        name: settings.userName || user?.displayName || user?.email?.split("@")[0] || "You",
                                        sun: settings.sunlight || 0,
                                        water: settings.waterdrops || 0,
                                        role: "Member (You)"
                                    }
                                ]
                                .sort((a, b) => (b.sun + b.water) - (a.sun + a.water))
                                .map((member, idx) => (
                                    <div key={member.name} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold w-6 text-center">{idx + 1 === 1 ? "🥇" : idx + 1 === 2 ? "🥈" : idx + 1 === 3 ? "🥉" : "🌿"}</span>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{member.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold">
                                            <span className="text-amber-600 dark:text-amber-400">☀️ {member.sun}</span>
                                            <span className="text-blue-600 dark:text-blue-400">💧 {member.water}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wooden Signs Section */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">🪵 Communal Wooden Signs</h3>
                                <p className="text-xs text-slate-500">Pin a message for the co-op garden members to see</p>
                            </div>

                            {/* Sign Pinning Form */}
                            <div className="flex gap-2 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Write a message for the wooden sign..."
                                    className="flex-1 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                    value={newSignText}
                                    onChange={e => setNewSignText(e.target.value)}
                                    maxLength={80}
                                    onKeyDown={e => e.key === "Enter" && handlePinSign()}
                                />
                                <button
                                    onClick={handlePinSign}
                                    disabled={!newSignText.trim()}
                                    className="h-11 px-5 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 flex-shrink-0 shadow-sm"
                                >
                                    Pin Sign 📌
                                </button>
                            </div>

                            {/* signs board */}
                            {signs.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No signs pinned yet. Be the first to write a message!</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {signs.map(sign => (
                                        <div
                                            key={sign.id}
                                            className="bg-gradient-to-br from-amber-850 via-amber-900 to-amber-950 border border-amber-950 text-amber-50 rounded-2xl shadow-md p-5 relative pt-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-250"
                                        >
                                            {/* Tack */}
                                            <div className="w-2.5 h-2.5 bg-rose-600 rounded-full absolute top-2.5 left-1/2 -translate-x-1/2 border border-rose-800 shadow" />
                                            
                                            <p className="text-sm font-medium leading-relaxed italic text-amber-100">
                                                "{sign.text}"
                                            </p>
                                            
                                            <div className="flex justify-between items-center mt-4 border-t border-amber-900/40 pt-2 text-[10px] text-amber-300 font-bold">
                                                <span>By {sign.userName}</span>
                                                <span>
                                                    {new Date(sign.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
