"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useData } from "@/components/local-data-provider"
import { useAuth } from "@/components/auth-provider"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { collection, addDoc, onSnapshot, query, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

interface ChatMessage {
    id: string
    text: string
    userId: string
    userName: string
    createdAt: string
}

export default function CoopPage() {
    const { sharedGarden, joinSharedGarden, createSharedGarden, updateSettings, settings } = useData()
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

    // Real-time chat listener
    useEffect(() => {
        if (!sharedGarden?.id || !db) return
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
        if (!newMessage.trim() || !sharedGarden?.id || !user || !db) return
        setSendingMsg(true)
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
            <div className="w-full h-full p-4 sm:p-8">
                <div className="max-w-2xl mx-auto">
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
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
                        {activeTab === "join" ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Garden Invite Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. A7X9BQ"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-lg font-mono uppercase tracking-widest text-center placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        {[
                            { icon: "☀️", title: "Shared Sunlight", desc: "Tasks completed by any member add sunlight to the pool" },
                            { icon: "💧", title: "Shared Water", desc: "Pomodoro sessions fill the communal water reserve" },
                            { icon: "💬", title: "Real-time Chat", desc: "Talk with your garden members while you focus" },
                        ].map(card => (
                            <div key={card.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
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
        <div className="w-full h-full flex flex-col lg:flex-row">
            {/* Left panel: Garden Info */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6 overflow-y-auto">
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
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-5">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Invite Code</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold text-lg tracking-[0.25em] text-emerald-700 dark:text-emerald-300 text-center select-all">
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
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                            <Icons.sun className="w-4 h-4" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Sunlight</span>
                        </div>
                        <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{sharedGarden.sunlightPool ?? 0}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-2">
                            <Icons.droplets className="w-4 h-4" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Water</span>
                        </div>
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{sharedGarden.waterPool ?? 0}</p>
                    </div>
                </div>

                {/* How it works */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30 mb-5">
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

            {/* Right panel: Chat */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <Icons.zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Garden Chat</h2>
                        <p className="text-[11px] text-slate-500">Real-time • {messages.length} messages</p>
                    </div>
                </div>

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
                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
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
            </div>
        </div>
    )
}
