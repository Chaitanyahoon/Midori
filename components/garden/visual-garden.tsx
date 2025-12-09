"use client"

import { useEffect, useRef, useState } from "react"
import { useData } from "@/components/local-data-provider"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useTheme } from "next-themes"
import { useWeather } from "@/hooks/use-weather"

interface Plant {
    x: number; y: number; type: "flower" | "tree"; subtype: string; color: string; scale: number; growth: number; delay: number; swayOffset: number; swaySpeed: number; seed: number
}

interface Particle {
    x: number; y: number; color: string; size: number; rotation: number; speedX: number; speedY: number; opacity: number;
    type: "leaf" | "butterfly" | "pollen" | "firefly";
    frameOffset: number;
    subtype?: string;
    // Leaf props
    tumbleSpeed?: number; tumbleOffset?: number;
    // Butterfly props
    targetX?: number; targetY?: number; state?: "flying" | "hovering"; timer?: number
}

export function VisualGarden({ onAddPlant }: { onAddPlant?: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const { tasks, pomodoros, stats } = useData()
    const { theme } = useTheme()
    const { season, weather } = useWeather()
    const { condition, isDay, temperature } = weather

    // Manual Season & Time Control
    const [manualSeason, setManualSeason] = useState<"spring" | "summer" | "autumn" | "winter">(season)
    const [manualTime, setManualTime] = useState<"morning" | "afternoon" | "evening" | "night" | "auto">("auto")

    const visualSeason = manualSeason

    const isDark = manualTime === 'auto'
        ? (theme === 'dark' || (!isDay && condition !== 'clear'))
        : (manualTime === 'night' || manualTime === 'evening') // Assume evening is somewhat dark or transitioning

    // Force snow if manual season is winter
    const isSnowing = condition === 'snow' || manualSeason === 'winter'

    const [plants, setPlants] = useState<Plant[]>([])
    const particlesRef = useRef<Particle[]>([])

    // --- ASSET PRELOADING ---
    const assetsRef = useRef<Record<string, HTMLImageElement>>({})
    const [assetsLoaded, setAssetsLoaded] = useState(false)

    const seededRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000; return x - Math.floor(x)
    }

    // Helper for color adjustments
    const adjustColor = (hex: string, percent: number) => {
        const num = parseInt(hex.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // --- PRELOAD ASSETS ---
    useEffect(() => {
        const toLoad = [
            { key: 'sakura', src: '/assets/garden/sakura.png' },
            { key: 'jacaranda', src: '/assets/garden/Jacaranda.png' },
            { key: 'maple', src: '/assets/garden/Maple.png' },
            { key: 'pine', src: '/assets/garden/Pine.png' },
            { key: 'sunflower', src: '/assets/garden/sunflower.png' },
            { key: 'tulip', src: '/assets/garden/tulip.png' },
            { key: 'marigold', src: '/assets/garden/Marigold.png' },
            { key: 'snowdrop', src: '/assets/garden/snowdrop.png' },
            { key: 'lily', src: '/assets/garden/lily.png' },
            { key: 'orchid', src: '/assets/garden/orchid.png' },
            { key: 'chrysanthemum', src: '/assets/garden/Chrysanthemum.png' },
            { key: 'snowflower', src: '/assets/garden/flower-snowflower.png' }
        ]

        let loadedCount = 0
        toLoad.forEach(item => {
            const img = new Image()
            img.src = item.src
            img.onload = () => {
                loadedCount++
                if (loadedCount === toLoad.length) setAssetsLoaded(true)
            }
            img.onerror = () => {
                console.error(`Failed to load asset: ${item.key}`)
                loadedCount++
                if (loadedCount === toLoad.length) setAssetsLoaded(true)
            }
            assetsRef.current[item.key] = img
        })
    }, [])

    // --- INITIALIZATION ---
    useEffect(() => {
        const newPlants: Plant[] = []
        const today = new Date().toISOString().split("T")[0]
        let seed = stats.streak + 1

        // Guardian Tree
        let treeType = "sakura"; let treeColor = "#FBCFE8"
        if (visualSeason === 'summer') { treeType = "jacaranda"; treeColor = "#A78BFA" } // Purple Jacaranda
        else if (visualSeason === 'autumn') { treeType = "maple"; treeColor = "#EA580C" } // Orange Maple
        else if (visualSeason === 'winter') { treeType = "pine"; treeColor = "#CBD5E1" }


        newPlants.push({
            x: 0.85, y: 0.82, type: "tree", subtype: treeType, color: treeColor,
            scale: 1.0, growth: 1, delay: 0, swayOffset: 0, swaySpeed: 0.005, seed: 9999
        })

        const completedTasks = tasks.filter((t: any) => t.completedAt && t.completedAt.split("T")[0] === today)
        // Limit to 12 flowers for Zen aesthetic
        const displayTasks = completedTasks.slice(0, 12)

        // --- AMBIENT FLORA (Fix for empty garden) ---
        // Ensure there are always at least 5-8 plants so it doesn't look barren
        const ambientCount = Math.max(0, 5 - displayTasks.length) + 2

        // Helper to add a plant
        const addPlant = (x: number, type: "flower" | "tree", subtype: string, color: string, scaleMod: number, dOffset: number) => {
            const rY = 0.8 + seededRandom(seed + newPlants.length * 11) * 0.08
            newPlants.push({
                x, y: rY,
                type, subtype, color,
                scale: (0.4 + seededRandom(seed + newPlants.length * 99) * 0.25) * scaleMod,
                growth: 0, delay: dOffset, swayOffset: seededRandom(seed) * 10, swaySpeed: 0.015, seed: seed + newPlants.length
            })
        }

        // 1. Task Flowers (The main blooming events)
        displayTasks.forEach((task: any, index: number) => {
            let flowerSubtype = "lily"; let flowerColor = "#F8FAFC"

            if (visualSeason === 'spring') {
                if (task.priority === 'high') { flowerSubtype = "tulip"; flowerColor = "#F43F5E" }
                else { flowerSubtype = "orchid"; flowerColor = "#E879F9" } // Replaced Lily/Snowdrop with Orchid
            }
            else if (visualSeason === 'summer') {
                if (task.priority === 'high') { flowerSubtype = "sunflower"; flowerColor = "#FBBF24" }
                else { flowerSubtype = "lily"; flowerColor = "#F43F5E" } // Replaced Rose with Lily
            }
            else if (visualSeason === 'autumn') {
                if (task.priority === 'high') { flowerSubtype = "chrysanthemum"; flowerColor = "#EA580C" }
                else { flowerSubtype = "marigold"; flowerColor = "#F59E0B" } // Swapped for variety
            }
            else { flowerSubtype = "snowflower"; flowerColor = "#8B5CF6" } // Purple Snowflower (User Request)

            // Distribute across width
            const section = 1 / (displayTasks.length + 1)
            const x = (index + 1) * section + (seededRandom(seed + index) * 0.1 - 0.05)

            addPlant(x, "flower", flowerSubtype, flowerColor, 1.0, index * 100)
        })

        // 2. Ambient Wildflowers (Fillers)
        for (let i = 0; i < ambientCount; i++) {
            // Mix of seasonal flowers
            let available = ['tulip']
            let fallbackCol = "#A78BFA"

            if (visualSeason === 'spring') { available = ['tulip', 'orchid']; fallbackCol = "#F472B6" }
            if (visualSeason === 'summer') { available = ['sunflower', 'lily']; fallbackCol = "#FBBF24" }
            if (visualSeason === 'autumn') { available = ['marigold', 'chrysanthemum']; fallbackCol = "#EA580C" }
            if (visualSeason === 'winter') { available = ['snowflower']; fallbackCol = "#E0F2FE" }

            const type = available[Math.floor(seededRandom(seed + i * 33) * available.length)]

            // Random position
            addPlant(seededRandom(seed + i * 77), "flower", type, fallbackCol, 0.7, 500 + i * 100)
        }

        const completedPomodoros = pomodoros.filter(p => p.completed && p.startTime.split("T")[0] === today)
        // Limit to 3 extra trees to avoid forest clutter
        completedPomodoros.slice(0, 3).forEach((p, index) => {
            // ... existing tree logic
            const x = 0.1 + seededRandom(seed + index + 500) * 0.8
            addPlant(x, "tree", treeType, treeColor, 1.2, 800 + index * 200)
        })

        setPlants(newPlants)
    }, [tasks, pomodoros, season, visualSeason])

    // --- PLANTS REFS (Anti-Flicker) ---
    const plantsRef = useRef<Plant[]>([])

    // Update ref when state changes
    useEffect(() => {
        plantsRef.current = plants
    }, [plants])

    // --- TIME REFS (Anti-Flicker & Responsiveness) ---
    const manualTimeRef = useRef(manualTime)

    // Sync Ref
    useEffect(() => {
        manualTimeRef.current = manualTime
    }, [manualTime])

    // --- RENDER LOOP ---
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current || !assetsLoaded) return
        const canvas = canvasRef.current
        const container = containerRef.current

        // Mutable ref for context to handle resize
        let ctxRef = canvas.getContext("2d")

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === container) {
                    const { width, height } = entry.contentRect
                    const dpr = window.devicePixelRatio || 1
                    canvas.width = width * dpr; canvas.height = height * dpr
                    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
                    // Update ref
                    ctxRef = canvas.getContext('2d'); if (ctxRef) ctxRef.scale(dpr, dpr)
                }
            }
        })
        resizeObserver.observe(container)

        let animationFrameId: number; let time = 0

        const render = () => {
            const ctx = ctxRef
            if (!ctx) { animationFrameId = requestAnimationFrame(render); return }

            time++
            const width = canvas.width / (window.devicePixelRatio || 1)
            const height = canvas.height / (window.devicePixelRatio || 1)
            ctx.clearRect(0, 0, width, height)

            // Current Time Logic (Use Ref for instant update without cycle reset)
            // Current Time Logic
            let timeOfDay = "night"
            const currentManualTime = manualTimeRef.current

            if (currentManualTime !== 'auto') {
                timeOfDay = currentManualTime
            } else {
                const hour = new Date().getHours()
                if (hour >= 6 && hour < 12) timeOfDay = "morning"
                else if (hour >= 12 && hour < 17) timeOfDay = "afternoon"
                else if (hour >= 17 && hour < 20) timeOfDay = "evening"
                else timeOfDay = "night"
            }

            // Re-calc isDark for render loop
            const isNight = timeOfDay === "night"

            // --- 1. UNIQUE SKY GRADIENTS (Weather Aware) ---
            const grad = ctx.createLinearGradient(0, 0, 0, height)
            // Base Colors
            let colors: string[] = ["#0F172A", "#1E293B", "#334155"] // Default to Night

            if (timeOfDay === "night") {
                colors = ["#0F172A", "#1E293B", "#334155"] // Deep Midnight
                if (condition === 'rain') colors = ["#020617", "#1E293B", "#334155"] // Darker Storm
                if (condition === 'snow') colors = ["#1E293B", "#334155", "#475569"] // Snowy Night (Grey-Blue)
                if (condition === 'cloudy') colors = ["#1E293B", "#334155", "#475569"] // Cloudy Night
            }
            else if (timeOfDay === "morning") {
                colors = ["#FEF3C7", "#FDBA74", "#bae6fd"] // Soft Sunrise
                if (condition === 'rain') colors = ["#94A3B8", "#64748B", "#475569"] // Rainy Morning (Grey)
                if (condition === 'snow') colors = ["#E2E8F0", "#CBD5E1", "#94A3B8"] // Snowy Morning (White-Grey)
                if (condition === 'cloudy') colors = ["#E2E8F0", "#CBD5E1", "#94A3B8"] // Cloudy Morning
            }
            else if (timeOfDay === "evening") {
                colors = ["#4C1D95", "#A855F7", "#FB923C"] // Dusk
                if (condition === 'rain') colors = ["#475569", "#64748B", "#94A3B8"] // Rainy Evening (Slate)
                if (condition === 'snow') colors = ["#64748B", "#94A3B8", "#CBD5E1"] // Snowy Evening
                if (condition === 'cloudy') colors = ["#581C87", "#7E22CE", "#C084FC"] // Cloudy Dusk (Muted Purple)
            }
            else { // Afternoon
                if (visualSeason === 'winter') {
                    colors = ["#E2E8F0", "#F8FAFC"]
                } else if (visualSeason === 'autumn') {
                    colors = ["#FFF7ED", "#FDE68A"]
                } else {
                    colors = ["#0EA5E9", "#7DD3FC"] // Crisp Blue
                }

                // Weather Overrides for Afternoon
                if (condition === 'rain') colors = ["#64748B", "#94A3B8"] // Rainy Day
                if (condition === 'snow' && visualSeason !== 'winter') colors = ["#E2E8F0", "#F8FAFC"] // Sudden Snow
                if (condition === 'cloudy') colors = ["#94A3B8", "#CBD5E1"] // Cloudy Day
            }

            // Apply Gradient
            if (colors.length === 2) {
                grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[1])
            } else {
                grad.addColorStop(0, colors[0]); grad.addColorStop(0.5, colors[1]); grad.addColorStop(1, colors[2])
            }

            ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height)

            // --- 2. CELESTIAL BODIES (Unique Positions) ---
            if (condition !== 'rain') {
                // Celestial Positions
                let sunX = 0, sunY = 0
                if (timeOfDay === 'morning') {
                    sunX = width * 0.15; sunY = height * 0.35 // Rising Left
                } else if (timeOfDay === 'afternoon') {
                    sunX = width * 0.7; sunY = height * 0.1 // High Noon
                } else if (timeOfDay === 'evening') {
                    sunX = width * 0.85; sunY = height * 0.4 // Setting Right
                } else {
                    sunX = width * 0.1; sunY = height * 0.15 // Moon Top Left
                }

                ctx.save(); ctx.translate(sunX, sunY)

                if (isNight) {
                    // --- MOON ---
                    const moonSize = width * 0.04
                    // Glow
                    const glow = ctx.createRadialGradient(0, 0, moonSize, 0, 0, moonSize * 6)
                    glow.addColorStop(0, "rgba(255, 255, 255, 0.4)")
                    glow.addColorStop(1, "rgba(255, 255, 255, 0)")
                    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, moonSize * 6, 0, Math.PI * 2); ctx.fill()
                    // Body
                    ctx.beginPath(); ctx.arc(0, 0, moonSize, 0, Math.PI * 2); ctx.fillStyle = "#F8FAFC"; ctx.fill()
                    // Craters
                    ctx.fillStyle = "rgba(203, 213, 225, 0.5)";
                    ctx.beginPath(); ctx.arc(-moonSize * 0.3, -moonSize * 0.2, moonSize * 0.2, 0, Math.PI * 2); ctx.fill()
                    ctx.beginPath(); ctx.arc(moonSize * 0.4, moonSize * 0.1, moonSize * 0.15, 0, Math.PI * 2); ctx.fill()
                } else {
                    // --- SUN ---
                    const sunSize = width * 0.06
                    // God Rays (Only visible in Morning/Afternoon)
                    if (timeOfDay !== 'evening' && visualSeason !== 'winter') {
                        ctx.save(); ctx.rotate(time * 0.002)
                        for (let r = 0; r < 12; r++) {
                            const rayGrad = ctx.createLinearGradient(0, 0, width * 0.8, 0)
                            rayGrad.addColorStop(0, "rgba(255, 255, 255, 0.1)"); rayGrad.addColorStop(1, "rgba(255, 255, 255, 0)")
                            ctx.fillStyle = rayGrad; ctx.beginPath(); ctx.moveTo(0, -width * 0.02); ctx.lineTo(width * 0.8, 0); ctx.lineTo(0, width * 0.02); ctx.fill()
                            ctx.rotate(Math.PI / 6)
                        }
                        ctx.restore()
                    }
                    // Sun Body
                    const sunGrad = ctx.createRadialGradient(-sunSize * 0.3, -sunSize * 0.3, sunSize * 0.1, 0, 0, sunSize)
                    let c1 = "#FEF9C3", c2 = "#FACC15"
                    if (timeOfDay === 'morning') { c1 = "#FEF3C7"; c2 = "#FDBA74" } // Pale Yellow -> Orange
                    if (timeOfDay === 'evening') { c1 = "#FDBA74"; c2 = "#EA580C" } // Orange -> Red
                    sunGrad.addColorStop(0, c1); sunGrad.addColorStop(1, c2)
                    ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(0, 0, sunSize, 0, Math.PI * 2); ctx.fill()
                }
                ctx.restore()
            }

            // --- 3. GROUND COLORS ---
            let backHill = "#D9F99D", frontHill = "#BEF264"

            if (timeOfDay === 'night') {
                backHill = "#064E3B"; frontHill = "#065F46"
            } else if (timeOfDay === 'morning') {
                backHill = "#D4D4D8"; frontHill = "#A1A1AA" // Misty Grey/Green
                if (visualSeason !== 'winter') { backHill = "#BBF7D0"; frontHill = "#86EFAC" } // Fresh Dew Green
            } else if (timeOfDay === 'evening') {
                backHill = "#D97706"; frontHill = "#B45309" // Golden Hour
            }

            // Season Overrides
            if (visualSeason === 'winter') {
                backHill = isNight ? "#334155" : "#CBD5E1"; frontHill = isNight ? "#475569" : "#E2E8F0"
            } else if (visualSeason === 'autumn') {
                if (timeOfDay !== 'night') { backHill = "#FDBA74"; frontHill = "#FB923C" }
            }

            ctx.fillStyle = backHill
            ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(0, height * 0.8)
            ctx.bezierCurveTo(width * 0.4, height * 0.75, width * 0.8, height * 0.82, width, height * 0.78); ctx.lineTo(width, height); ctx.fill()
            ctx.fillStyle = frontHill
            ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(0, height * 0.88);
            ctx.bezierCurveTo(width * 0.3, height * 0.86, width * 0.6, height * 0.9, width, height * 0.86); ctx.lineTo(width, height); ctx.fill()

            // --- PARTICLES & PLANTS ---
            // (Use plantsRef.current to avoid re-render)

            // 1. Particle Gen
            if (Math.random() < 0.05) {
                const trees = plantsRef.current.filter((p: Plant) => p.type === 'tree')
                if (trees.length > 0) {
                    const sourceTree = trees[Math.floor(Math.random() * trees.length)]
                    if (sourceTree.growth > 0.8) {
                        particlesRef.current.push({
                            type: 'leaf', subtype: sourceTree.subtype,
                            x: (sourceTree.x * width) + (Math.random() * 60 - 30) * sourceTree.scale,
                            y: (sourceTree.y * height) - (60 * sourceTree.scale),
                            color: sourceTree.color,
                            size: Math.random() * 4 + 3,
                            rotation: Math.random() * Math.PI,
                            speedX: Math.random() * 0.5 - 0.25, speedY: Math.random() * 0.5 + 0.5,
                            opacity: 1, frameOffset: Math.random() * 100,
                            tumbleSpeed: 0.1 + Math.random() * 0.1, tumbleOffset: Math.random() * Math.PI * 2
                        })
                    }
                }
            }

            // 2. Weather Particles
            if (visualSeason === 'spring' && Math.random() < 0.1) {
                particlesRef.current.push({
                    type: 'leaf', subtype: 'sakura', x: Math.random() * width, y: -10,
                    color: "#FBCFE8", size: Math.random() * 4 + 3, rotation: Math.random() * Math.PI,
                    speedX: Math.random() * 0.5 - 0.25, speedY: Math.random() * 0.5 + 0.5, opacity: 0.9,
                    frameOffset: Math.random() * 100, tumbleSpeed: 0.1, tumbleOffset: Math.random() * 10
                })
            } else if (visualSeason === 'summer' && !isNight && Math.random() < 0.1) {
                // Pollen
                particlesRef.current.push({
                    type: 'pollen', x: Math.random() * width, y: Math.random() * height * 0.5 + height * 0.5,
                    color: "#FDE047", size: Math.random() * 2 + 0.5, rotation: 0,
                    speedX: Math.random() * 0.4 - 0.2, speedY: Math.random() * -0.5 - 0.1, opacity: 0, frameOffset: 0
                })
            }

            // 3. Render Plants (From Ref)
            plantsRef.current.sort((a, b) => a.y - b.y).forEach((plant: Plant) => {
                if (time > plant.delay && plant.growth < 1) plant.growth += 0.01
                if (plant.growth <= 0) return

                const x = plant.x * width; const y = plant.y * height; const s = plant.scale * plant.growth
                const wind = Math.sin(time * plant.swaySpeed + plant.swayOffset) * 0.02

                ctx.save(); ctx.translate(x, y)
                if (visualSeason !== 'winter') {
                    // Stems
                    ctx.strokeStyle = timeOfDay === 'night' ? "#064E3B" : "#15803D"
                    ctx.lineWidth = 1 * s
                    ctx.beginPath(); ctx.moveTo(-2 * s, 0); ctx.quadraticCurveTo(-5 * s, -2 * s, -8 * s, 0); ctx.stroke()
                    ctx.beginPath(); ctx.moveTo(2 * s, 0); ctx.quadraticCurveTo(5 * s, -3 * s, 8 * s, 0); ctx.stroke()
                }

                const img = assetsRef.current[plant.subtype] || assetsRef.current['sakura']
                if (img) {
                    if (plant.type === 'tree') {
                        ctx.rotate(wind * 2); const size = 180 * s
                        try { ctx.drawImage(img, -size / 2, -size, size, size) } catch (e) { }
                    } else {
                        ctx.rotate(wind * 8)
                        const pulse = 1 + Math.sin(time * 0.05 + plant.seed) * 0.05
                        ctx.scale(pulse, pulse)
                        const bob = Math.sin(time * 0.1 + plant.seed) * 2
                        ctx.translate(0, bob)
                        const size = 85 * s
                        try { ctx.drawImage(img, -size / 2, -size, size, size) } catch (e) { }
                    }
                }
                ctx.restore()
            })

            // 4. Update Particles
            // ... (Keep existing particle update logic but minimal)
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i]
                if (p.type === 'leaf' || p.type === 'pollen') {
                    p.x += p.speedX + Math.sin(time * 0.05 + p.y) * 0.5; p.y += p.speedY
                    if (p.y > height + 50 || p.x < -50 || p.x > width + 50 || p.y < -50) {
                        particlesRef.current.splice(i, 1)
                    } else {
                        // Draw
                        ctx.save(); ctx.translate(p.x, p.y);
                        if (p.type === 'leaf') {
                            ctx.rotate(p.rotation); ctx.scale(1, Math.sin(time * (p.tumbleSpeed || 0.1) + (p.tumbleOffset || 0)))
                            ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2); ctx.fill()
                        } else {
                            ctx.globalAlpha = 0.6; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill()
                        }
                        ctx.restore()
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render)
        }
        render()
        return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
    }, [visualSeason, condition, assetsLoaded]) // Removed 'plants' and 'isDark' to prevent flicker

    // Label Logic (Sync with Visuals)
    const hour = new Date().getHours()
    let timeOfDayLabel = "Night"

    if (manualTime !== 'auto') {
        timeOfDayLabel = manualTime.charAt(0).toUpperCase() + manualTime.slice(1)
    } else {
        if (hour >= 6 && hour < 12) timeOfDayLabel = "Morning"
        else if (hour >= 12 && hour < 17) timeOfDayLabel = "Afternoon"
        else if (hour >= 17 && hour < 20) timeOfDayLabel = "Evening"
    }

    return (
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl overflow-hidden h-full flex flex-col relative group">
            <CardHeader className="pb-2 absolute top-0 left-0 z-50 w-full bg-transparent p-6 flex flex-row items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/30 dark:bg-slate-900/30 shadow-sm border border-slate-400/20 backdrop-blur-md">
                        <Icons.tree className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="bg-white/30 dark:bg-slate-900/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-400/10">
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Visual Garden
                        </CardTitle>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium capitalize flex items-center gap-1.5">
                            <span>{visualSeason}</span>
                            <span className="opacity-50">•</span>
                            <span>{timeOfDayLabel}</span>
                            <span className="opacity-50">•</span>
                            <span>{temperature != null ? Math.round(temperature) : '--'}°C</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    {/* Plant Seed Button */}
                    <button
                        onClick={onAddPlant}
                        className="h-9 px-4 rounded-full flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
                        title="Plant a New Task"
                    >
                        <Icons.plus className="w-4 h-4" />
                        <span className="text-sm font-bold hidden sm:inline">Plant Seed</span>
                    </button>

                    {/* Time Selector */}
                    <div className="flex bg-white/80 dark:bg-slate-900/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-md scale-90 sm:scale-100 backdrop-blur-md">
                        {(['auto', 'morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setManualTime(t)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${manualTime === t
                                    ? 'bg-white dark:bg-slate-700 shadow-sm scale-110 ring-1 ring-black/5 dark:ring-white/10'
                                    : 'hover:bg-white/50 dark:hover:bg-slate-800/50 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                                    }`}
                                title={t === 'auto' ? 'Auto Time' : t}
                            >
                                {t === 'auto' && '🤖'}
                                {t === 'morning' && '🌅'}
                                {t === 'afternoon' && '☀️'}
                                {t === 'evening' && '🌆'}
                                {t === 'night' && '🌙'}
                            </button>
                        ))}
                    </div>

                    {/* Season Selector */}
                    <div className="flex bg-white/80 dark:bg-slate-900/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-md scale-90 sm:scale-100 origin-right backdrop-blur-md">
                        {(['spring', 'summer', 'autumn', 'winter'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setManualSeason(s)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${manualSeason === s
                                    ? 'bg-white dark:bg-slate-700 shadow-sm scale-110 ring-1 ring-black/5 dark:ring-white/10'
                                    : 'hover:bg-white/50 dark:hover:bg-slate-800/50 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                                    }`}
                                title={s}
                            >
                                {s === 'spring' && '🌸'}
                                {s === 'summer' && '🌻'}
                                {s === 'autumn' && '🍂'}
                                {s === 'winter' && '❄️'}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <div ref={containerRef} className="w-full h-72 sm:h-96 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-700 flex-1">
                <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
        </Card>
    )
}
