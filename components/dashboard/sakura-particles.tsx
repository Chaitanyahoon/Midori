"use client"

import { useState, useEffect } from "react"

interface SakuraParticlesProps {
  count?: number
  className?: string
  opacity?: number
}

export function SakuraParticles({ count = 6, className = "", opacity = 0.3 }: SakuraParticlesProps) {
  const [petals, setPetals] = useState<any[]>([])

  useEffect(() => {
    const newPetals = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${10 + Math.random() * 12}s`,
      size: `${5 + Math.random() * 7}px`,
    }))
    setPetals(newPetals)
  }, [count])

  return (
    <div className={`sakura-container overflow-hidden pointer-events-none absolute inset-0 z-0 ${className}`} style={{ opacity }}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            width: petal.size,
            height: petal.size,
          }}
        />
      ))}
    </div>
  )
}
