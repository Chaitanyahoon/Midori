"use client"
import { useEffect, useRef, useState } from "react"
import { useData } from "@/components/local-data-provider"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useTheme } from "next-themes"
import { useWeather } from "@/hooks/use-weather"
import { toast } from "sonner"
import { playWatering, playPlanting, playUnlock, playClack } from "@/lib/sounds"
import { Dialog, DialogContent } from "@/components/ui/dialog"


interface Plant { id?: string; x: number; y: number; type: "flower" | "tree"; subtype: string; color: string; scale: number; growth: number; delay: number; swayOffset: number; swaySpeed: number; seed: number; targetGrowth?: number }
interface Star { x: number; y: number; size: number; ts: number; to: number }
interface Cloud { x: number; y: number; w: number; h: number; spd: number; op: number }
interface Firefly { x: number; y: number; vx: number; vy: number; phase: number; spd: number; maxOp: number }
interface Bird { x: number; y: number; spd: number; flap: number; flapSpd: number; scale: number }
interface Particle { x: number; y: number; vx: number; vy: number; rot: number; size: number; color: string; op: number; type: string; life: number }
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; trail: number }

const PLANT_NAMES: Record<string, string> = {
    sakura: "Sakura", maple: "Maple", pine: "Pine", jacaranda: "Jacaranda",
    sunflower: "Sunflower", tulip: "Tulip", orchid: "Orchid", marigold: "Marigold",
    snowdrop: "Snowdrop", lily: "Lily", chrysanthemum: "Chrysanthemum", snowflower: "Snow Flower",
}

const drawStoneLantern = (ctx: CanvasRenderingContext2D, lx: number, ly: number, size: number, isLit: boolean, isDark: boolean, t: number) => {
  ctx.save()
  ctx.translate(lx, ly)
  
  // Stone color (grayish with texture/shadows)
  const stoneCol = isDark ? "#2d3748" : "#718096"
  const stoneLight = isDark ? "#4a5568" : "#a0aec0"
  const stoneShadow = isDark ? "#1a202c" : "#4a5568"
  
  // 1. Pedestal (Sao)
  ctx.fillStyle = stoneShadow
  ctx.fillRect(-size * 0.15, -size * 0.3, size * 0.3, size * 0.3)
  ctx.fillStyle = stoneCol
  ctx.fillRect(-size * 0.1, -size * 0.3, size * 0.2, size * 0.3)
  
  // 2. Middle Platform (Chūdai)
  ctx.fillStyle = stoneShadow
  ctx.beginPath()
  ctx.moveTo(-size * 0.35, -size * 0.3)
  ctx.lineTo(size * 0.35, -size * 0.3)
  ctx.lineTo(size * 0.25, -size * 0.4)
  ctx.lineTo(-size * 0.25, -size * 0.4)
  ctx.closePath()
  ctx.fill()
  
  ctx.fillStyle = stoneCol
  ctx.beginPath()
  ctx.moveTo(-size * 0.3, -size * 0.3)
  ctx.lineTo(size * 0.3, -size * 0.3)
  ctx.lineTo(size * 0.2, -size * 0.38)
  ctx.lineTo(-size * 0.2, -size * 0.38)
  ctx.closePath()
  ctx.fill()
  
  // 3. Fire Box / Light Chamber (Hibukuro)
  ctx.fillStyle = stoneShadow
  ctx.fillRect(-size * 0.2, -size * 0.65, size * 0.4, size * 0.25)
  // Light opening inside
  if (isLit && isDark) {
    // Glowing chamber
    const glow = ctx.createRadialGradient(0, -size * 0.52, 0, 0, -size * 0.52, size * 0.35)
    glow.addColorStop(0, "#fffbeb")
    glow.addColorStop(0.3, "#fef08a")
    glow.addColorStop(0.7, "#f59e0b")
    glow.addColorStop(1, "transparent")
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, -size * 0.52, size * 0.35, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = "#fffbeb"
  } else {
    ctx.fillStyle = "#1a202c"
  }
  // Draw the window cut-out
  ctx.beginPath()
  ctx.arc(0, -size * 0.52, size * 0.09, 0, Math.PI * 2)
  ctx.fill()
  
  // 4. Roof (Kasa)
  ctx.fillStyle = stoneShadow
  ctx.beginPath()
  ctx.moveTo(-size * 0.48, -size * 0.65)
  ctx.lineTo(size * 0.48, -size * 0.65)
  ctx.lineTo(size * 0.25, -size * 0.8)
  ctx.lineTo(-size * 0.25, -size * 0.8)
  ctx.closePath()
  ctx.fill()
  
  ctx.fillStyle = stoneCol
  ctx.beginPath()
  ctx.moveTo(-size * 0.42, -size * 0.65)
  ctx.lineTo(size * 0.42, -size * 0.65)
  ctx.lineTo(size * 0.2, -size * 0.78)
  ctx.lineTo(-size * 0.2, -size * 0.78)
  ctx.closePath()
  ctx.fill()
  
  // 5. Finial top jewel (Hōju)
  ctx.fillStyle = stoneCol
  ctx.beginPath()
  ctx.arc(0, -size * 0.84, size * 0.07, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = stoneShadow
  ctx.beginPath()
  ctx.moveTo(-size * 0.08, -size * 0.8)
  ctx.lineTo(size * 0.08, -size * 0.8)
  ctx.lineTo(0, -size * 0.93)
  ctx.closePath()
  ctx.fill()
  
  // 6. Soft light cone projection (if lit and dark)
  if (isLit && isDark) {
    ctx.restore() // Restore translation to paint in absolute coordinates
    ctx.save()
    ctx.translate(lx, ly)
    const cone = ctx.createLinearGradient(0, -size * 0.52, 0, size * 2.5)
    cone.addColorStop(0, "rgba(254, 240, 138, 0.45)")
    cone.addColorStop(0.3, "rgba(254, 240, 138, 0.18)")
    cone.addColorStop(1, "rgba(254, 240, 138, 0)")
    
    ctx.fillStyle = cone
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.52)
    ctx.lineTo(-size * 1.5, size * 2.5)
    ctx.lineTo(size * 1.5, size * 2.5)
    ctx.closePath()
    ctx.fill()

    // Glowing warm dust motes floating inside light cone
    ctx.save()
    for (let i = 0; i < 15; i++) {
        const progress = ((i * 17 + t * 0.35) % (size * 3.02))
        const moteY = size * 2.5 - progress
        
        const factor = (moteY - (-size * 0.52)) / (size * 3.02)
        const maxW = size * 1.5 * factor
        
        const swayPhase = t * 0.012 + i * 2.7
        const moteX = Math.sin(swayPhase) * maxW * 0.85
        
        const sizeMultiplier = 1.0 + Math.sin(t * 0.05 + i) * 0.4
        const moteSize = (0.8 + (i % 3) * 0.5) * sizeMultiplier
        const opacity = Math.min(factor * 2, 1) * (0.25 + Math.sin(swayPhase) * 0.25)
        
        ctx.fillStyle = `rgba(254, 243, 199, ${opacity})`
        ctx.beginPath()
        ctx.arc(moteX, moteY, moteSize, 0, Math.PI * 2)
        ctx.fill()
    }
    ctx.restore()
  }
  
  ctx.restore()
}

export function VisualGarden({ onAddPlant }: { onAddPlant?: () => void }) {
    const cvs = useRef<HTMLCanvasElement>(null)
    const cont = useRef<HTMLDivElement>(null)
    const { tasks, pomodoros, stats, settings, updateSettings, sharedGarden, updateSharedGarden } = useData()
    const [showStore, setShowStore] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [plantToPlace, setPlantToPlace] = useState<any>(null)
    const [nurseryTab, setNurseryTab] = useState<"shop" | "storage">("shop")
    const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)
    const { theme } = useTheme()
    const { season, weather } = useWeather()
    const { condition, isDay, temperature } = weather

    const [mSeason, setMSeason] = useState<"spring" | "summer" | "autumn" | "winter">(season)
    const [mTime, setMTime] = useState<"morning" | "afternoon" | "evening" | "night" | "auto">("auto")
    const [gardenView, setGardenView] = useState<"personal" | "shared">("personal")
    const [plants, setPlants] = useState<Plant[]>([])
    const [clickedPlant, setClickedPlant] = useState<{ plant: Plant; x: number; y: number } | null>(null)
    const [lanternLit, setLanternLit] = useState(true)
    const mousePosRef = useRef({ x: 0.5, y: 0.5, isOver: false })
    const sparkleRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[]>([])
    const windGustRef = useRef({ intensity: 0, duration: 0 })

    const handleWaterPersonal = (plantId: string) => {
        const waterCost = 10
        const currentWater = settings?.waterdrops || 0
        if (currentWater < waterCost) {
            toast.error("Not enough water drops! Focus to earn more.")
            return
        }

        const originalPlants = settings?.gardenPlants || []
        let updatedNurture = 100
        const updatedPlants = originalPlants.map((p: any) => {
            if (p.id === plantId) {
                const currentNurture = p.nurtureLevel !== undefined ? p.nurtureLevel : 100
                updatedNurture = Math.min(currentNurture + 20, 100)
                return { ...p, nurtureLevel: updatedNurture }
            }
            return p
        })

        updateSettings({
            waterdrops: currentWater - waterCost,
            gardenPlants: updatedPlants
        })

        toast.success("Splashed with water! Growth increased! 💧")
        playWatering()

        if (cvs.current && cont.current) {
            const rect = cont.current.getBoundingClientRect()
            const W = rect.width
            const H = rect.height
            const targetPlant = plants.find(p => p.id === plantId)
            if (targetPlant) {
                const px = targetPlant.x * W
                const py = targetPlant.y * H
                const size = targetPlant.type === 'tree' ? 180 : 85
                const scale = targetPlant.scale * targetPlant.growth
                const sz = size * scale

                const colors = ['#38bdf8', '#0ea5e9', '#0284c7', '#7dd3fc', '#bae6fd']
                for (let j = 0; j < 16; j++) {
                    const angle = (Math.PI * 2 * j) / 16
                    sparkleRef.current.push({
                        x: px, y: py - sz / 2,
                        vx: Math.cos(angle) * (1.2 + Math.random() * 2),
                        vy: Math.sin(angle) * (1.2 + Math.random()) - 1.5,
                        life: 1, color: colors[j % colors.length],
                        size: 2.5 + Math.random() * 3.5,
                    })
                }

                // Soil sprays (brown particles shooting up from the base py)
                const soilColors = ['#5c4033', '#8B5A2B', '#3d2b1f', '#4a3728']
                for (let j = 0; j < 8; j++) {
                    parts.current.push({
                        x: px + (Math.random() - 0.5) * 20,
                        y: py,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: -Math.random() * 2 - 1,
                        rot: Math.random() * Math.PI,
                        size: Math.random() * 2.5 + 1.5,
                        color: soilColors[j % soilColors.length],
                        op: 0.9,
                        type: 'soil',
                        life: 0
                    })
                }

                // Vapor mist (rising white/blue cloudlets)
                for (let j = 0; j < 6; j++) {
                    parts.current.push({
                        x: px + (Math.random() - 0.5) * 30,
                        y: py - Math.random() * 20,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: -0.4 - Math.random() * 0.4,
                        rot: Math.random() * Math.PI,
                        size: Math.random() * 12 + 8,
                        color: 'rgba(224, 242, 254, 0.35)',
                        op: 0.35,
                        type: 'vapor',
                        life: 0
                    })
                }

                setClickedPlant(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        plant: {
                            ...prev.plant,
                            targetGrowth: updatedNurture / 100
                        }
                    }
                })
            }
        }
    }

    const handleWaterShared = async (plantId: string) => {
        if (!sharedGarden) return
        const costSun = 20
        const costWater = 20
        
        if (sharedGarden.sunlightPool < costSun || sharedGarden.waterPool < costWater) {
            toast.error("Not enough communal resources! Need 20 Sun and 20 Water.")
            return
        }

        let updatedNurture = 100
        const updatedPlants = (sharedGarden.plants || []).map((p: any) => {
            if (p.id === plantId) {
                const currentNurture = p.nurtureLevel ?? 0
                updatedNurture = Math.min(currentNurture + 20, 100)
                return { ...p, nurtureLevel: updatedNurture }
            }
            return p
        })

        const targetPlantObj = (sharedGarden.plants || []).find((p: any) => p.id === plantId)
        const plantSubtype = targetPlantObj?.subtype || ""
        const plantName = PLANT_NAMES[plantSubtype] || plantSubtype || "Unknown Plant"
        const userName = settings?.userName || "Anonymous"
        const newLog = {
            id: Math.random().toString(36).substring(7),
            message: `watered the communal ${plantName} (+20% Nurture)`,
            user: userName,
            timestamp: new Date().toISOString()
        }

        try {
            await updateSharedGarden({
                sunlightPool: sharedGarden.sunlightPool - costSun,
                waterPool: sharedGarden.waterPool - costWater,
                plants: updatedPlants,
                activityLog: [newLog, ...(sharedGarden.activityLog || [])].slice(0, 50)
            })
            toast.success("Communal plant watered! 💧☀️")
            playWatering()

            if (cvs.current && cont.current) {
                const rect = cont.current.getBoundingClientRect()
                const W = rect.width
                const H = rect.height
                const targetPlant = plants.find(p => p.id === plantId)
                if (targetPlant) {
                    const px = targetPlant.x * W
                    const py = targetPlant.y * H
                    const size = targetPlant.type === 'tree' ? 180 : 85
                    const scale = targetPlant.scale * targetPlant.growth
                    const sz = size * scale

                    const colors = ['#38bdf8', '#f59e0b', '#0ea5e9', '#34d399', '#7dd3fc']
                    for (let j = 0; j < 16; j++) {
                        const angle = (Math.PI * 2 * j) / 16
                        sparkleRef.current.push({
                            x: px, y: py - sz / 2,
                            vx: Math.cos(angle) * (1.2 + Math.random() * 2),
                            vy: Math.sin(angle) * (1.2 + Math.random()) - 1.5,
                            life: 1, color: colors[j % colors.length],
                            size: 2.5 + Math.random() * 3.5,
                        })
                    }

                    // Soil sprays (brown particles shooting up from the base py)
                    const soilColors = ['#5c4033', '#8B5A2B', '#3d2b1f', '#4a3728']
                    for (let j = 0; j < 8; j++) {
                        parts.current.push({
                            x: px + (Math.random() - 0.5) * 20,
                            y: py,
                            vx: (Math.random() - 0.5) * 1.5,
                            vy: -Math.random() * 2 - 1,
                            rot: Math.random() * Math.PI,
                            size: Math.random() * 2.5 + 1.5,
                            color: soilColors[j % soilColors.length],
                            op: 0.9,
                            type: 'soil',
                            life: 0
                        })
                    }

                    // Vapor mist (rising white/blue cloudlets)
                    for (let j = 0; j < 6; j++) {
                        parts.current.push({
                            x: px + (Math.random() - 0.5) * 30,
                            y: py - Math.random() * 20,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: -0.4 - Math.random() * 0.4,
                            rot: Math.random() * Math.PI,
                            size: Math.random() * 12 + 8,
                            color: 'rgba(224, 242, 254, 0.35)',
                            op: 0.35,
                            type: 'vapor',
                            life: 0
                        })
                    }

                    setClickedPlant(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            plant: {
                                ...prev.plant,
                                targetGrowth: updatedNurture / 100
                            }
                        }
                    })
                }
            }
        } catch (e) {
            console.error("Nurture error:", e)
            toast.error("Failed to nurture communal plant")
        }
    }

    const handleHarvestShared = async (plantId: string) => {
        if (!sharedGarden) return
        const targetPlantObj = (sharedGarden.plants || []).find((p: any) => p.id === plantId)
        if (!targetPlantObj) return
        const plantSubtype = targetPlantObj.subtype || ""
        const plantName = PLANT_NAMES[plantSubtype] || plantSubtype || "Unknown Plant"
        
        const bonusSun = 100
        const bonusWater = 50

        const updatedPlants = (sharedGarden.plants || []).map((p: any) => {
            if (p.id === plantId) {
                return { ...p, status: "mature", nurtureLevel: 100 }
            }
            return p
        })

        const userName = settings?.userName || "Anonymous"
        const newLog = {
            id: Math.random().toString(36).substring(7),
            message: `harvested a mature ${plantName} (+100 Sun, +50 Water rewards)`,
            user: userName,
            timestamp: new Date().toISOString()
        }

        try {
            await updateSharedGarden({
                sunlightPool: (sharedGarden.sunlightPool || 0) + bonusSun,
                waterPool: (sharedGarden.waterPool || 0) + bonusWater,
                plants: updatedPlants,
                activityLog: [newLog, ...(sharedGarden.activityLog || [])].slice(0, 50)
            })
            toast.success(`🎉 Landmark complete! Earned +${bonusSun} Sun & +${bonusWater} Water pool rewards!`)
            playUnlock()
            
            setClickedPlant(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    plant: {
                        ...prev.plant,
                        growth: 1,
                        targetGrowth: 1
                    }
                }
            })
        } catch (e) {
            console.error("Harvest error:", e)
            toast.error("Failed to harvest communal plant")
        }
    }



    // Force personal view if active shared garden ID is removed
    useEffect(() => {
        if (!settings?.activeSharedGardenId) {
            setGardenView("personal")
        }
    }, [settings?.activeSharedGardenId])

    const envMenuRef = useRef<HTMLDivElement>(null)
    const [showEnvMenu, setShowEnvMenu] = useState(false)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (envMenuRef.current && !envMenuRef.current.contains(event.target as Node)) {
                setShowEnvMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const pRef = useRef<Plant[]>([])
    const parts = useRef<Particle[]>([])
    const stars = useRef<Star[]>([])
    const clouds = useRef<Cloud[]>([])
    const flies = useRef<Firefly[]>([])
    const birds = useRef<Bird[]>([])
    const shoots = useRef<ShootingStar[]>([])
    const assets = useRef<Record<string, HTMLImageElement>>({})
    const [loaded, setLoaded] = useState(false)
    const mTimeRef = useRef(mTime)
    const isDragging = useRef(false)

    const NURSERY_ITEMS = [
        { id: "sakura", name: "Sakura Tree", type: "tree", costSunlight: 100, costWater: 20, icon: "🌸", desc: "A beautiful cherry blossom." },
        { id: "maple", name: "Maple Tree", type: "tree", costSunlight: 120, costWater: 25, icon: "🍁", desc: "Vibrant autumn leaves." },
        { id: "pine", name: "Pine Tree", type: "tree", costSunlight: 80, costWater: 15, icon: "🌲", desc: "Evergreen and sturdy." },
        { id: "sunflower", name: "Sunflower", type: "flower", costSunlight: 50, costWater: 10, icon: "🌻", desc: "Always faces the sun." },
        { id: "tulip", name: "Tulip", type: "flower", costSunlight: 40, costWater: 5, icon: "🌷", desc: "A colorful spring bloom." },
        { id: "orchid", name: "Orchid", type: "flower", costSunlight: 60, costWater: 12, icon: "🌸", desc: "Elegant and exotic." },
    ]

    const sr = (s: number) => { const x = Math.sin(s++) * 10000; return x - Math.floor(x) }

    useEffect(() => {
        const list = [
            ['sakura', '/assets/garden/sakura.png'], ['jacaranda', '/assets/garden/Jacaranda.png'],
            ['maple', '/assets/garden/Maple.png'], ['pine', '/assets/garden/Pine.png'],
            ['sunflower', '/assets/garden/sunflower.png'], ['tulip', '/assets/garden/tulip.png'],
            ['marigold', '/assets/garden/Marigold.png'], ['snowdrop', '/assets/garden/snowdrop.png'],
            ['lily', '/assets/garden/lily.png'], ['orchid', '/assets/garden/orchid.png'],
            ['chrysanthemum', '/assets/garden/Chrysanthemum.png'], ['snowflower', '/assets/garden/flower-snowflower.png']
        ]
        let n = 0; list.forEach(([k, src]) => {
            const img = new Image(); img.src = src
            img.onload = img.onerror = () => { n++; if (n === list.length) setLoaded(true) }
            assets.current[k] = img
        })
    }, [])

    useEffect(() => {
        stars.current = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * 0.62, size: Math.random() * 1.8 + 0.3, ts: 0.01 + Math.random() * 0.03, to: Math.random() * Math.PI * 2 }))
        clouds.current = Array.from({ length: 7 }, () => ({ x: Math.random(), y: 0.04 + Math.random() * 0.22, w: 0.1 + Math.random() * 0.18, h: 0.04 + Math.random() * 0.06, spd: 0.00003 + Math.random() * 0.00006, op: 0.5 + Math.random() * 0.4 }))
        flies.current = Array.from({ length: 30 }, () => ({ x: 0.1 + Math.random() * 0.8, y: 0.45 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.001, vy: (Math.random() - 0.5) * 0.0005, phase: Math.random() * Math.PI * 2, spd: 0.02 + Math.random() * 0.04, maxOp: 0.5 + Math.random() * 0.5 }))
        birds.current = Array.from({ length: 5 }, (_, i) => ({ x: -0.05 - i * 0.08, y: 0.15 + Math.random() * 0.2, spd: 0.0008 + Math.random() * 0.0005, flap: Math.random() * Math.PI * 2, flapSpd: 0.12 + Math.random() * 0.08, scale: 0.6 + Math.random() * 0.6 }))
    }, [])

    useEffect(() => { mTimeRef.current = mTime }, [mTime])

    useEffect(() => {
        const np: Plant[] = []; const today = new Date().toISOString().split("T")[0]; let seed = stats.streak + 1
        
        // Remove random auto-spawning to allow full user customization.
        // We only render plants explicitly purchased and placed from settings.
        
        // Add purchased nursery plants (either from personal settings or shared garden document)
        const customPlants = gardenView === "shared"
            ? (sharedGarden?.plants || [])
            : (settings?.gardenPlants || [])
            
        customPlants.forEach((cp: any, i: number) => {
            const targetGrowth = cp.nurtureLevel !== undefined ? (cp.nurtureLevel / 100) : 1
            np.push({
                id: cp.id || `plant-${i}`,
                x: cp.x, y: cp.y, type: cp.type as "flower" | "tree", subtype: cp.subtype,
                color: "#A78BFA", scale: cp.scale || (cp.type === "tree" ? 1.15 : 0.95),
                growth: 0, delay: i * 50, swayOffset: sr(999 + i) * 10, swaySpeed: 0.015, seed: 999 + i,
                targetGrowth
            })
        })

        np.sort((a, b) => a.y - b.y); setPlants(np)
    }, [tasks, pomodoros, season, mSeason, settings?.gardenPlants, sharedGarden?.plants, gardenView])

    useEffect(() => { pRef.current = plants }, [plants])

    useEffect(() => {
        if (!cont.current || !cvs.current || !loaded) return
        const canvas = cvs.current; const container = cont.current
        let ctx2 = canvas.getContext("2d")
        const ro = new ResizeObserver(entries => {
            for (const e of entries) {
                const { width: w, height: h } = e.contentRect; const dpr = window.devicePixelRatio || 1
                canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
                ctx2 = canvas.getContext('2d'); if (ctx2) ctx2.scale(dpr, dpr)
            }
        }); ro.observe(container)
        let raf: number; let t = 0

        const render = () => {
            const ctx = ctx2; if (!ctx) { raf = requestAnimationFrame(render); return }
            t++
            const W = canvas.width / (window.devicePixelRatio || 1); const H = canvas.height / (window.devicePixelRatio || 1)
            ctx.clearRect(0, 0, W, H)

            // TIME
            let tod = "night"
            const mt = mTimeRef.current
            if (mt !== 'auto') tod = mt
            else { const h = new Date().getHours(); if (h >= 6 && h < 12) tod = "morning"; else if (h >= 12 && h < 17) tod = "afternoon"; else if (h >= 17 && h < 20) tod = "evening" }
            const night = tod === "night"; const eve = tod === "evening"; const morn = tod === "morning"; const aft = tod === "afternoon"
            const vs = mSeason; const dark = night || eve

            // Wind gust updates
            if (windGustRef.current.duration > 0) {
                windGustRef.current.duration--
                if (Math.random() < 0.15) {
                    parts.current.push({
                        x: -10,
                        y: Math.random() * H * 0.7,
                        vx: windGustRef.current.intensity * (1.2 + Math.random() * 1.5),
                        vy: (Math.random() - 0.3) * 1.0,
                        rot: Math.random() * Math.PI * 2,
                        size: Math.random() * 4 + 2,
                        color: vs === 'autumn' 
                            ? ["#EA580C", "#F59E0B", "#DC2626", "#D97706"][Math.floor(Math.random() * 4)]
                            : vs === 'spring'
                            ? ["#FBCFE8", "#F9A8D4", "#E879F9", "#F472B6"][Math.floor(Math.random() * 4)]
                            : ["#10B981", "#34D399", "#059669", "#0ea5e9"][Math.floor(Math.random() * 4)],
                        op: 0.8,
                        type: "leaf",
                        life: 0
                    })
                }
            } else {
                windGustRef.current.intensity = 0
            }


            // ── SKY ──
            const sg = ctx.createLinearGradient(0, 0, 0, H * 0.72)
            const skies: Record<string, Record<string, string[]>> = {
                night: {
                    spring: ["#060818", "#0D1B3E", "#1A2744"], summer: ["#030A1A", "#09152F", "#132040"],
                    autumn: ["#0C0A1A", "#1A0F2E", "#2D1B4E"], winter: ["#0A0E1A", "#111827", "#1F2937"]
                },
                morning: {
                    spring: ["#F9A8D4", "#FCD5CE", "#FEF9C3"], summer: ["#F97316", "#FDBA74", "#FEF3C7"],
                    autumn: ["#C25B3F", "#E8885A", "#F7C59F"], winter: ["#7B94B5", "#A3B9C9", "#D4E2EA"]
                },
                afternoon: {
                    spring: ["#4F46E5", "#818CF8", "#E0E7FF"], summer: ["#0369A1", "#0EA5E9", "#BAE6FD"],
                    autumn: ["#2563EB", "#60A5FA", "#BFDBFE"], winter: ["#94A3B8", "#B0BEC5", "#E2E8F0"]
                },
                evening: {
                    spring: ["#312E81", "#7C3AED", "#F472B6"], summer: ["#831843", "#DB2777", "#F9A8D4"],
                    autumn: ["#7C2D12", "#C2410C", "#FB923C"], winter: ["#1E1B4B", "#4C1D95", "#7C3AED"]
                }
            }
            const sc = skies[tod]?.[vs] || ["#060818", "#0D1B3E", "#1A2744"]
            sc.forEach((c, i) => sg.addColorStop(i / (sc.length - 1), c))
            ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.72)

            // ── STARS ──
            if (dark) {
                const sa = night ? 1 : 0.45
                stars.current.forEach(s => {
                    const tw = Math.sin(t * s.ts + s.to)
                    const a = sa * (0.55 + 0.45 * tw)
                    const sx = s.x * W; const sy = s.y * H * 0.65
                    ctx.save(); ctx.globalAlpha = Math.max(0, a)
                    // Soft outer glow
                    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 5)
                    g.addColorStop(0, "rgba(210,230,255,0.85)"); g.addColorStop(0.4, "rgba(200,220,255,0.2)"); g.addColorStop(1, "rgba(200,220,255,0)")
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, s.size * 5, 0, Math.PI * 2); ctx.fill()
                    // Star core
                    ctx.fillStyle = "#FFFFFF"
                    ctx.beginPath(); ctx.arc(sx, sy, s.size * 0.9, 0, Math.PI * 2); ctx.fill()
                    // 4-point cross spike for brighter stars
                    if (s.size > 1.4) {
                        ctx.globalAlpha = Math.max(0, a * 0.4)
                        ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 0.5
                        const arm = s.size * 3.0
                        ctx.beginPath()
                        ctx.moveTo(sx - arm, sy); ctx.lineTo(sx + arm, sy)
                        ctx.moveTo(sx, sy - arm); ctx.lineTo(sx, sy + arm)
                        ctx.stroke()
                    }
                    ctx.restore()
                })
            }

            // ── SHOOTING STARS ──
            if (dark) {
                if (night && Math.random() < 0.012) {
                    const angle = 0.4 + Math.random() * 0.35
                    const spd = 0.006 + Math.random() * 0.01
                    shoots.current.push({ x: 0.02 + Math.random() * 0.65, y: 0.02 + Math.random() * 0.28, vx: spd * Math.cos(angle), vy: spd * Math.sin(angle), life: 0, maxLife: 40 + Math.random() * 35, trail: 120 + Math.random() * 80 })
                }
                for (let i = shoots.current.length - 1; i >= 0; i--) {
                    const ss = shoots.current[i]; ss.life++; ss.x += ss.vx; ss.y += ss.vy
                    if (ss.life > ss.maxLife || ss.x > 1.1 || ss.y > 0.75) { shoots.current.splice(i, 1); continue }
                    const prog = ss.life / ss.maxLife
                    const alpha = prog < 0.15 ? prog / 0.15 : (prog > 0.7 ? (1 - prog) / 0.3 : 1)
                    const hx = ss.x * W; const hy = ss.y * H * 0.72
                    const tx2 = hx - ss.trail * ss.vx * W; const ty2 = hy - ss.trail * ss.vy * H * 0.72
                    ctx.save()
                    ctx.globalAlpha = alpha * 0.5
                    const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12)
                    halo.addColorStop(0, 'rgba(255,255,255,0.9)'); halo.addColorStop(1, 'rgba(200,230,255,0)')
                    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill()
                    ctx.globalAlpha = alpha
                    const tg = ctx.createLinearGradient(hx, hy, tx2, ty2)
                    tg.addColorStop(0, 'rgba(255,255,255,0.9)'); tg.addColorStop(0.2, 'rgba(200,230,255,0.4)'); tg.addColorStop(1, 'rgba(150,200,255,0)')
                    ctx.strokeStyle = tg; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
                    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx2, ty2); ctx.stroke()
                    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, 1.2, 0, Math.PI * 2); ctx.fill()
                    ctx.restore()
                }

                // ── AURORA (winter night) ──
                if (vs === 'winter') {
                    for (let a = 0; a < 4; a++) {
                        ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(t * 0.008 + a) * 0.08
                        const ay = H * (0.12 + a * 0.07)
                        const ag = ctx.createLinearGradient(0, ay - H * 0.06, 0, ay + H * 0.06)
                        const cols = [["#00FFB2", "#00CEC9"], ["#7F5AF0", "#6A0DAD"], ["#00F5FF", "#0088CC"], ["#A8FF78", "#78FFD6"]]
                        const [c1] = cols[a % cols.length]
                        ag.addColorStop(0, "transparent"); ag.addColorStop(0.5, c1 + "88"); ag.addColorStop(1, "transparent")
                        ctx.fillStyle = ag
                        ctx.beginPath(); ctx.moveTo(0, ay)
                        for (let x = 0; x <= W; x += 20) { ctx.lineTo(x, ay + Math.sin(x * 0.012 + t * 0.015 + a * 2) * H * 0.04) }
                        ctx.lineTo(W, ay + H * 0.06); ctx.lineTo(0, ay + H * 0.06); ctx.closePath(); ctx.fill()
                        ctx.restore()
                    }
                }
            }

            // ── CELESTIAL ──
            let cx2 = W * (morn ? 0.2 : aft ? 0.6 : eve ? 0.82 : 0.5), cy2 = H * (morn ? 0.35 : aft ? 0.12 : eve ? 0.4 : 0.18)
            ctx.save(); ctx.translate(cx2, cy2)
            if (night) {
                const ms = Math.min(W, H) * 0.055
                // Outer glow rings
                const mh = ctx.createRadialGradient(0, 0, ms * 0.9, 0, 0, ms * 7)
                mh.addColorStop(0, "rgba(200,220,255,0.28)"); mh.addColorStop(0.4, "rgba(180,210,255,0.08)"); mh.addColorStop(1, "rgba(200,220,255,0)")
                ctx.fillStyle = mh; ctx.beginPath(); ctx.arc(0, 0, ms * 7, 0, Math.PI * 2); ctx.fill()
                // Second closer ring
                const mh2 = ctx.createRadialGradient(0, 0, ms, 0, 0, ms * 2.5)
                mh2.addColorStop(0, "rgba(220,235,255,0.15)"); mh2.addColorStop(1, "rgba(220,235,255,0)")
                ctx.fillStyle = mh2; ctx.beginPath(); ctx.arc(0, 0, ms * 2.5, 0, Math.PI * 2); ctx.fill()

                // ── ETHEREAL FULL MOON ──
                const ms2 = Math.ceil(ms * 2.4)
                const oc = document.createElement('canvas')
                oc.width = ms2; oc.height = ms2
                const ox = ms2 / 2; const oy = ms2 / 2
                const octx = oc.getContext('2d')!

                // Soft glowing sphere
                const mb = octx.createRadialGradient(ox - ms * 0.15, oy - ms * 0.15, 0, ox, oy, ms)
                mb.addColorStop(0, '#FFFFFF')
                mb.addColorStop(0.3, '#FEFCE8')
                mb.addColorStop(0.7, '#F1F5F9')
                mb.addColorStop(1, '#E2E8F0')
                octx.fillStyle = mb
                octx.beginPath(); octx.arc(ox, oy, ms, 0, Math.PI * 2); octx.fill()

                // Subtle craters/texture for realism
                octx.globalAlpha = 0.06; octx.fillStyle = '#94A3B8'
                octx.beginPath(); octx.arc(ox - ms * 0.25, oy + ms * 0.2, ms * 0.35, 0, Math.PI * 2); octx.fill()
                octx.beginPath(); octx.arc(ox + ms * 0.3, oy - ms * 0.2, ms * 0.2, 0, Math.PI * 2); octx.fill()
                octx.beginPath(); octx.arc(ox + ms * 0.1, oy + ms * 0.35, ms * 0.25, 0, Math.PI * 2); octx.fill()
                octx.globalAlpha = 1

                // Stamp the moon onto the main canvas, centred at origin (already translated to cx2,cy2)
                ctx.drawImage(oc, -ms2 / 2, -ms2 / 2)

                // Inner glow along the lit crescent edge
                const rimGrad = ctx.createRadialGradient(-ms * 0.15, -ms * 0.1, ms * 0.7, 0, 0, ms)
                rimGrad.addColorStop(0, 'rgba(255,255,220,0.0)')
                rimGrad.addColorStop(0.85, 'rgba(220,235,255,0.18)')
                rimGrad.addColorStop(1, 'rgba(200,220,255,0.0)')
                ctx.fillStyle = rimGrad
                ctx.beginPath(); ctx.arc(0, 0, ms, 0, Math.PI * 2); ctx.fill()
            } else {
                const ss = Math.min(W, H) * (eve ? 0.065 : 0.052)
                if (!eve && vs !== 'winter') {
                    ctx.save(); ctx.rotate(t * 0.003)
                    for (let r = 0; r < 16; r++) {
                        const rl = W * (morn ? 0.5 : 0.65)
                        const rg = ctx.createLinearGradient(0, 0, rl, 0)
                        rg.addColorStop(0, `rgba(255,230,100,${morn ? 0.07 : 0.04})`); rg.addColorStop(1, "rgba(255,230,100,0)")
                        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, -ss * 0.4); ctx.lineTo(rl, 0); ctx.lineTo(0, ss * 0.4); ctx.fill()
                        ctx.rotate(Math.PI / 8)
                    }; ctx.restore()
                }
                const sg2 = ctx.createRadialGradient(0, 0, ss * 0.7, 0, 0, ss * 3.5)
                sg2.addColorStop(0, eve ? "rgba(251,146,60,0.5)" : morn ? "rgba(253,186,116,0.35)" : "rgba(250,204,21,0.25)"); sg2.addColorStop(1, "rgba(255,220,50,0)")
                ctx.fillStyle = sg2; ctx.beginPath(); ctx.arc(0, 0, ss * 3.5, 0, Math.PI * 2); ctx.fill()
                const sb = ctx.createRadialGradient(-ss * 0.3, -ss * 0.3, 0, 0, 0, ss)
                if (eve) { sb.addColorStop(0, "#FECACA"); sb.addColorStop(1, "#DC2626") }
                else if (morn) { sb.addColorStop(0, "#FEF9C3"); sb.addColorStop(1, "#FDBA74") }
                else { sb.addColorStop(0, "#FEF9C3"); sb.addColorStop(1, "#EAB308") }
                ctx.fillStyle = sb; ctx.beginPath(); ctx.arc(0, 0, ss, 0, Math.PI * 2); ctx.fill()
                // Lens flare (summer afternoon)
                if (vs === 'summer' && aft) {
                    [1.4, 1.9, 2.5, 3.2].forEach((d, i) => {
                        ctx.save(); ctx.globalAlpha = 0.07 - i * 0.01
                        ctx.beginPath(); ctx.arc(ss * d * 0.6, ss * d * 0.4, ss * (0.3 - i * 0.04), 0, Math.PI * 2)
                        ctx.fillStyle = "#FEF9C3"; ctx.fill(); ctx.restore()
                    })
                }
            }
            ctx.restore()

            // ── HORIZON GLOW ──
            if (morn || eve) {
                const hg = ctx.createRadialGradient(cx2, H * 0.55, 10, cx2, H * 0.55, W * 0.55)
                hg.addColorStop(0, eve ? (vs === 'autumn' ? "rgba(251,146,60,0.55)" : "rgba(244,114,182,0.5)") : "rgba(253,186,116,0.45)"); hg.addColorStop(1, "rgba(0,0,0,0)")
                ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H * 0.72)
            }

            // ── RAINBOW (rain + spring/summer) ──
            if (condition === 'rain' && (vs === 'spring' || vs === 'summer') && !dark) {
                const rx = W * 0.5, ry = H * 0.72, rr = W * 0.55
                const colors = ["rgba(255,0,0,0.15)", "rgba(255,127,0,0.15)", "rgba(255,255,0,0.12)",
                    "rgba(0,255,0,0.12)", "rgba(0,100,255,0.12)", "rgba(75,0,130,0.1)", "rgba(148,0,211,0.1)"]
                colors.forEach((c, i) => {
                    ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = W * 0.018
                    ctx.beginPath(); ctx.arc(rx, ry, rr - i * W * 0.018, Math.PI, 0); ctx.stroke(); ctx.restore()
                })
            }

            // ── CLOUDS ──
            if (!night || vs === 'winter') {
                const ca = eve ? 0.28 : morn ? 0.65 : night ? 0.35 : 0.82
                clouds.current.forEach(cl => {
                    cl.x += cl.spd; if (cl.x > 1.25) cl.x = -cl.w - 0.05
                    const cx3 = cl.x * W, cy3 = cl.y * H, cw = cl.w * W, ch = cl.h * H
                    ctx.save(); ctx.globalAlpha = cl.op * ca

                    // Build cloud silhouette path using bezier bumps
                    const drawCloudPath = () => {
                        const bx = cx3 - cw * 0.5, by = cy3 + ch * 0.4
                        ctx.beginPath()
                        ctx.moveTo(bx, by)
                        // bottom flat base
                        ctx.lineTo(bx + cw, by)
                        // right side up
                        ctx.bezierCurveTo(bx + cw * 1.05, by, bx + cw * 1.02, cy3 - ch * 0.1, bx + cw * 0.78, cy3 - ch * 0.1)
                        // right bump
                        ctx.bezierCurveTo(bx + cw * 0.85, cy3 - ch * 0.7, bx + cw * 0.62, cy3 - ch * 0.85, bx + cw * 0.52, cy3 - ch * 0.55)
                        // center peak
                        ctx.bezierCurveTo(bx + cw * 0.55, cy3 - ch * 1.05, bx + cw * 0.35, cy3 - ch * 1.15, bx + cw * 0.22, cy3 - ch * 0.7)
                        // left bump
                        ctx.bezierCurveTo(bx + cw * 0.18, cy3 - ch * 0.9, bx - cw * 0.02, cy3 - ch * 0.8, bx + cw * 0.0, cy3 - ch * 0.3)
                        // left side down
                        ctx.bezierCurveTo(bx - cw * 0.05, cy3 - ch * 0.1, bx - cw * 0.05, by, bx, by)
                        ctx.closePath()
                    }

                    // Shadow pass (bottom, darker)
                    ctx.save()
                    ctx.translate(0, ch * 0.18)
                    drawCloudPath()
                    const shadowCol = dark ? 'rgba(15,25,50,0.55)' : (eve ? 'rgba(180,120,80,0.3)' : 'rgba(180,200,230,0.45)')
                    ctx.fillStyle = shadowCol; ctx.fill()
                    ctx.restore()

                    // Main body
                    drawCloudPath()
                    const bodyGrad = ctx.createLinearGradient(cx3, cy3 - ch, cx3, cy3 + ch * 0.5)
                    if (dark) {
                        bodyGrad.addColorStop(0, 'rgba(80,100,140,0.9)')
                        bodyGrad.addColorStop(1, 'rgba(40,55,90,0.8)')
                    } else if (eve) {
                        bodyGrad.addColorStop(0, 'rgba(255,200,160,0.95)')
                        bodyGrad.addColorStop(0.5, 'rgba(240,160,140,0.9)')
                        bodyGrad.addColorStop(1, 'rgba(200,120,100,0.8)')
                    } else if (morn) {
                        bodyGrad.addColorStop(0, 'rgba(255,245,220,0.95)')
                        bodyGrad.addColorStop(1, 'rgba(220,210,200,0.85)')
                    } else {
                        bodyGrad.addColorStop(0, 'rgba(255,255,255,0.98)')
                        bodyGrad.addColorStop(0.6, 'rgba(235,242,255,0.92)')
                        bodyGrad.addColorStop(1, 'rgba(200,215,240,0.85)')
                    }
                    ctx.fillStyle = bodyGrad; ctx.fill()

                    // Top highlight rim
                    drawCloudPath()
                    ctx.save(); ctx.clip()
                    const hlGrad = ctx.createLinearGradient(cx3, cy3 - ch * 1.1, cx3, cy3 - ch * 0.3)
                    hlGrad.addColorStop(0, dark ? 'rgba(150,180,255,0.35)' : 'rgba(255,255,255,0.7)')
                    hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
                    ctx.fillStyle = hlGrad; ctx.fillRect(cx3 - cw, cy3 - ch * 1.2, cw * 2, ch * 1.0)
                    ctx.restore()

                    ctx.restore()
                })
            }

            // ── WATERCOLOR MOUNTAIN PARALLAX ──
            const mouseXOffset = mousePosRef.current.isOver ? (mousePosRef.current.x - 0.5) : 0
            
            // Far Mountain Layer (shifts less)
            ctx.save()
            ctx.translate(mouseXOffset * 18, 0)
            const farGrad = ctx.createLinearGradient(0, H * 0.32, 0, H * 0.72)
            if (dark) {
                farGrad.addColorStop(0, "rgba(22, 28, 45, 0.55)")
                farGrad.addColorStop(1, "rgba(5, 8, 20, 0)")
            } else if (eve) {
                farGrad.addColorStop(0, "rgba(180, 110, 130, 0.45)")
                farGrad.addColorStop(1, "rgba(80, 40, 50, 0)")
            } else {
                farGrad.addColorStop(0, "rgba(147, 197, 253, 0.4)")
                farGrad.addColorStop(1, "rgba(239, 246, 255, 0)")
            }
            ctx.fillStyle = farGrad
            ctx.beginPath()
            ctx.moveTo(-50, H * 0.72)
            ctx.lineTo(-50, H * 0.45)
            ctx.quadraticCurveTo(W * 0.15, H * 0.34, W * 0.28, H * 0.38)
            ctx.quadraticCurveTo(W * 0.42, H * 0.46, W * 0.55, H * 0.32)
            ctx.quadraticCurveTo(W * 0.70, H * 0.44, W * 0.82, H * 0.36)
            ctx.quadraticCurveTo(W * 0.92, H * 0.45, W + 50, H * 0.40)
            ctx.lineTo(W + 50, H * 0.72)
            ctx.closePath()
            ctx.fill()
            ctx.restore()

            // ── HORIZON VALLEY MIST LAYER ──
            ctx.save()
            ctx.translate(mouseXOffset * 24, 0)
            const mistGrad = ctx.createLinearGradient(0, H * 0.42, 0, H * 0.58)
            if (dark) {
                mistGrad.addColorStop(0, "rgba(15, 23, 42, 0)")
                mistGrad.addColorStop(0.5, "rgba(30, 41, 59, 0.22)")
                mistGrad.addColorStop(1, "rgba(15, 23, 42, 0)")
            } else if (eve) {
                mistGrad.addColorStop(0, "rgba(253, 244, 245, 0)")
                mistGrad.addColorStop(0.5, "rgba(251, 146, 60, 0.15)")
                mistGrad.addColorStop(1, "rgba(253, 244, 245, 0)")
            } else {
                mistGrad.addColorStop(0, "rgba(255, 255, 255, 0)")
                mistGrad.addColorStop(0.5, "rgba(239, 246, 255, 0.35)")
                mistGrad.addColorStop(1, "rgba(255, 255, 255, 0)")
            }
            ctx.fillStyle = mistGrad
            ctx.fillRect(-50, H * 0.38, W + 100, H * 0.22)
            ctx.restore()

            // Mid Mountain Layer (shifts more)
            ctx.save()
            ctx.translate(mouseXOffset * 32, 0)
            const midGrad = ctx.createLinearGradient(0, H * 0.38, 0, H * 0.72)
            if (dark) {
                midGrad.addColorStop(0, "rgba(28, 42, 60, 0.75)")
                midGrad.addColorStop(1, "rgba(5, 8, 20, 0)")
            } else if (eve) {
                midGrad.addColorStop(0, "rgba(194, 90, 80, 0.65)")
                midGrad.addColorStop(1, "rgba(80, 40, 50, 0)")
            } else {
                midGrad.addColorStop(0, "rgba(191, 219, 254, 0.55)")
                midGrad.addColorStop(1, "rgba(239, 246, 255, 0)")
            }
            ctx.fillStyle = midGrad
            ctx.beginPath()
            ctx.moveTo(-50, H * 0.72)
            ctx.lineTo(-50, H * 0.52)
            ctx.quadraticCurveTo(W * 0.12, H * 0.46, W * 0.25, H * 0.50)
            ctx.quadraticCurveTo(W * 0.40, H * 0.42, W * 0.52, H * 0.54)
            ctx.quadraticCurveTo(W * 0.70, H * 0.45, W * 0.85, H * 0.51)
            ctx.quadraticCurveTo(W * 0.95, H * 0.48, W + 50, H * 0.52)
            ctx.lineTo(W + 50, H * 0.72)
            ctx.closePath()
            ctx.fill()
            ctx.restore()


            // ── GROUND LAYERS (Garden) ──
            const gPal: Record<string, Record<string, string[]>> = {
                night: { spring: ["#052E16", "#064E3B", "#065F46", "#1A0A00"], summer: ["#052E16", "#064E3B", "#065F46", "#1A1400"], autumn: ["#1C1007", "#2C1A07", "#3D2309", "#0A0500"], winter: ["#0F172A", "#1E293B", "#334155", "#0C1726"] },
                morning: { spring: ["#BBF7D0", "#86EFAC", "#4ADE80", "#78350F"], summer: ["#A7F3D0", "#6EE7B7", "#34D399", "#713F12"], autumn: ["#FEF3C7", "#FDE68A", "#FBBF24", "#7C2D12"], winter: ["#E2E8F0", "#CBD5E1", "#94A3B8", "#1E293B"] },
                afternoon: { spring: ["#DCFCE7", "#BBF7D0", "#86EFAC", "#92400E"], summer: ["#D1FAE5", "#A7F3D0", "#34D399", "#78350F"], autumn: ["#FEF9C3", "#FEF08A", "#FDE047", "#92400E"], winter: ["#F1F5F9", "#E2E8F0", "#CBD5E1", "#334155"] },
                evening: { spring: ["#14532D", "#166534", "#15803D", "#1C0A00"], summer: ["#14532D", "#15803D", "#16A34A", "#1A0F00"], autumn: ["#431407", "#7C2D12", "#9A3412", "#050200"], winter: ["#1E293B", "#334155", "#475569", "#0A0F1A"] }
            }
            const gp = gPal[tod]?.[vs] || ["#052E16", "#064E3B", "#065F46", "#1A0A00"]

            // Far rolling meadow
            ctx.fillStyle = gp[0]
            ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * 0.64)
            ctx.bezierCurveTo(W * 0.2, H * 0.59, W * 0.5, H * 0.67, W * 0.75, H * 0.61)
            ctx.bezierCurveTo(W * 0.88, H * 0.58, W, H * 0.63, W, H * 0.61)
            ctx.lineTo(W, H); ctx.closePath(); ctx.fill()

            // Mid lawn
            ctx.fillStyle = gp[1]
            ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * 0.76)
            ctx.bezierCurveTo(W * 0.18, H * 0.74, W * 0.45, H * 0.79, W * 0.7, H * 0.75)
            ctx.bezierCurveTo(W * 0.85, H * 0.73, W, H * 0.77, W, H * 0.75)
            ctx.lineTo(W, H); ctx.closePath(); ctx.fill()

            // ── STONE LANTERN (Tōrō) ──
            const lx = 0.78 * W
            const ly = 0.74 * H
            const lSize = 50
            drawStoneLantern(ctx, lx, ly, lSize, lanternLit, dark, t)


            // Grass blade tufts along front ground edge
            const bladeCol = dark ? gp[2] + "99" : gp[2]
            ctx.strokeStyle = bladeCol; ctx.lineWidth = 1.5
            for (let g2 = 0; g2 < 28; g2++) {
                const gx = (g2 / 28) * W * 0.95 + W * 0.025
                const gy = H * 0.885 + Math.sin(g2 * 1.7) * H * 0.006
                const sway = Math.sin(t * 0.012 + g2 * 0.8) * 4
                ctx.save(); ctx.globalAlpha = 0.75
                ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + sway, gy - 10, gx + sway * 1.5, gy - 18); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(gx + 5, gy); ctx.quadraticCurveTo(gx + 5 + sway * 0.5, gy - 8, gx + 5 + sway, gy - 14); ctx.stroke()
                ctx.restore()
            }

            // ── SCATTERED SWAYING GRASS TUFTS FOR DEPTH ──
            ctx.save()
            const grassTufts = [
                { x: 0.08, y: 0.77, scale: 0.7 },
                { x: 0.16, y: 0.85, scale: 1.1 },
                { x: 0.23, y: 0.81, scale: 1.0 },
                { x: 0.35, y: 0.75, scale: 0.65 },
                { x: 0.42, y: 0.84, scale: 1.15 },
                { x: 0.55, y: 0.78, scale: 0.8 },
                { x: 0.68, y: 0.82, scale: 1.05 },
                { x: 0.74, y: 0.76, scale: 0.6 },
                { x: 0.85, y: 0.81, scale: 0.95 },
                { x: 0.92, y: 0.85, scale: 1.2 },
            ]
            
            const grassCol = dark ? gp[2] + "77" : gp[2] + "bb"
            ctx.strokeStyle = grassCol
            ctx.lineWidth = 1.2
            
            grassTufts.forEach(gt => {
                const gx = gt.x * W
                const gy = gt.y * H
                const s = gt.scale
                const sway = Math.sin(t * 0.015 + gx * 0.05) * 3
                
                ctx.save()
                ctx.beginPath()
                // Left blade
                ctx.moveTo(gx, gy)
                ctx.quadraticCurveTo(gx - 2 * s + sway, gy - 6 * s, gx - 4 * s + sway * 1.2, gy - 12 * s)
                // Center blade
                ctx.moveTo(gx, gy)
                ctx.quadraticCurveTo(gx + sway, gy - 8 * s, gx + sway * 1.5, gy - 16 * s)
                // Right blade
                ctx.moveTo(gx, gy)
                ctx.quadraticCurveTo(gx + 2 * s + sway, gy - 5 * s, gx + 4 * s + sway * 0.8, gy - 10 * s)
                ctx.stroke()
                ctx.restore()
            })
            ctx.restore()



            // Winter snow drift on ground
            if (vs === 'winter') {
                const wg = ctx.createLinearGradient(0, H * 0.83, 0, H)
                wg.addColorStop(0, night ? "rgba(200,220,255,0.28)" : "rgba(248,250,252,0.65)"); wg.addColorStop(1, "rgba(241,245,249,0.45)")
                ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * 0.88)
                ctx.bezierCurveTo(W * 0.2, H * 0.86, W * 0.6, H * 0.89, W, H * 0.87); ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
            }


            // Morning mist
            if (morn) {
                for (let l = 0; l < 3; l++) {
                    const my = H * (0.72 + l * 0.06); const mg = ctx.createLinearGradient(0, my - H * 0.06, 0, my + H * 0.04)
                    mg.addColorStop(0, "rgba(255,255,255,0)"); mg.addColorStop(0.5, `rgba(255,255,255,${0.18 - l * 0.04})`); mg.addColorStop(1, "rgba(255,255,255,0)")
                    ctx.fillStyle = mg; ctx.beginPath(); ctx.moveTo(0, my)
                    for (let mx = 0; mx <= W; mx += 18) ctx.lineTo(mx, my + Math.sin(mx * 0.015 + t * 0.008 + l * 1.2) * H * 0.011)
                    ctx.lineTo(W, my + H * 0.06); ctx.lineTo(0, my + H * 0.06); ctx.closePath(); ctx.fill()
                }
            }

            // ── BIRDS (morning + afternoon) ──
            if (!dark) {
                birds.current.forEach(b => {
                    b.x += b.spd; b.flap += b.flapSpd; if (b.x > 1.1) b.x = -0.05
                    const bx = b.x * W, by = b.y * H + Math.sin(t * 0.04 + b.flap) * H * 0.008
                    const wing = Math.sin(b.flap) * 0.3
                    ctx.save(); ctx.translate(bx, by); ctx.scale(b.scale, b.scale)
                    ctx.globalAlpha = 0.55; ctx.strokeStyle = dark ? "#94A3B8" : "#475569"; ctx.lineWidth = 1.5
                    ctx.beginPath()
                    ctx.moveTo(0, 0); ctx.quadraticCurveTo(-8, -8 - wing * 10, -16, wing * 4)
                    ctx.moveTo(0, 0); ctx.quadraticCurveTo(8, -8 - wing * 10, 16, wing * 4)
                    ctx.stroke(); ctx.restore()
                })
            }

            // ── PLANTS ──
            pRef.current.forEach((plant: Plant) => {
                const targetG = plant.targetGrowth !== undefined ? plant.targetGrowth : 1
                if (t > plant.delay) {
                    if (plant.growth < targetG) {
                        plant.growth = Math.min(plant.growth + 0.005, targetG)
                    } else if (plant.growth > targetG) {
                        plant.growth = Math.max(plant.growth - 0.005, targetG)
                    }
                }
                if (plant.growth <= 0) return
                const px = plant.x * W, py = plant.y * H, s = plant.scale * plant.growth
                
                // Interactive Proximity Swaying
                let hoverSway = 0
                if (mousePosRef.current.isOver) {
                    const mx = mousePosRef.current.x * W
                    const my = mousePosRef.current.y * H
                    const plantCenterX = px
                    const plantCenterY = py - (plant.type === 'tree' ? 80 : 30) * s
                    const dx = mx - plantCenterX
                    const dy = my - plantCenterY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const activeDist = plant.type === 'tree' ? 90 : 50
                    if (dist < activeDist) {
                        const intensity = (1 - dist / activeDist)
                        hoverSway = Math.sin(t * 0.15 + plant.seed) * intensity * 0.08
                    }
                }

                const gustEffect = windGustRef.current.duration > 0 
                    ? Math.sin(t * 0.08) * windGustRef.current.intensity * 0.006 + windGustRef.current.intensity * 0.005
                    : 0
                const wind = Math.sin(t * 0.003) * 0.005 + Math.sin(t * (plant.swaySpeed * 0.4) + plant.swayOffset) * 0.008 + gustEffect + hoverSway
                
                ctx.save()
                ctx.translate(px, py)

                // Soft grounding shadow
                ctx.save()
                ctx.fillStyle = dark ? "rgba(2, 44, 22, 0.45)" : "rgba(15, 23, 42, 0.16)"
                ctx.beginPath()
                const shadowRx = plant.type === 'tree' ? 24 * s : 12 * s
                const shadowRy = shadowRx * 0.35
                ctx.ellipse(0, -1, shadowRx, shadowRy, 0, 0, Math.PI * 2)
                ctx.fill()
                ctx.restore()

                if (editMode && plant.id === selectedPlantId) {
                    ctx.shadowColor = '#10B981'; // Emerald glow for selection
                    ctx.shadowBlur = 20;
                }
                if (night) ctx.filter = "brightness(0.3) saturate(0.6)"
                else if (eve) ctx.filter = "brightness(0.72) saturate(1.15)"
                else if (morn) ctx.filter = "brightness(0.9) saturate(0.85)"
                if (vs !== 'winter' && plant.type === 'flower') {
                    ctx.save(); ctx.filter = "none"; ctx.strokeStyle = night ? "#064E3B" : "#15803D"; ctx.lineWidth = 1.5 * s
                    ctx.beginPath(); ctx.moveTo(-2 * s, 0); ctx.quadraticCurveTo(-5 * s, -3 * s, -8 * s, 0); ctx.stroke()
                    ctx.beginPath(); ctx.moveTo(2 * s, 0); ctx.quadraticCurveTo(5 * s, -4 * s, 8 * s, 0); ctx.stroke()
                    ctx.restore()
                }
                const img = assets.current[plant.subtype] || assets.current['sakura']
                if (img) {
                    if (plant.type === 'tree') {
                        ctx.rotate(wind * 0.8); const sz = 220 * s; 
                        if (!editMode || plant.id !== selectedPlantId) {
                            ctx.shadowColor = night ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)';
                            ctx.shadowBlur = 20;
                        }
                        try { ctx.drawImage(img, -sz / 2, -sz, sz, sz) } catch (e) { }
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.rotate(wind * 2.5); const p2 = 1 + Math.sin(t * 0.03 + plant.seed) * 0.02; ctx.scale(p2, p2)
                        ctx.translate(0, Math.sin(t * 0.05 + plant.seed) * 1); const sz = 125 * s
                        
                        if (!editMode || plant.id !== selectedPlantId) {
                            ctx.shadowColor = night ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)';
                            ctx.shadowBlur = 12;
                        }
                        try { ctx.drawImage(img, -sz / 2, -sz, sz, sz) } catch (e) { }
                        ctx.shadowBlur = 0;

                        if (night) {
                            ctx.filter = "none"; ctx.globalAlpha = 0.22
                            const fg = ctx.createRadialGradient(0, -sz * 0.5, 0, 0, -sz * 0.5, sz * 0.6)
                            fg.addColorStop(0, plant.color); fg.addColorStop(1, "transparent")
                            ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(0, -sz * 0.5, sz * 0.6, 0, Math.PI * 2); ctx.fill()
                        }
                    }
                }
                ctx.restore()
            })

            // ── PARTICLES ──
            const rnd = Math.random()
            if (vs === 'spring' && rnd < 0.02) parts.current.push({ x: Math.random() * W * 1.1, y: -15, vx: (Math.random() - 0.4) * 0.6, vy: Math.random() * 0.4 + 0.3, rot: Math.random() * Math.PI * 2, size: Math.random() * 4 + 2, color: ["#FBCFE8", "#F9A8D4", "#FDE68A", "#E879F9"][Math.floor(Math.random() * 4)], op: 0.75, type: "petal", life: 0 })
            if (vs === 'autumn' && rnd < 0.02) parts.current.push({ x: Math.random() * W * 1.1, y: -15, vx: (Math.random() - 0.4) * 0.8, vy: Math.random() * 0.5 + 0.3, rot: Math.random() * Math.PI * 2, size: Math.random() * 6 + 3, color: ["#EA580C", "#F59E0B", "#DC2626", "#D97706"][Math.floor(Math.random() * 4)], op: 0.85, type: "leaf", life: 0 })
            if (vs === 'winter' && rnd < 0.06) parts.current.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 0.4, vy: Math.random() * 0.6 + 0.3, rot: 0, size: Math.random() * 3 + 1, color: "#F0F9FF", op: 0.7 + Math.random() * 0.3, type: "snow", life: 0 })
            if (vs === 'summer' && !night && rnd < 0.01) parts.current.push({ x: Math.random() * W, y: H * 0.5 + Math.random() * H * 0.4, vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.3 - 0.1, rot: 0, size: Math.random() * 2 + 0.5, color: "#FDE047", op: 0, type: "pollen", life: 0 })
            
            // Rain Particle Spawning
            if (condition === 'rain' && Math.random() < 0.35) {
                parts.current.push({
                    x: Math.random() * W,
                    y: -15,
                    vx: 0.8 + Math.random() * 0.4,
                    vy: 7 + Math.random() * 3,
                    rot: 0,
                    size: Math.random() * 1.5 + 1.2,
                    color: dark ? "rgba(186, 230, 253, 0.35)" : "rgba(156, 163, 175, 0.3)",
                    op: 0.5,
                    type: "rain",
                    life: 0
                })
            }

            for (let i = parts.current.length - 1; i >= 0; i--) {
                const p = parts.current[i]; p.life++
                const drift = Math.sin(t * 0.03 + p.y * 0.01) * 0.3
                
                // Position updates
                if (p.type === 'rain') {
                    p.x += p.vx
                    p.y += p.vy
                } else if (p.type === 'ripple' || p.type === 'vapor') {
                    p.x += p.vx
                    p.y += p.vy
                } else {
                    p.x += p.vx + drift
                    p.y += p.vy
                    p.rot += 0.025
                }
                
                // Specific updates
                if (p.type === 'pollen') {
                    p.op = p.life < 30 ? p.life / 30 : (p.life > 170 ? (200 - p.life) / 30 : 0.6)
                }
                if (p.type === 'rain') {
                    // check collision with ground
                    const groundY = H * 0.87 + Math.sin(p.x * 0.03) * H * 0.01
                    if (p.y >= groundY) {
                        p.type = 'ripple'
                        p.vy = 0
                        p.vx = 0
                        p.life = 0
                        p.size = 1
                        p.color = dark ? "rgba(186, 230, 253, 0.45)" : "rgba(156, 163, 175, 0.4)"
                    }
                }
                if (p.type === 'ripple') {
                    p.size += 0.6
                    p.op = Math.max(0, (25 - p.life) / 25)
                }
                if (p.type === 'soil') {
                    p.vy += 0.08 // gravity
                    p.op = Math.max(0, (40 - p.life) / 40)
                }
                if (p.type === 'vapor') {
                    p.vy *= 0.98
                    p.size += 0.15
                    p.op = Math.max(0, (60 - p.life) / 60 * 0.35)
                }

                if (p.y > H + 30 || p.x < -50 || p.x > W + 50 || p.life > 350 || p.op <= 0) { parts.current.splice(i, 1); continue }
                
                ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = Math.max(0, p.op)
                if (p.type === 'snow') {
                    ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.28
                    for (let a = 0; a < 6; a++) {
                        ctx.save(); ctx.rotate(a * Math.PI / 3)
                        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p.size * 2); ctx.stroke()
                        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(-p.size * 0.5, -p.size * 0.6); ctx.stroke()
                        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.5, -p.size * 0.6); ctx.stroke()
                        ctx.restore()
                    }
                } else if (p.type === 'pollen') {
                    const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2)
                    pg.addColorStop(0, "rgba(253,224,71,0.9)"); pg.addColorStop(1, "rgba(253,224,71,0)")
                    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2); ctx.fill()
                } else if (p.type === 'rain') {
                    ctx.strokeStyle = p.color
                    ctx.lineWidth = p.size * 0.5
                    ctx.beginPath()
                    ctx.moveTo(0, 0)
                    ctx.lineTo(-p.vx * 1.2, -p.vy * 1.2)
                    ctx.stroke()
                } else if (p.type === 'ripple') {
                    ctx.strokeStyle = p.color
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.5, 0, 0, Math.PI * 2)
                    ctx.stroke()
                } else if (p.type === 'soil') {
                    ctx.fillStyle = p.color
                    ctx.beginPath()
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2)
                    ctx.fill()
                } else if (p.type === 'vapor') {
                    const mistGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
                    mistGrad.addColorStop(0, p.color)
                    mistGrad.addColorStop(1, 'transparent')
                    ctx.fillStyle = mistGrad
                    ctx.beginPath()
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2)
                    ctx.fill()
                } else {
                    ctx.rotate(p.rot + Math.sin(t * 0.05) * 0.3); ctx.scale(1, Math.abs(Math.sin(t * 0.04 + p.y * 0.05)) * 0.6 + 0.4)
                    ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2); ctx.fill()
                    if (p.type === 'leaf') { ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0); ctx.stroke() }
                }
                ctx.restore()
            }
            if (parts.current.length > 250) parts.current.splice(0, 30)

            // ── SPARKLE PARTICLES (plant click) ──
            for (let i = sparkleRef.current.length - 1; i >= 0; i--) {
                const sp = sparkleRef.current[i]
                sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.08; sp.life -= 0.025
                if (sp.life <= 0) { sparkleRef.current.splice(i, 1); continue }
                ctx.save(); ctx.globalAlpha = sp.life; ctx.fillStyle = sp.color
                ctx.shadowColor = sp.color; ctx.shadowBlur = 6
                ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2); ctx.fill()
                ctx.restore()
            }

            // ── FIREFLIES ──
            if (dark) {
                const fa = night ? 1 : 0.5
                flies.current.forEach(ff => {
                    ff.vx += (Math.random() - 0.5) * 0.00015; ff.vy += (Math.random() - 0.5) * 0.00008
                    ff.vx = Math.max(-0.0015, Math.min(0.0015, ff.vx)); ff.vy = Math.max(-0.001, Math.min(0.001, ff.vy))
                    ff.x += ff.vx; ff.y += ff.vy; ff.phase += ff.spd
                    if (ff.x < 0.05) ff.x = 0.95; if (ff.x > 0.95) ff.x = 0.05; if (ff.y < 0.38) ff.y = 0.38; if (ff.y > 0.93) ff.y = 0.93
                    const pulse = (Math.sin(ff.phase) + 1) / 2; const alpha = fa * ff.maxOp * pulse
                    if (alpha < 0.05) return
                    const fx = ff.x * W, fy = ff.y * H
                    ctx.save()
                    const fh = ctx.createRadialGradient(fx, fy, 0, fx, fy, 14)
                    fh.addColorStop(0, `rgba(167,243,208,${alpha * 0.55})`); fh.addColorStop(1, "rgba(167,243,208,0)")
                    ctx.fillStyle = fh; ctx.beginPath(); ctx.arc(fx, fy, 14, 0, Math.PI * 2); ctx.fill()
                    ctx.globalAlpha = alpha; ctx.fillStyle = "#D1FAE5"; ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill()
                    ctx.restore()
                })
            }

            // ── FUDA (Wooden Name Tag Hover) ──
            let hoveredPlant: Plant | null = null
            if (mousePosRef.current.isOver && !editMode) {
                const mx = mousePosRef.current.x * W
                const my = mousePosRef.current.y * H
                for (let i = plants.length - 1; i >= 0; i--) {
                    const p = plants[i]
                    if (!p.id) continue
                    const px = p.x * W
                    const py = p.y * H
                    const size = p.type === 'tree' ? 220 : 125
                    const scale = p.scale * p.growth
                    const sz = size * scale
                    const centerX = px
                    const centerY = py - sz / 2
                    
                    const dx = mx - centerX
                    const dy = my - centerY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < sz / 2 + 10) {
                        hoveredPlant = p
                        break
                    }
                }
            }

            if (hoveredPlant) {
                const px = hoveredPlant.x * W
                const py = hoveredPlant.y * H
                const size = hoveredPlant.type === 'tree' ? 220 : 125
                const scale = hoveredPlant.scale * hoveredPlant.growth
                const sz = size * scale
                
                const tagW = 125
                const tagH = 56
                
                // Position tag to the right or left depending on space
                let tagX = px + sz / 2 + 8
                if (tagX + tagW > W - 10) {
                    tagX = px - sz / 2 - tagW - 8
                }
                const tagY = py - sz / 2 - 25
                
                ctx.save()
                
                // Shadow
                ctx.shadowColor = 'rgba(0,0,0,0.18)'
                ctx.shadowBlur = 6
                ctx.shadowOffsetY = 3
                
                // Wooden board background
                ctx.fillStyle = '#dfc39d' // light wood
                ctx.strokeStyle = '#5c4033' // dark wood border
                ctx.lineWidth = 1.5
                
                ctx.beginPath()
                if (ctx.roundRect) {
                    ctx.roundRect(tagX, tagY, tagW, tagH, 5)
                } else {
                    ctx.rect(tagX, tagY, tagW, tagH)
                }
                ctx.fill()
                ctx.stroke()
                
                // Inner wood grain lines
                ctx.strokeStyle = 'rgba(92, 64, 51, 0.08)'
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(tagX + 5, tagY + 12)
                ctx.quadraticCurveTo(tagX + tagW/2, tagY + 15, tagX + tagW - 5, tagY + 10)
                ctx.moveTo(tagX + 5, tagY + 28)
                ctx.quadraticCurveTo(tagX + tagW/2, tagY + 30, tagX + tagW - 5, tagY + 26)
                ctx.moveTo(tagX + 5, tagY + 44)
                ctx.quadraticCurveTo(tagX + tagW/2, tagY + 46, tagX + tagW - 5, tagY + 42)
                ctx.stroke()
                
                // Double border line inside
                ctx.strokeStyle = 'rgba(92, 64, 51, 0.25)'
                ctx.lineWidth = 0.5
                ctx.strokeRect(tagX + 3, tagY + 3, tagW - 6, tagH - 6)
                
                ctx.shadowColor = 'transparent'
                
                // Text drawing
                const pName = PLANT_NAMES[hoveredPlant.subtype] || hoveredPlant.subtype
                const growPct = Math.round(hoveredPlant.growth * 100)
                const nurtureVal = Math.round((hoveredPlant.targetGrowth ?? 1) * 100)
                
                // Title
                ctx.fillStyle = '#2f1f17' // dark brown text
                ctx.font = 'bold 11px sans-serif'
                ctx.fillText(pName, tagX + 10, tagY + 16)
                
                // Growth info
                ctx.fillStyle = '#5c4033'
                ctx.font = '9px sans-serif'
                ctx.fillText(`Growth: ${growPct}%`, tagX + 10, tagY + 31)
                
                // Hydration info
                ctx.fillText(`Hydration: ${nurtureVal}%`, tagX + 10, tagY + 44)
                
                // Draw a tiny water drop indicator icon
                ctx.fillStyle = '#0ea5e9'
                ctx.beginPath()
                ctx.arc(tagX + tagW - 15, tagY + 38, 3, 0, Math.PI * 2)
                ctx.fill()
                
                ctx.restore()
            }

            raf = requestAnimationFrame(render)
        }
        render()
        return () => { cancelAnimationFrame(raf); ro.disconnect() }
    }, [mSeason, condition, loaded])

    const startPlacement = (item: any) => {
        setPlantToPlace(item)
        setEditMode(true)
        setShowStore(false)
        toast.info(`Click anywhere in the garden to plant your ${item.name}!`)
    }

    const handlePointerMoveCanvas = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!cont.current) return
        const rect = cont.current.getBoundingClientRect()
        mousePosRef.current = {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
            isOver: true
        }
        handlePointerMove(e)
    }

    const handlePointerLeaveCanvas = () => {
        mousePosRef.current.isOver = false
        handlePointerUp()
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        if (target.closest('.plant-control-overlay')) {
            return
        }
        if (!cont.current) return
        const rect = cont.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top
        const x = clickX / rect.width
        const y = clickY / rect.height

        // Check if clicked the stone lantern (Tōrō)
        const lx = 0.78 * rect.width
        const ly = 0.74 * rect.height
        const lSize = 50
        const ldx = clickX - lx
        const ldy = clickY - (ly - lSize / 2)
        if (Math.sqrt(ldx * ldx + ldy * ldy) < lSize * 0.8) {
            setLanternLit(prev => !prev)
            toast.success(!lanternLit ? "Stone lantern lit. 🏮" : "Stone lantern extinguished.")
            return
        }

        // Sky click check (for wind gusts)
        if (y < 0.45 && !plantToPlace && !editMode) {
            windGustRef.current = { intensity: 4.5, duration: 120 }
            toast.success("A gentle breeze sweeps through the garden... 🍃")
            
            // Spawn initial burst of wind leaves/petals
            for (let i = 0; i < 8; i++) {
                parts.current.push({
                    x: Math.random() * rect.width * 0.3,
                    y: Math.random() * rect.height * 0.5,
                    vx: 3 + Math.random() * 4,
                    vy: (Math.random() - 0.3) * 1.5,
                    rot: Math.random() * Math.PI * 2,
                    size: Math.random() * 5 + 3,
                    color: mSeason === 'autumn' 
                        ? ["#EA580C", "#F59E0B", "#DC2626"][Math.floor(Math.random() * 3)]
                        : mSeason === 'spring'
                        ? ["#FBCFE8", "#F9A8D4", "#E879F9"][Math.floor(Math.random() * 3)]
                        : ["#10B981", "#34D399", "#059669"][Math.floor(Math.random() * 3)],
                    op: 0.85,
                    type: "leaf",
                    life: 0
                })
            }
            return
        }





        if (plantToPlace) {
            // Constrain placement y to ground zone [0.48, 0.92]
            const constrainedY = Math.max(0.48, Math.min(0.92, y))
            
            // 1. Placement from storage
            if (plantToPlace.isFromStorage) {
                const newPlant = {
                    id: plantToPlace.id || Date.now().toString(),
                    type: plantToPlace.type,
                    subtype: plantToPlace.subtype,
                    x, y: constrainedY,
                    scale: plantToPlace.scale || (plantToPlace.type === 'tree' ? 1.15 : 0.95),
                    nurtureLevel: plantToPlace.nurtureLevel !== undefined ? plantToPlace.nurtureLevel : 20
                }

                if (gardenView === "shared") {
                    const currentPlants = sharedGarden?.plants || []
                    const currentStorage = sharedGarden?.storage || []
                    const newStorage = currentStorage.filter((item: any) => item.id !== plantToPlace.id)
                    
                    const userName = settings?.userName || "Anonymous"
                    const newLog = {
                        id: Math.random().toString(36).substring(7),
                        message: `placed stored ${PLANT_NAMES[plantToPlace.subtype] || plantToPlace.subtype} back in garden`,
                        user: userName,
                        timestamp: new Date().toISOString()
                    }

                    updateSharedGarden({
                        plants: [...currentPlants, newPlant],
                        storage: newStorage,
                        activityLog: [newLog, ...(sharedGarden?.activityLog || [])].slice(0, 50)
                    }).catch(() => {
                        toast.error("Failed to place plant from storage")
                    })
                } else {
                    const currentPlants = settings?.gardenPlants || []
                    const currentStorage = settings?.gardenStorage || []
                    const newStorage = currentStorage.filter((item: any) => item.id !== plantToPlace.id)

                    updateSettings({
                        gardenPlants: [...currentPlants, newPlant],
                        gardenStorage: newStorage
                    })
                }
                const name = PLANT_NAMES[plantToPlace.subtype] || plantToPlace.subtype
                toast.success(`Placed ${name} from Storage bag!`)
                setPlantToPlace(null)
                playPlanting()
                return
            }

            // 2. Standard shop purchase placement
            if (gardenView === "shared") {
                const currentSun = sharedGarden?.sunlightPool || 0
                const currentWater = sharedGarden?.waterPool || 0
                if (currentSun >= plantToPlace.costSunlight && currentWater >= plantToPlace.costWater) {
                    const newSun = currentSun - plantToPlace.costSunlight
                    const newWater = currentWater - plantToPlace.costWater
                    
                    const newPlant = {
                        id: Date.now().toString(),
                        type: plantToPlace.type,
                        subtype: plantToPlace.id,
                        x, y: constrainedY,
                        scale: plantToPlace.type === 'tree' ? 1.15 : 0.95,
                        nurtureLevel: 20
                    }
                    const userName = settings?.userName || "Anonymous"
                    const newLog = {
                        id: Math.random().toString(36).substring(7),
                        message: `planted a communal ${plantToPlace.name} seed`,
                        user: userName,
                        timestamp: new Date().toISOString()
                    }
                    const currentPlants = sharedGarden?.plants || []
                    updateSharedGarden({
                        sunlightPool: newSun,
                        waterPool: newWater,
                        plants: [...currentPlants, newPlant],
                        activityLog: [newLog, ...(sharedGarden?.activityLog || [])].slice(0, 50)
                    }).catch(() => {
                        toast.error("Failed to plant in Co-op Garden")
                    })
                    toast.success(`Planted ${plantToPlace.name} in Co-op Garden!`)
                    setPlantToPlace(null)
                    playPlanting()
                } else {
                    toast.error("Not enough Co-op resources!")
                    setPlantToPlace(null)
                }
            } else {
                const currentSun = settings?.sunlight || 0
                const currentWater = settings?.waterdrops || 0
                if (currentSun >= plantToPlace.costSunlight && currentWater >= plantToPlace.costWater) {
                    const newSun = currentSun - plantToPlace.costSunlight
                    const newWater = currentWater - plantToPlace.costWater
                    
                    const newPlant = {
                        id: Date.now().toString(),
                        type: plantToPlace.type,
                        subtype: plantToPlace.id,
                        x, y: constrainedY,
                        scale: plantToPlace.type === 'tree' ? 1.15 : 0.95,
                        nurtureLevel: 20
                    }
                    const currentPlants = settings?.gardenPlants || []
                    updateSettings({ sunlight: newSun, waterdrops: newWater, gardenPlants: [...currentPlants, newPlant] })
                    toast.success(`Planted ${plantToPlace.name}!`)
                    setPlantToPlace(null)
                    playPlanting()
                } else {
                    toast.error("Not enough resources!")
                    setPlantToPlace(null)
                }
            }
            return
        }

        if (editMode) {
            if (!cvs.current) return
            const W = rect.width
            const H = rect.height
            
            // Select existing plant
            for (let i = plants.length - 1; i >= 0; i--) {
                const p = plants[i]
                if (!p.id) continue
                
                const px = p.x * W
                const py = p.y * H
                const size = p.type === 'tree' ? 220 : 125
                const scale = p.scale * p.growth
                const sz = size * scale
                
                // Plant center in pixels
                const centerX = px
                const centerY = py - sz / 2
                
                // Distance in pixels
                const dx = clickX - centerX
                const dy = clickY - centerY
                const dist = Math.sqrt(dx * dx + dy * dy)
                
                // Click target threshold: half size + comfort padding
                const threshold = sz / 2 + 16
                
                if (dist < threshold) {
                    setSelectedPlantId(p.id)
                    isDragging.current = true
                    return
                }
            }
            setSelectedPlantId(null)
            isDragging.current = false
        } else {
            // Normal mode: click on plant to show info + sparkle
            if (!cvs.current) return
            const W = rect.width
            const H = rect.height
            for (let i = plants.length - 1; i >= 0; i--) {
                const p = plants[i]
                if (!p.id) continue
                const px = p.x * W, py = p.y * H
                const size = p.type === 'tree' ? 220 : 125
                const scale = p.scale * p.growth
                const sz = size * scale
                const centerX = px, centerY = py - sz / 2
                const dx = clickX - centerX, dy = clickY - centerY
                if (Math.sqrt(dx * dx + dy * dy) < sz / 2 + 16) {
                    setClickedPlant({ plant: p, x: clickX, y: clickY })
                    // Spawn sparkle particles
                    const colors = ['#10b981', '#f59e0b', '#34d399', '#fbbf24', '#a78bfa']
                    for (let j = 0; j < 12; j++) {
                        const angle = (Math.PI * 2 * j) / 12
                        sparkleRef.current.push({
                            x: px, y: py - sz / 2,
                            vx: Math.cos(angle) * (1.5 + Math.random() * 2),
                            vy: Math.sin(angle) * (1.5 + Math.random()) - 1,
                            life: 1, color: colors[j % colors.length],
                            size: 2 + Math.random() * 3,
                        })
                    }
                    return
                }
            }
            setClickedPlant(null)
        }
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!editMode || !isDragging.current || !selectedPlantId || !cont.current) return
        
        const rect = cont.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top
        
        let x = clickX / rect.width
        let y = clickY / rect.height
        
        x = Math.max(0.02, Math.min(0.98, x))
        y = Math.max(0.48, Math.min(0.92, y))
        
        setPlants(prev => {
            const updated = prev.map(p => p.id === selectedPlantId ? { ...p, x, y } : p)
            return updated.sort((a, b) => a.y - b.y)
        })
    }

    const handlePointerUp = () => {
        if (isDragging.current && selectedPlantId) {
            isDragging.current = false
            const draggedPlant = pRef.current.find(p => p.id === selectedPlantId)
            if (draggedPlant) {
                updateSelectedPlant({ x: draggedPlant.x, y: draggedPlant.y })
            }
        }
    }

    const updateSelectedPlant = (updates: any) => {
        if (!selectedPlantId) return
        if (gardenView === "shared") {
            const currentPlants = sharedGarden?.plants || []
            const newPlants = currentPlants.map((p: any) => p.id === selectedPlantId ? { ...p, ...updates } : p)
            updateSharedGarden({ plants: newPlants }).catch(() => {})
        } else {
            const currentPlants = settings?.gardenPlants || []
            const newPlants = currentPlants.map((p: any) => p.id === selectedPlantId ? { ...p, ...updates } : p)
            updateSettings({ gardenPlants: newPlants })
        }
    }

    const removeSelectedPlant = () => {
        if (!selectedPlantId) return
        if (gardenView === "shared") {
            const currentPlants = sharedGarden?.plants || []
            const plantToStore = currentPlants.find((p: any) => p.id === selectedPlantId)
            if (!plantToStore) return

            const updatedPlants = currentPlants.filter((p: any) => p.id !== selectedPlantId)
            const currentStorage = sharedGarden?.storage || []
            const updatedStorage = [...currentStorage, plantToStore]

            const userName = settings?.userName || "Anonymous"
            const newLog = {
                id: Math.random().toString(36).substring(7),
                message: `dug up and stored the communal ${PLANT_NAMES[plantToStore.subtype] || plantToStore.subtype}`,
                user: userName,
                timestamp: new Date().toISOString()
            }

            updateSharedGarden({ 
                plants: updatedPlants, 
                storage: updatedStorage,
                activityLog: [newLog, ...(sharedGarden?.activityLog || [])].slice(0, 50)
            }).catch(() => {
                toast.error("Failed to store plant")
            })
            setSelectedPlantId(null)
            toast.success("Communal plant dug up and placed in Storage bag! 🎒")
        } else {
            const currentPlants = settings?.gardenPlants || []
            const plantToStore = currentPlants.find((p: any) => p.id === selectedPlantId)
            if (!plantToStore) return

            const updatedPlants = currentPlants.filter((p: any) => p.id !== selectedPlantId)
            const currentStorage = settings?.gardenStorage || []
            const updatedStorage = [...currentStorage, plantToStore]

            updateSettings({ 
                gardenPlants: updatedPlants, 
                gardenStorage: updatedStorage 
            })
            setSelectedPlantId(null)
            toast.success("Plant dug up and placed in Storage bag! 🎒")
        }
    }

    const hour = new Date().getHours()
    let todLabel = "Night"
    if (mTime !== 'auto') todLabel = mTime.charAt(0).toUpperCase() + mTime.slice(1)
    else { if (hour >= 6 && hour < 12) todLabel = "Morning"; else if (hour >= 12 && hour < 17) todLabel = "Afternoon"; else if (hour >= 17 && hour < 20) todLabel = "Evening" }

    return (
        <Card className="card-zen overflow-hidden h-full flex flex-col relative group">
            <CardHeader className="pb-2 absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-slate-900/40 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between pointer-events-none gap-4">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 dark:bg-slate-900/50 shadow-sm border border-white/10 backdrop-blur-md">
                        <Icons.tree className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/20 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                        <CardTitle className="text-lg font-bold text-white drop-shadow-md">
                            {gardenView === "shared" ? (sharedGarden?.name || "Co-op Garden") : "Visual Garden"}
                        </CardTitle>
                        <p className="text-xs text-white/90 font-medium capitalize flex items-center gap-1.5 drop-shadow">
                            <span>{mSeason}</span><span className="opacity-70">•</span>
                            <span>{todLabel}</span><span className="opacity-70">•</span>
                            <span>{temperature != null ? Math.round(temperature) : '--'}°C</span>
                            {gardenView === "shared" && (
                                <>
                                    <span className="opacity-70">•</span>
                                    <span className="text-emerald-300 font-bold">Co-op</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end pointer-events-auto w-full sm:w-auto items-center">
                    {/* Personal vs Shared Garden Toggle */}
                    {settings?.activeSharedGardenId && (
                        <div className="flex bg-white/20 backdrop-blur-md rounded-full p-0.5 border border-white/20 shadow-sm pointer-events-auto">
                            <button
                                onClick={() => { setGardenView("personal"); setSelectedPlantId(null); setPlantToPlace(null); }}
                                className={`h-8 px-3 rounded-full text-xs font-bold transition-all active:scale-95 ${gardenView === "personal" ? 'bg-white text-slate-800 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                            >
                                Personal
                            </button>
                            <button
                                onClick={() => { setGardenView("shared"); setSelectedPlantId(null); setPlantToPlace(null); }}
                                className={`h-8 px-3 rounded-full text-xs font-bold transition-all active:scale-95 ${gardenView === "shared" ? 'bg-emerald-500 text-white shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                            >
                                Co-op
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-white/30 dark:bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs drop-shadow" title={gardenView === "shared" ? "Co-op Sunlight" : "Sunlight"}>
                            <Icons.sun className="w-3.5 h-3.5" />
                            <span>{gardenView === "shared" ? (sharedGarden?.sunlightPool || 0) : (settings?.sunlight || 0)}</span>
                        </div>
                        <div className="w-px h-3 bg-white/30 mx-1" />
                        <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs drop-shadow" title={gardenView === "shared" ? "Co-op Waterdrops" : "Waterdrops"}>
                            <Icons.droplets className="w-3.5 h-3.5" />
                            <span>{gardenView === "shared" ? (sharedGarden?.waterPool || 0) : (settings?.waterdrops || 0)}</span>
                        </div>
                    </div>
                    
                    <button onClick={() => { setEditMode(!editMode); setSelectedPlantId(null); setPlantToPlace(null) }} className={`h-9 px-4 rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95 border ${editMode ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30' : 'bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-md'}`} title="Toggle Build Mode">
                        <Icons.mousePointer className="w-4 h-4" /><span className="text-sm font-bold">{editMode ? 'Done' : 'Edit Garden'}</span>
                    </button>
                    
                    <button onClick={() => setShowStore(!showStore)} className="h-9 px-4 rounded-full flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 shadow-sm transition-all active:scale-95" title="Open Nursery">
                        <Icons.flower className="w-4 h-4" /><span className="text-sm font-bold hidden sm:inline">Nursery</span>
                    </button>
                    <div ref={envMenuRef} className="relative pointer-events-auto">
                        <button
                            onClick={() => setShowEnvMenu(!showEnvMenu)}
                            className={`h-9 px-4 rounded-full flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white shadow-sm transition-all active:scale-95 ${showEnvMenu ? 'bg-white/30 border-white/40' : ''}`}
                            title="Change Environment"
                        >
                            <span>🌤️</span>
                            <span className="text-sm font-bold hidden md:inline">Sky Options</span>
                            <Icons.chevronDown className={`w-3 h-3 transition-transform duration-300 ${showEnvMenu ? 'rotate-180' : ''}`} />
                        </button>
                        {showEnvMenu && (
                            <div className="absolute right-0 top-11 mt-2.5 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 w-64 pointer-events-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Time of Day</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-inner justify-between">
                                        {(['auto', 'morning', 'afternoon', 'evening', 'night'] as const).map(t2 => (
                                            <button
                                                key={t2}
                                                onClick={() => setMTime(t2)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${mTime === t2 ? 'bg-white dark:bg-slate-700 shadow-sm scale-110' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                                                title={t2 === 'auto' ? 'Auto' : t2}
                                            >
                                                {t2 === 'auto' && '🤖'}
                                                {t2 === 'morning' && '🌅'}
                                                {t2 === 'afternoon' && '☀️'}
                                                {t2 === 'evening' && '🌆'}
                                                {t2 === 'night' && '🌙'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Season</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-inner justify-between">
                                        {(['spring', 'summer', 'autumn', 'winter'] as const).map(s2 => (
                                            <button
                                                key={s2}
                                                onClick={() => setMSeason(s2)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${mSeason === s2 ? 'bg-white dark:bg-slate-700 shadow-sm scale-110' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                                                title={s2}
                                            >
                                                {s2 === 'spring' && '🌸'}
                                                {s2 === 'summer' && '🌻'}
                                                {s2 === 'autumn' && '🍂'}
                                                {s2 === 'winter' && '❄️'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <Dialog open={showStore} onOpenChange={setShowStore}>
                <DialogContent className="w-full max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] gap-0">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20">
                        <div>
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                <Icons.flower className="w-5 h-5 animate-pulse" /> The Nursery {gardenView === "shared" && "(Co-op)"}
                            </h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {gardenView === "shared" 
                                    ? "Spend pooled resources to plant seeds in the shared garden" 
                                    : "Spend resources to plant seeds in your garden"}
                            </p>
                        </div>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mx-4 mt-4 mb-1 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                        <button
                            onClick={() => setNurseryTab("shop")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${nurseryTab === "shop" ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            🛍️ Seed Shop
                        </button>
                        {(() => {
                            const currentStorage = gardenView === "shared"
                                ? (sharedGarden?.storage || [])
                                : (settings?.gardenStorage || [])
                            return (
                                <button
                                    onClick={() => setNurseryTab("storage")}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${nurseryTab === "storage" ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    <span>🎒 Storage Bag</span>
                                    {currentStorage.length > 0 && (
                                        <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                                            {currentStorage.length}
                                        </span>
                                    )}
                                </button>
                            )
                        })()}
                    </div>

                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                        {nurseryTab === "shop" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {NURSERY_ITEMS.map(item => {
                                    const canAfford = gardenView === "shared"
                                        ? (sharedGarden?.sunlightPool || 0) >= item.costSunlight && (sharedGarden?.waterPool || 0) >= item.costWater
                                        : (settings?.sunlight || 0) >= item.costSunlight && (settings?.waterdrops || 0) >= item.costWater
                                    return (
                                        <div key={item.id} className={`flex flex-col p-3 rounded-2xl border transition-all duration-200 ${canAfford ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/80 opacity-70'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</h4>
                                                        <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><Icons.sun className="w-3 h-3"/>{item.costSunlight}</span>
                                                    <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1"><Icons.droplets className="w-3 h-3"/>{item.costWater}</span>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setShowStore(false)
                                                        startPlacement(item)
                                                    }}
                                                    disabled={!canAfford}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${canAfford ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-emerald-500/30 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            /* Storage Bag List */
                            (() => {
                                const currentStorage = gardenView === "shared"
                                    ? (sharedGarden?.storage || [])
                                    : (settings?.gardenStorage || [])
                                
                                const plantIcons: Record<string, string> = {
                                    sakura: "🌸", maple: "🍁", pine: "🌲", jacaranda: "🌳",
                                    sunflower: "🌻", tulip: "🌷", orchid: "🌺", marigold: "🌼",
                                    snowdrop: "❄️", lily: "🪷", chrysanthemum: "🏵️", snowflower: "💮"
                                }

                                return currentStorage.length === 0 ? (
                                    <div className="text-center py-10 space-y-2">
                                        <span className="text-4xl block">🎒</span>
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Storage Bag is Empty</h4>
                                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                            Dug up plants from your garden will appear here. Re-plant them anytime for free!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {currentStorage.map((item: any) => (
                                            <div key={item.id} className="flex flex-col p-3 rounded-2xl border bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{plantIcons[item.subtype] || "🌱"}</span>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                                {PLANT_NAMES[item.subtype] || item.subtype}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-500">
                                                                Dug up at {Math.round((item.nurtureLevel !== undefined ? item.nurtureLevel : 100))}% Growth
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
                                                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">✨ Saved Stage</span>
                                                    <button 
                                                        onClick={() => {
                                                            setShowStore(false)
                                                            startPlacement({
                                                                ...item,
                                                                isFromStorage: true
                                                            })
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-emerald-500/30 active:scale-95 transition-all"
                                                    >
                                                        Plant (Free)
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()
                        )}
                        
                        {/* Quick resource boost for testing */}
                        <button 
                            onClick={() => {
                                if (gardenView === "shared") {
                                    updateSharedGarden({
                                        sunlightPool: (sharedGarden?.sunlightPool || 0) + 500,
                                        waterPool: (sharedGarden?.waterPool || 0) + 100
                                    }).catch(() => {})
                                    toast.success("Added +500 ☀️ and +100 💧 to Co-op pool!")
                                } else {
                                    updateSettings({ sunlight: (settings?.sunlight || 0) + 500, waterdrops: (settings?.waterdrops || 0) + 100 })
                                    toast.success("Added +500 ☀️ and +100 💧!")
                                }
                            }}
                            className="w-full mt-4 p-2.5 bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-950/20 dark:to-blue-950/20 hover:from-amber-100 hover:to-blue-100 dark:hover:from-amber-950/40 dark:hover:to-blue-950/40 text-xs font-semibold rounded-xl border border-amber-200/50 dark:border-amber-800/30 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            🎁 Bonus: +500 ☀️  +100 💧 {gardenView === "shared" && "(Co-op)"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="w-full relative bg-slate-50 dark:bg-slate-900 transition-colors duration-700 flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
                <div 
                    ref={cont} 
                    onPointerDown={handlePointerDown} 
                    onPointerMove={handlePointerMoveCanvas}
                    onPointerUp={handlePointerLeaveCanvas}
                    onPointerLeave={handlePointerLeaveCanvas}
                    className={`min-w-[800px] w-full h-[350px] sm:h-[480px] relative ${plantToPlace ? 'cursor-crosshair' : editMode ? 'cursor-move' : ''}`}
                >
                    <canvas ref={cvs} className="w-full h-full block" />

                    {clickedPlant && (() => {
                        const name = PLANT_NAMES[clickedPlant.plant.subtype] || clickedPlant.plant.subtype
                        const originalPlant = (gardenView === "shared" ? sharedGarden?.plants : settings?.gardenPlants)?.find((p: any) => p.id === clickedPlant.plant.id)
                        const nurtureLevel = originalPlant?.nurtureLevel !== undefined ? originalPlant.nurtureLevel : 100
                        const isMature = nurtureLevel >= 100
                        const isHarvested = originalPlant?.status === "mature"

                        return (
                            <div
                                className="absolute z-20 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap animate-in fade-in zoom-in duration-200 flex flex-col gap-2 min-w-[200px]"
                                style={{
                                    left: clickedPlant.x,
                                    top: clickedPlant.y - 16,
                                    transform: 'translate(-50%, -100%)',
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between gap-4 border-b border-slate-500/10 pb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-base">{clickedPlant.plant.type === 'tree' ? '🌳' : '🌷'}</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{name}</span>
                                    </div>
                                    <button 
                                        onClick={() => setClickedPlant(null)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Icons.close className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                
                                <div className="flex flex-col gap-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-normal">Status:</span>
                                        <span className={`font-semibold ${isHarvested ? 'text-emerald-600 dark:text-emerald-400' : isMature ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {isHarvested ? 'Harvested Trophy 🏆' : isMature ? 'Fully Mature ✨' : 'Growing Seedling 🌱'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6">
                                        <span className="text-slate-400 font-normal">Nurture Level:</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" 
                                                    style={{ width: `${nurtureLevel}%` }}
                                                />
                                            </div>
                                            <span className="font-semibold text-slate-600 dark:text-slate-300">{nurtureLevel}%</span>
                                        </div>
                                    </div>
                                </div>

                                {!isMature && (
                                    <button
                                        onClick={() => {
                                            if (gardenView === "shared") {
                                                handleWaterShared(clickedPlant.plant.id!)
                                            } else {
                                                handleWaterPersonal(clickedPlant.plant.id!)
                                            }
                                        }}
                                        className="w-full mt-1.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400/20 to-blue-400/20 hover:from-sky-400/30 hover:to-blue-400/30 border border-sky-400/30 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                                    >
                                        <span>💧</span>
                                        <span>Water {gardenView === "shared" ? '(-20 Communal)' : '(-10 Drops)'}</span>
                                    </button>
                                )}

                                {gardenView === "shared" && isMature && !isHarvested && (
                                    <button
                                        onClick={() => handleHarvestShared(clickedPlant.plant.id!)}
                                        className="w-full mt-1.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 hover:from-amber-400/30 hover:to-orange-400/30 border border-amber-400/30 dark:border-orange-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                                    >
                                        <span>🏆</span>
                                        <span>Harvest (+100 Sun)</span>
                                    </button>
                                )}
                            </div>
                        )
                    })()}
                    
                    {editMode && selectedPlantId && (() => {
                        const p = plants.find(p => p.id === selectedPlantId)
                        if (!p) return null
                        return (
                            <div className="plant-control-overlay absolute z-20 flex gap-1 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 backdrop-blur-md transform -translate-x-1/2 -translate-y-full animate-in zoom-in duration-200" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, marginTop: '-20px' }}>
                                <button onClick={(e) => { e.stopPropagation(); updateSelectedPlant({ scale: Math.min((p.scale || 1) + 0.1, 1.5) }) }} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300" title="Make Bigger">
                                    <Icons.plus className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); updateSelectedPlant({ scale: Math.max((p.scale || 1) - 0.1, 0.3) }) }} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300" title="Make Smaller">
                                    <Icons.minus className="w-4 h-4" />
                                </button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 my-auto mx-1" />
                                <button onClick={(e) => { e.stopPropagation(); removeSelectedPlant() }} className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-red-500" title="Remove">
                                    <Icons.trash className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedPlantId(null) }} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500" title="Deselect">
                                    <Icons.close className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })()}
                </div>
            </div>
        </Card>
    )
}
