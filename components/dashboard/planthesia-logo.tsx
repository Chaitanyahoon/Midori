"use client"

import { Icons } from "@/components/icons"

interface PlanthesiaLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function PlanthesiaLogo({ size = "md", showText = true, className = "" }: PlanthesiaLogoProps) {
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-lg", container: "w-8 h-8" },
    md: { icon: "w-8 h-8", text: "text-xl", container: "w-10 h-10" },
    lg: { icon: "w-10 h-10", text: "text-2xl", container: "w-12 h-12" },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizes.container} bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-all duration-300`}>
        <Icons.leaf className={`${sizes.icon} text-white drop-shadow-sm`} />
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1 className={`${sizes.text} font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent leading-tight`}>
            Planthesia
          </h1>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-medium tracking-wide uppercase">
            Grow Your Focus
          </p>
        </div>
      )}
    </div>
  )
}
