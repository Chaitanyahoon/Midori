"use client"

import { useState, useEffect } from "react"
import { useWeather } from "@/hooks/use-weather"

interface EnvironmentalParticlesProps {
  count?: number
  className?: string
  opacity?: number
}

export function EnvironmentalParticles({ count = 8, className = "", opacity = 0.15 }: EnvironmentalParticlesProps) {
  const { season, weather, loading } = useWeather()
  const [particles, setParticles] = useState<any[]>([])

  // Determine particle type based on condition and season
  const getParticleType = (): "sakura" | "glowfly" | "leaf" | "snow" | "rain" => {
    if (loading) return "sakura"
    if (weather.condition === "rain") return "rain"
    if (weather.condition === "snow") return "snow"
    
    switch (season) {
      case "summer":
        return "glowfly"
      case "autumn":
        return "leaf"
      case "winter":
        return "snow"
      case "spring":
      default:
        return "sakura"
    }
  }

  const pType = getParticleType()

  useEffect(() => {
    // Generate randomized particles
    const list = Array.from({ length: count }).map((_, i) => {
      const startLeft = Math.random() * 100
      const delay = Math.random() * 12
      const duration = 8 + Math.random() * 10
      const size = pType === "rain" ? 1.5 : pType === "leaf" ? 12 : pType === "glowfly" ? 6 : 8

      return {
        id: i,
        left: `${startLeft}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        size: `${size + Math.random() * size}px`,
      }
    })
    setParticles(list)
  }, [count, pType])

  const getParticleClasses = () => {
    switch (pType) {
      case "glowfly":
        return "bg-amber-300 rounded-full blur-[1px] shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-env-glowfly"
      case "leaf":
        return "bg-gradient-to-br from-amber-600 to-orange-500 rounded-[50%_0_50%_0] rotate-[30deg] animate-env-leaf"
      case "snow":
        return "bg-white/80 rounded-full blur-[0.5px] animate-env-snow"
      case "rain":
        return "bg-blue-300/40 w-[1.5px] h-6 rounded-full rotate-[15deg] animate-env-rain"
      case "sakura":
      default:
        return "bg-[#ffd7e6] rounded-[100%_0_100%_0] rotate-[45deg] animate-env-sakura"
    }
  }

  return (
    <div className={`environmental-particles-container overflow-hidden pointer-events-none absolute inset-0 z-0 ${className}`} style={{ opacity }}>
      {/* Self-contained CSS Animations */}
      <style jsx global>{`
        .animate-env-sakura {
          position: absolute;
          opacity: 0;
          animation: envFallSakura linear infinite;
        }
        .animate-env-glowfly {
          position: absolute;
          opacity: 0;
          animation: envFloatSummer linear infinite;
        }
        .animate-env-leaf {
          position: absolute;
          opacity: 0;
          animation: envFallAutumn linear infinite;
        }
        .animate-env-snow {
          position: absolute;
          opacity: 0;
          animation: envFallSnow linear infinite;
        }
        .animate-env-rain {
          position: absolute;
          opacity: 0;
          animation: envFallRain linear infinite;
        }

        @keyframes envFallSakura {
          0% {
            top: -5%;
            transform: translateX(0) rotate(45deg) scale(0.6);
            opacity: 0;
          }
          15% { opacity: 0.6; }
          85% { opacity: 0.6; }
          100% {
            top: 105%;
            transform: translateX(120px) rotate(405deg) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes envFloatSummer {
          0% {
            top: 105%;
            transform: translateX(0) scale(0.5);
            opacity: 0;
          }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% {
            top: -5%;
            transform: translateX(50px) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes envFallAutumn {
          0% {
            top: -5%;
            transform: translateX(0) rotate(30deg) scale(0.7);
            opacity: 0;
          }
          15% { opacity: 0.7; }
          85% { opacity: 0.7; }
          100% {
            top: 105%;
            transform: translateX(-80px) rotate(210deg) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes envFallSnow {
          0% {
            top: -5%;
            transform: translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% {
            top: 105%;
            transform: translateX(30px);
            opacity: 0;
          }
        }

        @keyframes envFallRain {
          0% {
            top: -10%;
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            top: 105%;
            transform: translateY(0) translateX(-180px);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          className={getParticleClasses()}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: pType === "rain" ? "24px" : p.size,
          }}
        />
      ))}
    </div>
  )
}
