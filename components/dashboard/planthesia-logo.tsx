"use client"

interface PlanthesiaLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function PlanthesiaLogo({ size = "md", showText = true, className = "" }: PlanthesiaLogoProps) {
  const sizeClasses = {
    sm: { img: "w-8 h-8", text: "text-lg" },
    md: { img: "w-10 h-10", text: "text-xl" },
    lg: { img: "w-12 h-12", text: "text-2xl" },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/icon.svg"
        alt="Planthesia logo"
        className={`${sizes.img} drop-shadow-lg hover:rotate-6 hover:scale-110 transition-all duration-300 cursor-pointer`}
      />

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
