"use client"

interface MidoriLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function MidoriLogo({ size = "md", showText = true, className = "" }: MidoriLogoProps) {
  const sizeClasses = {
    sm: { img: "w-8 h-8", text: "text-lg", kanji: "text-[10px]" },
    md: { img: "w-10 h-10", text: "text-xl", kanji: "text-[12px]" },
    lg: { img: "w-12 h-12", text: "text-2xl", kanji: "text-[14px]" },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <img
          src="/icon.svg"
          alt="Midori logo"
          className={`${sizes.img} drop-shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 cursor-pointer`}
        />
        {/* Subtle Japanese hint: Kanji for Midori (Green) */}
        <span className={`absolute -top-1 -right-1 font-bold text-emerald-600/40 dark:text-emerald-400/30 select-none ${sizes.kanji}`}>
          緑
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <h1 className={`${sizes.text} font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent leading-tight`}>
              Midori
            </h1>
            <span className="text-[10px] font-medium text-emerald-600/50 dark:text-emerald-400/40 uppercase tracking-tighter">
              みどり
            </span>
          </div>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-medium tracking-wide uppercase">
            Grow Your Focus
          </p>
        </div>
      )}
    </div>
  )
}
