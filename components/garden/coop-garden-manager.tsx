"use client"

import { useState } from "react"
import { useData } from "@/components/local-data-provider"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function CoopGardenManager() {
    const { sharedGarden, joinSharedGarden, createSharedGarden, updateSettings } = useData()
    const [isOpen, setIsOpen] = useState(false)
    const [joinCode, setJoinCode] = useState("")
    const [newGardenName, setNewGardenName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    const handleJoin = async () => {
        if (!joinCode) return
        try {
            await joinSharedGarden(joinCode.toUpperCase())
            toast.success("Joined shared garden!")
            setIsOpen(false)
        } catch (e) {
            toast.error("Garden not found. Check the code.")
        }
    }

    const handleCreate = async () => {
        if (!newGardenName) return
        try {
            const code = await createSharedGarden(newGardenName)
            toast.success(`Created garden! Share code: ${code}`)
            setIsOpen(false)
        } catch (e) {
            toast.error("Failed to create garden.")
        }
    }

    const handleLeave = () => {
        updateSettings({ activeSharedGardenId: null })
        toast.info("Left the shared garden.")
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`h-9 px-4 rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95 border ${sharedGarden ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-400' : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-md text-slate-700 dark:text-slate-300 border-slate-200/50 hover:bg-white/60'}`}
                title="Kyōei Co-op Garden"
            >
                <Icons.heart className={`w-4 h-4 ${sharedGarden ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold hidden sm:inline">{sharedGarden ? 'Shared Garden' : 'Co-op'}</span>
            </button>

            {isOpen && (
                <Card className="absolute top-12 right-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Icons.heart className="w-5 h-5 text-indigo-500" />
                            Kyōei Co-op
                        </CardTitle>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <Icons.close className="w-4 h-4" />
                        </button>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                        {sharedGarden ? (
                            <div className="flex flex-col gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200">{sharedGarden.name}</h4>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-1">Code: <span className="font-bold select-all bg-white dark:bg-slate-900 px-1 py-0.5 rounded">{sharedGarden.id}</span></p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                                            <Icons.sun className="w-4 h-4" />
                                            <span className="font-bold text-sm">Pool</span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{sharedGarden.sunlightPool || 0}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-1 text-blue-500 mb-1">
                                            <Icons.droplets className="w-4 h-4" />
                                            <span className="font-bold text-sm">Pool</span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{sharedGarden.waterPool || 0}</span>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-slate-500 text-center">Resources earned by any member are added to this shared pool.</p>
                                
                                <button onClick={handleLeave} className="mt-2 w-full h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 text-sm font-bold transition-colors">
                                    Leave Garden
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Join a Garden</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Enter 6-char code" 
                                            className="flex-1 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm font-mono uppercase"
                                            value={joinCode}
                                            onChange={e => setJoinCode(e.target.value)}
                                            maxLength={6}
                                        />
                                        <button onClick={handleJoin} disabled={!joinCode} className="h-9 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">Join</button>
                                    </div>
                                </div>
                                
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">or</span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                
                                {isCreating ? (
                                    <div className="space-y-2 animate-in fade-in zoom-in-95">
                                        <input 
                                            type="text" 
                                            placeholder="Garden Name (e.g. Zen Masters)" 
                                            className="w-full h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm"
                                            value={newGardenName}
                                            onChange={e => setNewGardenName(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsCreating(false)} className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                                            <button onClick={handleCreate} disabled={!newGardenName} className="flex-1 h-9 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">Create</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsCreating(true)} className="w-full h-9 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                                        <Icons.plus className="w-4 h-4" /> Create Shared Garden
                                    </button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
