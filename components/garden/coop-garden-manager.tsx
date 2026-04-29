"use client"

import { useState } from "react"
import { useData } from "@/components/local-data-provider"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

export function CoopGardenManager() {
    const { sharedGarden, joinSharedGarden, createSharedGarden, updateSettings } = useData()
    const [isOpen, setIsOpen] = useState(false)
    const [joinCode, setJoinCode] = useState("")
    const [newGardenName, setNewGardenName] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleJoin = async () => {
        const code = joinCode.trim().toUpperCase()
        if (!code || code.length < 4) {
            toast.error("Please enter a valid garden code")
            return
        }
        setIsLoading(true)
        try {
            await joinSharedGarden(code)
            toast.success("🌿 Joined the shared garden!")
            setJoinCode("")
            setIsOpen(false)
        } catch (e: any) {
            console.error("Join garden error:", e)
            toast.error(e?.message || "Garden not found. Double-check the code.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        const name = newGardenName.trim()
        if (!name) {
            toast.error("Give your garden a name first")
            return
        }
        setIsLoading(true)
        try {
            const code = await createSharedGarden(name)
            toast.success(`🌱 Garden created! Code: ${code}`)
            setNewGardenName("")
            setShowCreateForm(false)
            setIsOpen(false)
        } catch (e: any) {
            console.error("Create garden error:", e)
            toast.error(e?.message || "Failed to create garden. Check your connection.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLeave = async () => {
        try {
            await updateSettings({ activeSharedGardenId: null })
            toast.info("Left the shared garden")
        } catch (e: any) {
            console.error("Leave garden error:", e)
            toast.error("Failed to leave garden")
        }
    }

    return (
        <>
            {/* Sidebar trigger — matches nav link styling */}
            <button
                onClick={() => setIsOpen(true)}
                className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-700 dark:hover:text-emerald-300 w-full relative overflow-hidden"
            >
                <Icons.heart className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                <div className="flex-1 flex items-baseline gap-2">
                    <span>{sharedGarden ? "Shared Garden" : "Kyōei Co-op"}</span>
                    <span className="text-[10px] opacity-0 group-hover:opacity-40 transition-opacity font-jp font-medium">
                        共栄
                    </span>
                </div>
                {sharedGarden && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
            </button>

            {/* Full-screen modal overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={{ position: "fixed" }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => { if (!isLoading) setIsOpen(false) }}
                    />

                    {/* Modal card */}
                    <div
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <Icons.heart className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Kyōei Co-op</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">共栄 — Shared prosperity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <Icons.close className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            {sharedGarden ? (
                                /* ── ACTIVE GARDEN VIEW ── */
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/50">
                                        <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{sharedGarden.name}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Invite code:</span>
                                            <code className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-sm px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 select-all">
                                                {sharedGarden.id}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-900/30">
                                            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
                                                <Icons.sun className="w-4 h-4" />
                                                <span className="text-[11px] font-semibold">Sunlight Pool</span>
                                            </div>
                                            <p className="text-xl font-black text-amber-700 dark:text-amber-300">{sharedGarden.sunlightPool ?? 0}</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                                                <Icons.droplets className="w-4 h-4" />
                                                <span className="text-[11px] font-semibold">Water Pool</span>
                                            </div>
                                            <p className="text-xl font-black text-blue-700 dark:text-blue-300">{sharedGarden.waterPool ?? 0}</p>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                        Every task you complete and pomodoro you finish adds resources to this shared pool for all members.
                                    </p>

                                    <button
                                        onClick={handleLeave}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        Leave Garden
                                    </button>
                                </div>
                            ) : (
                                /* ── JOIN / CREATE VIEW ── */
                                <div className="space-y-5">
                                    {/* Join section */}
                                    <div className="space-y-2.5">
                                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Join an existing garden
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. A7X9BQ"
                                                className="flex-1 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm font-mono uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                                value={joinCode}
                                                onChange={e => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                                                maxLength={6}
                                                onKeyDown={e => e.key === "Enter" && handleJoin()}
                                            />
                                            <button
                                                onClick={handleJoin}
                                                disabled={isLoading || !joinCode.trim()}
                                                className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? "..." : "Join"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                        <span className="text-[11px] text-slate-400 font-medium">or</span>
                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                    </div>

                                    {/* Create section */}
                                    {showCreateForm ? (
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Name your garden
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Zen Masters"
                                                className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                                value={newGardenName}
                                                onChange={e => setNewGardenName(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && handleCreate()}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setShowCreateForm(false); setNewGardenName("") }}
                                                    className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleCreate}
                                                    disabled={isLoading || !newGardenName.trim()}
                                                    className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? "Creating..." : "Create Garden"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className="w-full h-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 dark:hover:text-emerald-400 dark:hover:border-emerald-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Icons.plus className="w-4 h-4" />
                                            Create a new garden
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
