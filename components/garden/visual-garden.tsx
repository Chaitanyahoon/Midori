"use client"
import { useEffect, useRef, useState } from "react"
import { useData } from "@/components/local-data-provider"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useTheme } from "next-themes"
import { useWeather } from "@/hooks/use-weather"

interface Plant { x: number; y: number; type: "flower" | "tree"; subtype: string; color: string; scale: number; growth: number; delay: number; swayOffset: number; swaySpeed: number; seed: number }
interface Star { x: number; y: number; size: number; ts: number; to: number }
interface Cloud { x: number; y: number; w: number; h: number; spd: number; op: number }
interface Firefly { x: number; y: number; vx: number; vy: number; phase: number; spd: number; maxOp: number }
interface Bird { x: number; y: number; spd: number; flap: number; flapSpd: number; scale: number }
interface Particle { x: number; y: number; vx: number; vy: number; rot: number; size: number; color: string; op: number; type: string; life: number }
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; trail: number }

export function VisualGarden({ onAddPlant }: { onAddPlant?: () => void }) {
    const cvs = useRef<HTMLCanvasElement>(null)
    const cont = useRef<HTMLDivElement>(null)
    const { tasks, pomodoros, stats } = useData()
    const { theme } = useTheme()
    const { season, weather } = useWeather()
    const { condition, isDay, temperature } = weather

    const [mSeason, setMSeason] = useState<"spring" | "summer" | "autumn" | "winter">(season)
    const [mTime, setMTime] = useState<"morning" | "afternoon" | "evening" | "night" | "auto">("auto")
    const [plants, setPlants] = useState<Plant[]>([])

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
        let tt = "sakura", tc = "#FBCFE8"
        if (mSeason === 'summer') { tt = "jacaranda"; tc = "#A78BFA" }
        else if (mSeason === 'autumn') { tt = "maple"; tc = "#EA580C" }
        else if (mSeason === 'winter') { tt = "pine"; tc = "#CBD5E1" }
        np.push({ x: 0.85, y: 0.82, type: "tree", subtype: tt, color: tc, scale: 1, growth: 1, delay: 0, swayOffset: 0, swaySpeed: 0.005, seed: 9999 })
        const done = tasks.filter((t: any) => t.completedAt && t.completedAt.split("T")[0] === today).slice(0, 12)
        const amb = Math.max(0, 5 - done.length) + 2
        const ap = (x: number, type: "flower" | "tree", sub: string, col: string, sm: number, d: number) => {
            np.push({ x, y: 0.8 + sr(seed + np.length * 11) * 0.08, type, subtype: sub, color: col, scale: (0.4 + sr(seed + np.length * 99) * 0.25) * sm, growth: 0, delay: d, swayOffset: sr(seed) * 10, swaySpeed: 0.015, seed: seed + np.length })
        }
        done.forEach((t: any, i: number) => {
            let fs = "lily", fc = "#F8FAFC"
            if (mSeason === 'spring') { fs = t.priority === 'high' ? "tulip" : "orchid"; fc = t.priority === 'high' ? "#F43F5E" : "#E879F9" }
            else if (mSeason === 'summer') { fs = t.priority === 'high' ? "sunflower" : "lily"; fc = t.priority === 'high' ? "#FBBF24" : "#F43F5E" }
            else if (mSeason === 'autumn') { fs = t.priority === 'high' ? "chrysanthemum" : "marigold"; fc = t.priority === 'high' ? "#EA580C" : "#F59E0B" }
            else { fs = "snowflower"; fc = "#8B5CF6" }
            ap((i + 1) / (done.length + 1) + (sr(seed + i) * 0.1 - 0.05), "flower", fs, fc, 1, i * 100)
        })
        for (let i = 0; i < amb; i++) {
            let avail = ['tulip'], fc = "#A78BFA"
            if (mSeason === 'spring') { avail = ['tulip', 'orchid']; fc = "#F472B6" }
            if (mSeason === 'summer') { avail = ['sunflower', 'lily']; fc = "#FBBF24" }
            if (mSeason === 'autumn') { avail = ['marigold', 'chrysanthemum']; fc = "#EA580C" }
            if (mSeason === 'winter') { avail = ['snowflower']; fc = "#E0F2FE" }
            ap(sr(seed + i * 77), "flower", avail[Math.floor(sr(seed + i * 33) * avail.length)], fc, 0.7, 500 + i * 100)
        }
        pomodoros.filter(p => p.completed && p.startTime.split("T")[0] === today).slice(0, 3).forEach((_, i) => {
            ap(0.1 + sr(seed + i + 500) * 0.8, "tree", tt, tc, 1.2, 800 + i * 200)
        })
        np.sort((a, b) => a.y - b.y); setPlants(np)
    }, [tasks, pomodoros, season, mSeason])

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
                    if (s.size > 1.1) {
                        ctx.globalAlpha = Math.max(0, a * 0.7)
                        ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 0.6
                        const arm = s.size * 4.5
                        ctx.beginPath()
                        ctx.moveTo(sx - arm, sy); ctx.lineTo(sx + arm, sy)
                        ctx.moveTo(sx, sy - arm); ctx.lineTo(sx, sy + arm)
                        ctx.stroke()
                        // Diagonal mini arms
                        ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 0.4
                        const darm = s.size * 2.5
                        ctx.beginPath()
                        ctx.moveTo(sx - darm, sy - darm); ctx.lineTo(sx + darm, sy + darm)
                        ctx.moveTo(sx + darm, sy - darm); ctx.lineTo(sx - darm, sy + darm)
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
                    tg.addColorStop(0, 'rgba(255,255,255,0.95)'); tg.addColorStop(0.15, 'rgba(200,230,255,0.7)'); tg.addColorStop(0.5, 'rgba(180,210,255,0.25)'); tg.addColorStop(1, 'rgba(150,200,255,0)')
                    ctx.strokeStyle = tg; ctx.lineWidth = 3.5; ctx.lineCap = 'round'
                    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx2, ty2); ctx.stroke()
                    const tg2 = ctx.createLinearGradient(hx, hy, hx - ss.trail * 0.4 * ss.vx * W, hy - ss.trail * 0.4 * ss.vy * H * 0.72)
                    tg2.addColorStop(0, 'rgba(255,255,255,1)'); tg2.addColorStop(1, 'rgba(255,255,255,0)')
                    ctx.strokeStyle = tg2; ctx.lineWidth = 1.2
                    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - ss.trail * 0.4 * ss.vx * W, hy - ss.trail * 0.4 * ss.vy * H * 0.72); ctx.stroke()
                    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, Math.PI * 2); ctx.fill()
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

                // ── CRESCENT MOON via offscreen canvas (destination-out is isolated, never touches main canvas) ──
                const ms2 = Math.ceil(ms * 2.4)
                const oc = document.createElement('canvas')
                oc.width = ms2; oc.height = ms2
                const ox = ms2 / 2; const oy = ms2 / 2
                const octx = oc.getContext('2d')!

                // Fill full moon sphere with gradient
                const mb = octx.createRadialGradient(ox - ms * 0.22, oy - ms * 0.22, 0, ox, oy, ms)
                mb.addColorStop(0, '#FEFCE8')
                mb.addColorStop(0.35, '#F1F5F9')
                mb.addColorStop(0.7, '#CBD5E1')
                mb.addColorStop(1, '#94A3B8')
                octx.fillStyle = mb
                octx.beginPath(); octx.arc(ox, oy, ms, 0, Math.PI * 2); octx.fill()

                // Cut the shadow bite — isolated to the offscreen canvas
                octx.globalCompositeOperation = 'destination-out'
                octx.beginPath()
                octx.arc(ox + ms * 0.44, oy - ms * 0.04, ms * 0.82, 0, Math.PI * 2)
                octx.fillStyle = 'rgba(0,0,0,1)'; octx.fill()
                octx.globalCompositeOperation = 'source-over'

                // Subtle craters on lit side
                octx.globalAlpha = 0.12; octx.fillStyle = '#64748B'
                octx.beginPath(); octx.arc(ox - ms * 0.42, oy - ms * 0.28, ms * 0.1, 0, Math.PI * 2); octx.fill()
                octx.beginPath(); octx.arc(ox - ms * 0.62, oy + ms * 0.16, ms * 0.075, 0, Math.PI * 2); octx.fill()
                octx.beginPath(); octx.arc(ox - ms * 0.2, oy + ms * 0.46, ms * 0.06, 0, Math.PI * 2); octx.fill()
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

            // Front garden ground
            ctx.fillStyle = gp[2]
            ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * 0.87)
            ctx.bezierCurveTo(W * 0.3, H * 0.85, W * 0.65, H * 0.89, W, H * 0.86)
            ctx.lineTo(W, H); ctx.closePath(); ctx.fill()



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
                if (t > plant.delay && plant.growth < 1) plant.growth += 0.008
                if (plant.growth <= 0) return
                const px = plant.x * W, py = plant.y * H, s = plant.scale * plant.growth
                const wind = Math.sin(t * 0.008) * 0.015 + Math.sin(t * plant.swaySpeed + plant.swayOffset) * 0.02
                ctx.save(); ctx.translate(px, py)
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
                        ctx.rotate(wind * 2); const sz = 180 * s; try { ctx.drawImage(img, -sz / 2, -sz, sz, sz) } catch (e) { }
                    } else {
                        ctx.rotate(wind * 8); const p2 = 1 + Math.sin(t * 0.05 + plant.seed) * 0.04; ctx.scale(p2, p2)
                        ctx.translate(0, Math.sin(t * 0.1 + plant.seed) * 2); const sz = 85 * s
                        try { ctx.drawImage(img, -sz / 2, -sz, sz, sz) } catch (e) { }
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
            if (vs === 'spring' && rnd < 0.18) parts.current.push({ x: Math.random() * W * 1.1, y: -15, vx: (Math.random() - 0.4) * 0.8, vy: Math.random() * 0.6 + 0.4, rot: Math.random() * Math.PI * 2, size: Math.random() * 5 + 3, color: ["#FBCFE8", "#F9A8D4", "#FDE68A", "#E879F9"][Math.floor(Math.random() * 4)], op: 0.75, type: "petal", life: 0 })
            if (vs === 'autumn' && rnd < 0.15) parts.current.push({ x: Math.random() * W * 1.1, y: -15, vx: (Math.random() - 0.4) * 1.2, vy: Math.random() * 0.8 + 0.5, rot: Math.random() * Math.PI * 2, size: Math.random() * 7 + 4, color: ["#EA580C", "#F59E0B", "#DC2626", "#D97706"][Math.floor(Math.random() * 4)], op: 0.85, type: "leaf", life: 0 })
            if (vs === 'winter' && rnd < 0.35) parts.current.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 0.5, vy: Math.random() * 0.8 + 0.4, rot: 0, size: Math.random() * 3.5 + 1, color: "#F0F9FF", op: 0.7 + Math.random() * 0.3, type: "snow", life: 0 })
            if (vs === 'summer' && !night && rnd < 0.12) parts.current.push({ x: Math.random() * W, y: H * 0.5 + Math.random() * H * 0.4, vx: (Math.random() - 0.5) * 0.4, vy: -Math.random() * 0.5 - 0.1, rot: 0, size: Math.random() * 2.5 + 0.5, color: "#FDE047", op: 0, type: "pollen", life: 0 })

            for (let i = parts.current.length - 1; i >= 0; i--) {
                const p = parts.current[i]; p.life++
                const drift = Math.sin(t * 0.03 + p.y * 0.01) * 0.3
                p.x += p.vx + drift; p.y += p.vy; p.rot += 0.025
                if (p.type === 'pollen') p.op = p.life < 30 ? p.life / 30 : (p.life > 170 ? (200 - p.life) / 30 : 0.6)
                if (p.y > H + 30 || p.x < -50 || p.x > W + 50 || p.life > 350) { parts.current.splice(i, 1); continue }
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
                } else {
                    ctx.rotate(p.rot + Math.sin(t * 0.05) * 0.3); ctx.scale(1, Math.abs(Math.sin(t * 0.04 + p.y * 0.05)) * 0.6 + 0.4)
                    ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2); ctx.fill()
                    if (p.type === 'leaf') { ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0); ctx.stroke() }
                }
                ctx.restore()
            }
            if (parts.current.length > 200) parts.current.splice(0, 30)

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

            raf = requestAnimationFrame(render)
        }
        render()
        return () => { cancelAnimationFrame(raf); ro.disconnect() }
    }, [mSeason, condition, loaded])

    const hour = new Date().getHours()
    let todLabel = "Night"
    if (mTime !== 'auto') todLabel = mTime.charAt(0).toUpperCase() + mTime.slice(1)
    else { if (hour >= 6 && hour < 12) todLabel = "Morning"; else if (hour >= 12 && hour < 17) todLabel = "Afternoon"; else if (hour >= 17 && hour < 20) todLabel = "Evening" }

    return (
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl overflow-hidden h-full flex flex-col relative group">
            <CardHeader className="pb-2 absolute top-0 left-0 z-10 w-full bg-transparent p-4 sm:p-6 flex flex-row items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/30 dark:bg-slate-900/30 shadow-sm border border-slate-400/20 backdrop-blur-md">
                        <Icons.tree className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="bg-white/30 dark:bg-slate-900/30 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-400/10">
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Visual Garden</CardTitle>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium capitalize flex items-center gap-1.5">
                            <span>{mSeason}</span><span className="opacity-50">•</span>
                            <span>{todLabel}</span><span className="opacity-50">•</span>
                            <span>{temperature != null ? Math.round(temperature) : '--'}°C</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end pointer-events-auto">
                    <button onClick={onAddPlant} className="h-9 px-4 rounded-full flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95" title="Plant a New Task">
                        <Icons.plus className="w-4 h-4" /><span className="text-sm font-bold hidden sm:inline">Plant Seed</span>
                    </button>
                    <div className="flex bg-white/80 dark:bg-slate-900/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-md backdrop-blur-md">
                        {(['auto', 'morning', 'afternoon', 'evening', 'night'] as const).map(t2 => (
                            <button key={t2} onClick={() => setMTime(t2)} className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${mTime === t2 ? 'bg-white dark:bg-slate-700 shadow-sm scale-110' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`} title={t2 === 'auto' ? 'Auto' : t2}>
                                {t2 === 'auto' && '🤖'}{t2 === 'morning' && '🌅'}{t2 === 'afternoon' && '☀️'}{t2 === 'evening' && '🌆'}{t2 === 'night' && '🌙'}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-white/80 dark:bg-slate-900/80 rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-md backdrop-blur-md">
                        {(['spring', 'summer', 'autumn', 'winter'] as const).map(s2 => (
                            <button key={s2} onClick={() => setMSeason(s2)} className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${mSeason === s2 ? 'bg-white dark:bg-slate-700 shadow-sm scale-110' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`} title={s2}>
                                {s2 === 'spring' && '🌸'}{s2 === 'summer' && '🌻'}{s2 === 'autumn' && '🍂'}{s2 === 'winter' && '❄️'}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <div className="w-full relative bg-slate-50 dark:bg-slate-900 transition-colors duration-700 flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
                <div ref={cont} className="min-w-[800px] w-full h-72 sm:h-96 relative">
                    <canvas ref={cvs} className="w-full h-full block" />
                </div>
            </div>
        </Card>
    )
}
