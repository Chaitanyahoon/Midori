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

interface Star { x: number; y: number; size: number; twinkleSpeed: number; twinkleOffset: number; opacity: number }
interface Cloud { x: number; y: number; w: number; h: number; speed: number; opacity: number }
interface Firefly { x: number; y: number; vx: number; vy: number; opacity: number; maxOpacity: number; glowPhase: number; glowSpeed: number }
interface Particle {
    x: number; y: number; color: string; size: number; rotation: number; speedX: number; speedY: number; opacity: number;
    type: "leaf" | "petal" | "snow" | "rain" | "pollen" | "butterfly";
    life: number; maxLife: number;
    vx?: number; vy?: number;
}

export function VisualGarden({ onAddPlant }: { onAddPlant?: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const { tasks, pomodoros, stats } = useData()
    const { theme } = useTheme()
    const { season, weather } = useWeather()
    const { condition, isDay, temperature } = weather

    const [manualSeason, setManualSeason] = useState<"spring" | "summer" | "autumn" | "winter">(season)
    const [manualTime, setManualTime] = useState<"morning" | "afternoon" | "evening" | "night" | "auto">("auto")

    const visualSeason = manualSeason

    const [plants, setPlants] = useState<Plant[]>([])
    const particlesRef = useRef<Particle[]>([])
    const starsRef = useRef<Star[]>([])
    const cloudsRef = useRef<Cloud[]>([])
    const firefliesRef = useRef<Firefly[]>([])

    // --- ASSET PRELOADING ---
    const assetsRef = useRef<Record<string, HTMLImageElement>>({})
    const [assetsLoaded, setAssetsLoaded] = useState(false)

    const seededRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000; return x - Math.floor(x)
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
            img.onload = () => { loadedCount++; if (loadedCount === toLoad.length) setAssetsLoaded(true) }
            img.onerror = () => { loadedCount++; if (loadedCount === toLoad.length) setAssetsLoaded(true) }
            assetsRef.current[item.key] = img
        })
    }, [])

    // --- STAR INITIALIZATION ---
    useEffect(() => {
        starsRef.current = Array.from({ length: 120 }, (_, i) => ({
            x: Math.random(), y: Math.random() * 0.65,
            size: Math.random() * 1.8 + 0.4,
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2,
            opacity: 0.4 + Math.random() * 0.6,
        }))
    }, [])

    // --- CLOUD INITIALIZATION ---
    useEffect(() => {
        cloudsRef.current = Array.from({ length: 6 }, (_, i) => ({
            x: Math.random(),
            y: 0.05 + Math.random() * 0.25,
            w: 0.12 + Math.random() * 0.18,
            h: 0.04 + Math.random() * 0.06,
            speed: 0.00004 + Math.random() * 0.00006,
            opacity: 0.55 + Math.random() * 0.35,
        }))
    }, [])

    // --- FIREFLY INITIALIZATION ---
    useEffect(() => {
        firefliesRef.current = Array.from({ length: 28 }, () => ({
            x: 0.1 + Math.random() * 0.8,
            y: 0.4 + Math.random() * 0.45,
            vx: (Math.random() - 0.5) * 0.0008,
            vy: (Math.random() - 0.5) * 0.0004,
            opacity: 0,
            maxOpacity: 0.5 + Math.random() * 0.5,
            glowPhase: Math.random() * Math.PI * 2,
            glowSpeed: 0.02 + Math.random() * 0.04,
        }))
    }, [])

    // --- PLANT INITIALIZATION ---
    useEffect(() => {
        const newPlants: Plant[] = []
        const today = new Date().toISOString().split("T")[0]
        let seed = stats.streak + 1

        let treeType = "sakura"; let treeColor = "#FBCFE8"
        if (visualSeason === 'summer') { treeType = "jacaranda"; treeColor = "#A78BFA" }
        else if (visualSeason === 'autumn') { treeType = "maple"; treeColor = "#EA580C" }
        else if (visualSeason === 'winter') { treeType = "pine"; treeColor = "#CBD5E1" }

        newPlants.push({
            x: 0.85, y: 0.82, type: "tree", subtype: treeType, color: treeColor,
            scale: 1.0, growth: 1, delay: 0, swayOffset: 0, swaySpeed: 0.005, seed: 9999
        })

        const completedTasks = tasks.filter((t: any) => t.completedAt && t.completedAt.split("T")[0] === today)
        const displayTasks = completedTasks.slice(0, 12)
        const ambientCount = Math.max(0, 5 - displayTasks.length) + 2

        const addPlant = (x: number, type: "flower" | "tree", subtype: string, color: string, scaleMod: number, dOffset: number) => {
            const rY = 0.8 + seededRandom(seed + newPlants.length * 11) * 0.08
            newPlants.push({
                x, y: rY, type, subtype, color,
                scale: (0.4 + seededRandom(seed + newPlants.length * 99) * 0.25) * scaleMod,
                growth: 0, delay: dOffset, swayOffset: seededRandom(seed) * 10, swaySpeed: 0.015, seed: seed + newPlants.length
            })
        }

        displayTasks.forEach((task: any, index: number) => {
            let flowerSubtype = "lily"; let flowerColor = "#F8FAFC"
            if (visualSeason === 'spring') {
                flowerSubtype = task.priority === 'high' ? "tulip" : "orchid"
                flowerColor = task.priority === 'high' ? "#F43F5E" : "#E879F9"
            } else if (visualSeason === 'summer') {
                flowerSubtype = task.priority === 'high' ? "sunflower" : "lily"
                flowerColor = task.priority === 'high' ? "#FBBF24" : "#F43F5E"
            } else if (visualSeason === 'autumn') {
                flowerSubtype = task.priority === 'high' ? "chrysanthemum" : "marigold"
                flowerColor = task.priority === 'high' ? "#EA580C" : "#F59E0B"
            } else { flowerSubtype = "snowflower"; flowerColor = "#8B5CF6" }

            const section = 1 / (displayTasks.length + 1)
            const x = (index + 1) * section + (seededRandom(seed + index) * 0.1 - 0.05)
            addPlant(x, "flower", flowerSubtype, flowerColor, 1.0, index * 100)
        })

        for (let i = 0; i < ambientCount; i++) {
            let available = ['tulip']; let fallbackCol = "#A78BFA"
            if (visualSeason === 'spring') { available = ['tulip', 'orchid']; fallbackCol = "#F472B6" }
            if (visualSeason === 'summer') { available = ['sunflower', 'lily']; fallbackCol = "#FBBF24" }
            if (visualSeason === 'autumn') { available = ['marigold', 'chrysanthemum']; fallbackCol = "#EA580C" }
            if (visualSeason === 'winter') { available = ['snowflower']; fallbackCol = "#E0F2FE" }
            const type = available[Math.floor(seededRandom(seed + i * 33) * available.length)]
            addPlant(seededRandom(seed + i * 77), "flower", type, fallbackCol, 0.7, 500 + i * 100)
        }

        const completedPomodoros = pomodoros.filter(p => p.completed && p.startTime.split("T")[0] === today)
        completedPomodoros.slice(0, 3).forEach((p, index) => {
            const x = 0.1 + seededRandom(seed + index + 500) * 0.8
            addPlant(x, "tree", treeType, treeColor, 1.2, 800 + index * 200)
        })

        newPlants.sort((a, b) => a.y - b.y)
        setPlants(newPlants)
    }, [tasks, pomodoros, season, visualSeason])

    const plantsRef = useRef<Plant[]>([])
    useEffect(() => { plantsRef.current = plants }, [plants])

    const manualTimeRef = useRef(manualTime)
    useEffect(() => { manualTimeRef.current = manualTime }, [manualTime])

    // Helper: draw a fluffy cloud puff at (cx, cy) with radius r
    const drawCloud = (ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, opacity: number, isDark: boolean) => {
        ctx.save()
        ctx.globalAlpha = opacity
        const base = isDark ? "#2D3748" : "#FFFFFF"
        const shadow = isDark ? "#1A202C" : "#EDF2F7"
        const gradient = ctx.createRadialGradient(cx, cy - h * 0.2, h * 0.1, cx, cy, w * 0.5)
        gradient.addColorStop(0, base)
        gradient.addColorStop(1, shadow)
        ctx.fillStyle = gradient

        // Draw overlapping ellipses for puffy cloud shape
        const drawPuff = (x: number, y: number, rx: number, ry: number) => {
            ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
        }
        drawPuff(cx, cy, w * 0.4, h * 0.55)
        drawPuff(cx - w * 0.28, cy + h * 0.12, w * 0.3, h * 0.42)
        drawPuff(cx + w * 0.28, cy + h * 0.12, w * 0.3, h * 0.42)
        drawPuff(cx - w * 0.14, cy - h * 0.15, w * 0.28, h * 0.48)
        drawPuff(cx + w * 0.14, cy - h * 0.08, w * 0.25, h * 0.44)
        ctx.restore()
    }

    // --- RENDER LOOP ---
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current || !assetsLoaded) return
        const canvas = canvasRef.current
        const container = containerRef.current
        let ctxRef = canvas.getContext("2d")

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === container) {
                    const { width, height } = entry.contentRect
                    const dpr = window.devicePixelRatio || 1
                    canvas.width = width * dpr; canvas.height = height * dpr
                    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
                    ctxRef = canvas.getContext('2d')
                    if (ctxRef) ctxRef.scale(dpr, dpr)
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

            // --- RESOLVE TIME OF DAY ---
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
            const isNight = timeOfDay === "night"
            const isEvening = timeOfDay === "evening"
            const isMorning = timeOfDay === "morning"
            const showNightElements = isNight || isEvening
            const showDayElements = timeOfDay === "morning" || timeOfDay === "afternoon"
            const vs = visualSeason

            // ═══════════════════════════════════════════
            // 1. SKY GRADIENT
            // ═══════════════════════════════════════════
            const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.75)

            if (timeOfDay === "night") {
                if (vs === "winter") {
                    skyGrad.addColorStop(0, "#0A0E1A"); skyGrad.addColorStop(0.5, "#111827"); skyGrad.addColorStop(1, "#1F2937")
                } else if (vs === "autumn") {
                    skyGrad.addColorStop(0, "#0C0A1A"); skyGrad.addColorStop(0.5, "#1A0F2E"); skyGrad.addColorStop(1, "#2D1B4E")
                } else {
                    skyGrad.addColorStop(0, "#060818"); skyGrad.addColorStop(0.4, "#0D1B3E"); skyGrad.addColorStop(1, "#1A2744")
                }
            } else if (timeOfDay === "morning") {
                if (vs === "winter") {
                    skyGrad.addColorStop(0, "#7B94B5"); skyGrad.addColorStop(0.5, "#A3B9C9"); skyGrad.addColorStop(1, "#D4E2EA")
                } else if (vs === "autumn") {
                    skyGrad.addColorStop(0, "#C25B3F"); skyGrad.addColorStop(0.4, "#E8885A"); skyGrad.addColorStop(1, "#F7C59F")
                } else if (vs === "summer") {
                    skyGrad.addColorStop(0, "#F97316"); skyGrad.addColorStop(0.4, "#FDBA74"); skyGrad.addColorStop(1, "#FEF3C7")
                } else {
                    // spring
                    skyGrad.addColorStop(0, "#F9A8D4"); skyGrad.addColorStop(0.4, "#FCD5CE"); skyGrad.addColorStop(1, "#FEF9C3")
                }
            } else if (timeOfDay === "afternoon") {
                if (vs === "winter") {
                    skyGrad.addColorStop(0, "#94A3B8"); skyGrad.addColorStop(1, "#E2E8F0")
                } else if (vs === "autumn") {
                    skyGrad.addColorStop(0, "#2563EB"); skyGrad.addColorStop(0.5, "#60A5FA"); skyGrad.addColorStop(1, "#BFDBFE")
                } else if (vs === "summer") {
                    skyGrad.addColorStop(0, "#0369A1"); skyGrad.addColorStop(0.5, "#0EA5E9"); skyGrad.addColorStop(1, "#BAE6FD")
                } else {
                    // spring
                    skyGrad.addColorStop(0, "#4F46E5"); skyGrad.addColorStop(0.5, "#818CF8"); skyGrad.addColorStop(1, "#E0E7FF")
                }
            } else {
                // evening
                if (vs === "winter") {
                    skyGrad.addColorStop(0, "#1E1B4B"); skyGrad.addColorStop(0.5, "#4C1D95"); skyGrad.addColorStop(1, "#7C3AED")
                } else if (vs === "autumn") {
                    skyGrad.addColorStop(0, "#7C2D12"); skyGrad.addColorStop(0.4, "#C2410C"); skyGrad.addColorStop(1, "#FB923C")
                } else if (vs === "summer") {
                    skyGrad.addColorStop(0, "#831843"); skyGrad.addColorStop(0.4, "#DB2777"); skyGrad.addColorStop(1, "#F9A8D4")
                } else {
                    // spring evening
                    skyGrad.addColorStop(0, "#312E81"); skyGrad.addColorStop(0.4, "#7C3AED"); skyGrad.addColorStop(1, "#F472B6")
                }
            }
            ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, width, height * 0.75)

            // ═══════════════════════════════════════════
            // 2. STARS (night + evening)
            // ═══════════════════════════════════════════
            if (showNightElements) {
                const starAlpha = isNight ? 1.0 : 0.4
                starsRef.current.forEach(star => {
                    const tw = Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
                    const alpha = starAlpha * star.opacity * (0.6 + 0.4 * tw)
                    ctx.save()
                    ctx.globalAlpha = Math.max(0, alpha)
                    // Draw 4-pointed cross star
                    const sx = star.x * width; const sy = star.y * height * 0.7
                    const r = star.size
                    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4)
                    glow.addColorStop(0, star.size > 1.4 ? "rgba(200,220,255,0.9)" : "rgba(255,255,255,0.8)")
                    glow.addColorStop(1, "rgba(200,220,255,0)")
                    ctx.fillStyle = glow
                    ctx.beginPath(); ctx.arc(sx, sy, r * 4, 0, Math.PI * 2); ctx.fill()
                    ctx.fillStyle = "white"
                    ctx.beginPath(); ctx.arc(sx, sy, r * 0.7, 0, Math.PI * 2); ctx.fill()
                    if (star.size > 1.3) {
                        // Cross sparkle
                        ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 0.5
                        ctx.beginPath(); ctx.moveTo(sx - r * 3, sy); ctx.lineTo(sx + r * 3, sy)
                        ctx.moveTo(sx, sy - r * 3); ctx.lineTo(sx, sy + r * 3); ctx.stroke()
                    }
                    ctx.restore()
                })
            }

            // ═══════════════════════════════════════════
            // 3. CELESTIAL — SUN / MOON
            // ═══════════════════════════════════════════
            let celX = 0, celY = 0
            if (isMorning) { celX = width * 0.22; celY = height * 0.35 }
            else if (timeOfDay === "afternoon") { celX = width * 0.6; celY = height * 0.12 }
            else if (isEvening) { celX = width * 0.82; celY = height * 0.42 }
            else { celX = width * 0.5; celY = height * 0.18 }

            ctx.save(); ctx.translate(celX, celY)

            if (isNight) {
                // — MOON —
                const moonSize = Math.min(width, height) * 0.05
                // Halo
                const halo = ctx.createRadialGradient(0, 0, moonSize, 0, 0, moonSize * 7)
                halo.addColorStop(0, "rgba(200,220,255,0.25)")
                halo.addColorStop(0.5, "rgba(150,180,255,0.08)")
                halo.addColorStop(1, "rgba(150,180,255,0)")
                ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, moonSize * 7, 0, Math.PI * 2); ctx.fill()
                // Body
                const moonGrad = ctx.createRadialGradient(-moonSize * 0.25, -moonSize * 0.25, 0, 0, 0, moonSize)
                moonGrad.addColorStop(0, "#F8FAFC"); moonGrad.addColorStop(1, "#C8D6E5")
                ctx.fillStyle = moonGrad; ctx.beginPath(); ctx.arc(0, 0, moonSize, 0, Math.PI * 2); ctx.fill()
                // Crescent shadow (bite-out)
                ctx.globalCompositeOperation = "destination-out"
                ctx.fillStyle = "rgba(0,0,0,0.6)"
                ctx.beginPath(); ctx.arc(moonSize * 0.45, -moonSize * 0.1, moonSize * 0.82, 0, Math.PI * 2); ctx.fill()
                ctx.globalCompositeOperation = "source-over"
                // Craters
                ctx.globalAlpha = 0.3; ctx.fillStyle = "#94A3B8"
                ctx.beginPath(); ctx.arc(-moonSize * 0.35, -moonSize * 0.25, moonSize * 0.18, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(-moonSize * 0.1, moonSize * 0.3, moonSize * 0.12, 0, Math.PI * 2); ctx.fill()
                ctx.beginPath(); ctx.arc(-moonSize * 0.5, moonSize * 0.1, moonSize * 0.08, 0, Math.PI * 2); ctx.fill()
            } else {
                // — SUN —
                const sunSize = Math.min(width, height) * (isEvening ? 0.065 : 0.055)
                // God rays (morning & afternoon, not evening)
                if (!isEvening && vs !== "winter") {
                    ctx.save(); ctx.rotate(time * 0.003)
                    for (let r = 0; r < 16; r++) {
                        const rayLen = width * (isMorning ? 0.55 : 0.7)
                        const rayGrad = ctx.createLinearGradient(0, 0, rayLen, 0)
                        const rayAlpha = isMorning ? 0.08 : 0.05
                        rayGrad.addColorStop(0, `rgba(255,230,100,${rayAlpha})`)
                        rayGrad.addColorStop(1, "rgba(255,230,100,0)")
                        ctx.fillStyle = rayGrad; ctx.beginPath()
                        ctx.moveTo(0, -sunSize * 0.4); ctx.lineTo(rayLen, 0); ctx.lineTo(0, sunSize * 0.4); ctx.fill()
                        ctx.rotate(Math.PI / 8)
                    }
                    ctx.restore()
                }
                // Outer glow
                const outerGlow = ctx.createRadialGradient(0, 0, sunSize * 0.8, 0, 0, sunSize * 3.5)
                if (isEvening) {
                    outerGlow.addColorStop(0, "rgba(251,146,60,0.5)"); outerGlow.addColorStop(1, "rgba(239,68,68,0)")
                } else if (isMorning) {
                    outerGlow.addColorStop(0, "rgba(253,186,116,0.4)"); outerGlow.addColorStop(1, "rgba(253,186,116,0)")
                } else {
                    outerGlow.addColorStop(0, "rgba(250,204,21,0.3)"); outerGlow.addColorStop(1, "rgba(250,204,21,0)")
                }
                ctx.fillStyle = outerGlow; ctx.beginPath(); ctx.arc(0, 0, sunSize * 3.5, 0, Math.PI * 2); ctx.fill()
                // Body
                const sunGrad = ctx.createRadialGradient(-sunSize * 0.3, -sunSize * 0.3, 0, 0, 0, sunSize)
                if (isEvening) {
                    sunGrad.addColorStop(0, "#FECACA"); sunGrad.addColorStop(1, "#DC2626")
                } else if (isMorning) {
                    sunGrad.addColorStop(0, "#FEF9C3"); sunGrad.addColorStop(1, "#FDBA74")
                } else {
                    sunGrad.addColorStop(0, "#FEF9C3"); sunGrad.addColorStop(1, "#EAB308")
                }
                ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(0, 0, sunSize, 0, Math.PI * 2); ctx.fill()
            }
            ctx.restore()

            // ═══════════════════════════════════════════
            // 4. HORIZON GLOW (morning & evening)
            // ═══════════════════════════════════════════
            if (isMorning || isEvening) {
                const hgY = height * 0.55
                const hGlow = ctx.createRadialGradient(celX, hgY, 10, celX, hgY, width * 0.55)
                if (isEvening) {
                    hGlow.addColorStop(0, vs === "autumn" ? "rgba(251,146,60,0.55)" : "rgba(244,114,182,0.5)")
                    hGlow.addColorStop(1, "rgba(0,0,0,0)")
                } else {
                    hGlow.addColorStop(0, vs === "spring" ? "rgba(253,186,116,0.45)" : "rgba(253,186,116,0.5)")
                    hGlow.addColorStop(1, "rgba(0,0,0,0)")
                }
                ctx.fillStyle = hGlow; ctx.fillRect(0, 0, width, height * 0.75)
            }

            // ═══════════════════════════════════════════
            // 5. CLOUDS (day & morning)
            // ═══════════════════════════════════════════
            if (!isNight || vs === "winter") {
                const cloudAlpha = isEvening ? 0.35 : (isMorning ? 0.65 : 0.75)
                const cloudDark = isNight || isEvening
                cloudsRef.current.forEach(cloud => {
                    cloud.x += cloud.speed
                    if (cloud.x > 1.2) cloud.x = -cloud.w
                    drawCloud(ctx, cloud.x * width, cloud.y * height, cloud.w * width, cloud.h * height, cloud.opacity * cloudAlpha, cloudDark)
                })
            }

            // ═══════════════════════════════════════════
            // 6. LAYERED GROUND
            // ═══════════════════════════════════════════
            // Far hill (back)
            let farGround = "#BBF7D0", midGround = "#86EFAC", frontGround = "#4ADE80"

            if (timeOfDay === "night") {
                farGround = "#052E16"; midGround = "#064E3B"; frontGround = "#065F46"
                if (vs === "winter") { farGround = "#1E3A5F"; midGround = "#1E293B"; frontGround = "#334155" }
                if (vs === "autumn") { farGround = "#1C1007"; midGround = "#2C1A07"; frontGround = "#3D2309" }
            } else if (timeOfDay === "morning") {
                farGround = "#D1FAE5"; midGround = "#A7F3D0"; frontGround = "#6EE7B7"
                if (vs === "winter") { farGround = "#CBD5E1"; midGround = "#94A3B8"; frontGround = "#64748B" }
                if (vs === "autumn") { farGround = "#FDE68A"; midGround = "#FCD34D"; frontGround = "#F59E0B" }
                if (vs === "summer") { farGround = "#BBF7D0"; midGround = "#86EFAC"; frontGround = "#4ADE80" }
            } else if (timeOfDay === "afternoon") {
                farGround = "#DCFCE7"; midGround = "#BBF7D0"; frontGround = "#86EFAC"
                if (vs === "winter") { farGround = "#E2E8F0"; midGround = "#CBD5E1"; frontGround = "#94A3B8" }
                if (vs === "autumn") { farGround = "#FEF3C7"; midGround = "#FDE68A"; frontGround = "#FBBF24" }
                if (vs === "summer") { farGround = "#D1FAE5"; midGround = "#A7F3D0"; frontGround = "#34D399" }
            } else {
                // evening
                farGround = "#14532D"; midGround = "#166534"; frontGround = "#15803D"
                if (vs === "winter") { farGround = "#334155"; midGround = "#1E293B"; frontGround = "#0F172A" }
                if (vs === "autumn") { farGround = "#7C2D12"; midGround = "#9A3412"; frontGround = "#B45309" }
                if (vs === "summer") { farGround = "#14532D"; midGround = "#15803D"; frontGround = "#16A34A" }
            }

            // Far hill
            ctx.fillStyle = farGround
            ctx.beginPath(); ctx.moveTo(0, height)
            ctx.lineTo(0, height * 0.7)
            ctx.bezierCurveTo(width * 0.25, height * 0.58, width * 0.55, height * 0.72, width * 0.75, height * 0.66)
            ctx.bezierCurveTo(width * 0.9, height * 0.62, width, height * 0.68, width, height * 0.65)
            ctx.lineTo(width, height); ctx.closePath(); ctx.fill()

            // Mid hill
            ctx.fillStyle = midGround
            ctx.beginPath(); ctx.moveTo(0, height)
            ctx.lineTo(0, height * 0.79)
            ctx.bezierCurveTo(width * 0.2, height * 0.76, width * 0.45, height * 0.82, width * 0.65, height * 0.77)
            ctx.bezierCurveTo(width * 0.82, height * 0.73, width, height * 0.79, width, height * 0.77)
            ctx.lineTo(width, height); ctx.closePath(); ctx.fill()

            // Front ground
            ctx.fillStyle = frontGround
            ctx.beginPath(); ctx.moveTo(0, height)
            ctx.lineTo(0, height * 0.88)
            ctx.bezierCurveTo(width * 0.3, height * 0.86, width * 0.65, height * 0.9, width, height * 0.87)
            ctx.lineTo(width, height); ctx.closePath(); ctx.fill()

            // ═══════════════════════════════════════════
            // 7. MORNING MIST
            // ═══════════════════════════════════════════
            if (isMorning) {
                for (let layer = 0; layer < 3; layer++) {
                    const mistY = height * (0.72 + layer * 0.06)
                    const mistGrad = ctx.createLinearGradient(0, mistY - height * 0.06, 0, mistY + height * 0.04)
                    const mistAlpha = 0.2 - layer * 0.05
                    mistGrad.addColorStop(0, "rgba(255,255,255,0)")
                    mistGrad.addColorStop(0.5, `rgba(255,255,255,${mistAlpha})`)
                    mistGrad.addColorStop(1, "rgba(255,255,255,0)")
                    ctx.fillStyle = mistGrad
                    // Wavy mist
                    ctx.beginPath()
                    ctx.moveTo(0, mistY)
                    for (let mx = 0; mx <= width; mx += 20) {
                        const wave = Math.sin(mx * 0.015 + time * 0.008 + layer * 1.2) * height * 0.012
                        ctx.lineTo(mx, mistY + wave)
                    }
                    ctx.lineTo(width, mistY + height * 0.06)
                    ctx.lineTo(0, mistY + height * 0.06)
                    ctx.closePath(); ctx.fill()
                }
            }

            // ═══════════════════════════════════════════
            // 8. WINTER SNOW ACCUMULATION ON GROUND
            // ═══════════════════════════════════════════
            if (vs === "winter") {
                const snowGrad = ctx.createLinearGradient(0, height * 0.83, 0, height)
                snowGrad.addColorStop(0, isNight ? "rgba(200,220,255,0.3)" : "rgba(248,250,252,0.7)")
                snowGrad.addColorStop(1, isNight ? "rgba(200,220,255,0.15)" : "rgba(241,245,249,0.5)")
                ctx.fillStyle = snowGrad
                ctx.beginPath(); ctx.moveTo(0, height)
                ctx.lineTo(0, height * 0.88)
                ctx.bezierCurveTo(width * 0.2, height * 0.86, width * 0.6, height * 0.89, width, height * 0.87)
                ctx.lineTo(width, height); ctx.closePath(); ctx.fill()
            }

            // ═══════════════════════════════════════════
            // 9. PLANTS (grow + sway)
            // ═══════════════════════════════════════════
            plantsRef.current.forEach((plant: Plant) => {
                if (time > plant.delay && plant.growth < 1) plant.growth += 0.008
                if (plant.growth <= 0) return

                const x = plant.x * width; const y = plant.y * height; const s = plant.scale * plant.growth
                const windBase = Math.sin(time * 0.008) * 0.015
                const wind = windBase + Math.sin(time * plant.swaySpeed + plant.swayOffset) * 0.02

                ctx.save(); ctx.translate(x, y)

                // Night tint on plants
                if (isNight) {
                    ctx.filter = "brightness(0.35) saturate(0.7)"
                } else if (isEvening) {
                    ctx.filter = "brightness(0.75) saturate(1.2)"
                } else if (isMorning) {
                    ctx.filter = "brightness(0.9) saturate(0.85)"
                }

                // Stems
                if (vs !== "winter" && plant.type === "flower") {
                    ctx.save(); ctx.filter = "none"
                    ctx.strokeStyle = isNight ? "#064E3B" : "#15803D"
                    ctx.lineWidth = 1.5 * s
                    ctx.beginPath(); ctx.moveTo(-2 * s, 0); ctx.quadraticCurveTo(-5 * s, -3 * s, -8 * s, 0); ctx.stroke()
                    ctx.beginPath(); ctx.moveTo(2 * s, 0); ctx.quadraticCurveTo(5 * s, -4 * s, 8 * s, 0); ctx.stroke()
                    ctx.restore()
                }

                const img = assetsRef.current[plant.subtype] || assetsRef.current['sakura']
                if (img) {
                    if (plant.type === 'tree') {
                        ctx.rotate(wind * 2); const size = 180 * s
                        try { ctx.drawImage(img, -size / 2, -size, size, size) } catch (e) { }
                    } else {
                        ctx.rotate(wind * 8)
                        const pulse = 1 + Math.sin(time * 0.05 + plant.seed) * 0.04
                        ctx.scale(pulse, pulse)
                        const bob = Math.sin(time * 0.1 + plant.seed) * 2
                        ctx.translate(0, bob)
                        const size = 85 * s
                        try { ctx.drawImage(img, -size / 2, -size, size, size) } catch (e) { }

                        // Night glow on flowers
                        if (isNight) {
                            ctx.filter = "none"; ctx.globalAlpha = 0.25
                            const fGlow = ctx.createRadialGradient(0, -size * 0.5, 0, 0, -size * 0.5, size * 0.6)
                            fGlow.addColorStop(0, plant.color); fGlow.addColorStop(1, "transparent")
                            ctx.fillStyle = fGlow; ctx.beginPath(); ctx.arc(0, -size * 0.5, size * 0.6, 0, Math.PI * 2); ctx.fill()
                        }
                    }
                }
                ctx.restore()
            })

            // ═══════════════════════════════════════════
            // 10. PARTICLES — SEASON + WEATHER
            // ═══════════════════════════════════════════

            // Spawn particles
            const spawnChance = Math.random()

            // Spring: cherry blossom petals
            if (vs === "spring" && spawnChance < 0.18) {
                particlesRef.current.push({
                    type: "petal", x: Math.random() * width * 1.1, y: -15,
                    color: ["#FBCFE8", "#F9A8D4", "#FDE68A", "#E879F9"][Math.floor(Math.random() * 4)],
                    size: Math.random() * 5 + 3,
                    rotation: Math.random() * Math.PI * 2,
                    speedX: (Math.random() - 0.4) * 0.8, speedY: Math.random() * 0.6 + 0.4,
                    opacity: 0.7 + Math.random() * 0.3, life: 0, maxLife: 999
                })
            }
            // Autumn: falling leaves
            if (vs === "autumn" && spawnChance < 0.15) {
                particlesRef.current.push({
                    type: "leaf", x: Math.random() * width * 1.1, y: -15,
                    color: ["#EA580C", "#F59E0B", "#DC2626", "#D97706", "#B45309"][Math.floor(Math.random() * 5)],
                    size: Math.random() * 7 + 4,
                    rotation: Math.random() * Math.PI * 2,
                    speedX: (Math.random() - 0.4) * 1.2, speedY: Math.random() * 0.8 + 0.5,
                    opacity: 0.8 + Math.random() * 0.2, life: 0, maxLife: 999
                })
            }
            // Winter: snowflakes
            if (vs === "winter" && spawnChance < 0.3) {
                particlesRef.current.push({
                    type: "snow", x: Math.random() * width, y: -10,
                    color: "#F0F9FF", size: Math.random() * 4 + 1,
                    rotation: 0, speedX: (Math.random() - 0.5) * 0.6, speedY: Math.random() * 0.8 + 0.4,
                    opacity: 0.6 + Math.random() * 0.4, life: 0, maxLife: 999
                })
            }
            // Summer: pollen
            if (vs === "summer" && !isNight && spawnChance < 0.12) {
                particlesRef.current.push({
                    type: "pollen", x: Math.random() * width, y: height * 0.5 + Math.random() * height * 0.4,
                    color: "#FDE047", size: Math.random() * 2.5 + 0.5,
                    rotation: 0, speedX: (Math.random() - 0.5) * 0.4, speedY: -Math.random() * 0.5 - 0.1,
                    opacity: 0, life: 0, maxLife: 200
                })
            }

            // Update & draw particles
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i]
                p.life++

                // Movement
                const drift = Math.sin(time * 0.03 + p.y * 0.01) * 0.3
                p.x += p.speedX + drift
                p.y += p.speedY
                p.rotation += 0.02

                // Fade pollen in/out
                if (p.type === "pollen") {
                    p.opacity = p.life < 30 ? p.life / 30 : (p.life > 170 ? (200 - p.life) / 30 : 0.6)
                }

                // Remove out of bounds
                if (p.y > height + 30 || p.x < -50 || p.x > width + 50 || p.life > p.maxLife) {
                    particlesRef.current.splice(i, 1); continue
                }

                // Draw
                ctx.save(); ctx.translate(p.x, p.y)
                ctx.globalAlpha = Math.max(0, p.opacity)

                if (p.type === "snow") {
                    // Snowflake
                    ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.3
                    for (let arm = 0; arm < 6; arm++) {
                        ctx.save(); ctx.rotate(arm * Math.PI / 3)
                        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p.size * 2); ctx.stroke()
                        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(-p.size * 0.5, -p.size * 0.6); ctx.stroke()
                        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.5, -p.size * 0.6); ctx.stroke()
                        ctx.restore()
                    }
                } else if (p.type === "pollen") {
                    const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2)
                    pg.addColorStop(0, "rgba(253,224,71,0.9)"); pg.addColorStop(1, "rgba(253,224,71,0)")
                    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2); ctx.fill()
                } else {
                    // Leaf / petal — ellipse rotated
                    ctx.rotate(p.rotation + Math.sin(time * 0.05) * 0.3)
                    ctx.scale(1, Math.abs(Math.sin(time * 0.04 + p.y * 0.05)) * 0.6 + 0.4)
                    ctx.fillStyle = p.color
                    ctx.beginPath()
                    ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2)
                    ctx.fill()
                    // Vein
                    if (p.type === "leaf") {
                        ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 0.5
                        ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0); ctx.stroke()
                    }
                }
                ctx.restore()
            }
            // Cap particle count
            if (particlesRef.current.length > 180) particlesRef.current.splice(0, 30)

            // ═══════════════════════════════════════════
            // 11. FIREFLIES (evening + night)
            // ═══════════════════════════════════════════
            if (showNightElements) {
                const ffAlpha = isNight ? 1.0 : 0.55
                firefliesRef.current.forEach(ff => {
                    // Wander
                    ff.vx += (Math.random() - 0.5) * 0.00015
                    ff.vy += (Math.random() - 0.5) * 0.00008
                    ff.vx = Math.max(-0.0015, Math.min(0.0015, ff.vx))
                    ff.vy = Math.max(-0.001, Math.min(0.001, ff.vy))
                    ff.x += ff.vx; ff.y += ff.vy
                    // Wrap
                    if (ff.x < 0.05) ff.x = 0.95
                    if (ff.x > 0.95) ff.x = 0.05
                    if (ff.y < 0.35) ff.y = 0.35
                    if (ff.y > 0.93) ff.y = 0.93
                    // Glow pulse
                    ff.glowPhase += ff.glowSpeed
                    const pulse = (Math.sin(ff.glowPhase) + 1) / 2
                    const alpha = ffAlpha * ff.maxOpacity * pulse

                    if (alpha < 0.05) return
                    const fx = ff.x * width; const fy = ff.y * height
                    ctx.save()
                    // Outer halo
                    const halo = ctx.createRadialGradient(fx, fy, 0, fx, fy, 14)
                    halo.addColorStop(0, `rgba(167,243,208,${alpha * 0.5})`)
                    halo.addColorStop(1, "rgba(167,243,208,0)")
                    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(fx, fy, 14, 0, Math.PI * 2); ctx.fill()
                    // Core
                    ctx.globalAlpha = alpha
                    ctx.fillStyle = "#D1FAE5"
                    ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill()
                    ctx.restore()
                })
            }

            animationFrameId = requestAnimationFrame(render)
        }

        render()
        return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
    }, [visualSeason, condition, assetsLoaded])

    // Label Logic
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
            <CardHeader className="pb-2 absolute top-0 left-0 z-10 w-full bg-transparent p-4 sm:p-6 flex flex-row items-center justify-between pointer-events-none">
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

                <div className="flex gap-2 flex-wrap justify-end pointer-events-auto">
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
                    <div className="flex bg-white/80 dark:bg-slate-900/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-md backdrop-blur-md">
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
                    <div className="flex bg-white/80 dark:bg-slate-900/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-md backdrop-blur-md">
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
