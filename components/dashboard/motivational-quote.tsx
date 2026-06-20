"use client"

import { useState, useEffect } from "react"

const motivationalQuotes = [
  {
    text: "Like a tree, grow your roots deep and reach for the sky.",
    author: "Midori Wisdom",
    kanji: "根",
  },
  {
    text: "Every small step is a seed planted for future success.",
    author: "Growth Mindset",
    kanji: "種",
  },
  {
    text: "Productivity blooms when you water it with consistency.",
    author: "Garden of Success",
    kanji: "花",
  },
  {
    text: "Just as plants need sunlight, your goals need daily attention.",
    author: "Nature's Productivity",
    kanji: "陽",
  },
  {
    text: "Growth happens slowly, then suddenly — trust the process.",
    author: "Organic Progress",
    kanji: "信",
  },
  {
    text: "Prune away distractions to let your focus flourish.",
    author: "Mindful Gardening",
    kanji: "集",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Ancient Wisdom",
    kanji: "今",
  },
  {
    text: "Your potential is like a seed — it contains everything needed to grow.",
    author: "Inner Garden",
    kanji: "力",
  },
  {
    text: "Seasons change, but consistent growth creates lasting results.",
    author: "Productivity Seasons",
    kanji: "続",
  },
  {
    text: "Nurture your dreams like a gardener tends their plants.",
    author: "Dream Cultivation",
    kanji: "夢",
  },
  {
    text: "Focus is the fertilizer for your productivity garden.",
    author: "Deep Work Philosophy",
    kanji: "専",
  },
  {
    text: "Small daily improvements lead to massive results over time.",
    author: "Compound Growth",
    kanji: "積",
  },
  {
    text: "Your future self will thank you for the seeds you plant today.",
    author: "Future Harvest",
    kanji: "未",
  },
  {
    text: "Every completed task is a flower blooming in your garden of achievements.",
    author: "Achievement Garden",
    kanji: "成",
  },
  {
    text: "Patience and persistence turn the smallest seeds into the mightiest trees.",
    author: "Timeless Growth",
    kanji: "忍",
  },
]

export function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setCurrentQuote(motivationalQuotes[randomIndex])
    // Trigger fade-in after mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`card-zen relative overflow-hidden px-6 sm:px-8 py-6 sm:py-7 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-amber-500/[0.04] dark:from-emerald-500/[0.06] dark:via-transparent dark:to-amber-500/[0.04] pointer-events-none" />

      {/* Decorative kanji */}
      <div
        className="absolute -right-2 -bottom-4 text-[7rem] sm:text-[9rem] font-black leading-none select-none pointer-events-none text-emerald-500/[0.04] dark:text-emerald-400/[0.06] font-serif-luxury"
        aria-hidden="true"
      >
        {currentQuote.kanji}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4 sm:gap-5">
        {/* Decorative accent line */}
        <div className="hidden sm:block w-1 self-stretch rounded-full bg-gradient-to-b from-emerald-400/60 via-emerald-500/40 to-transparent flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <blockquote className="font-serif-luxury text-lg sm:text-xl lg:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed tracking-wide italic">
            &ldquo;{currentQuote.text}&rdquo;
          </blockquote>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-emerald-400/50 to-transparent" />
            <cite className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 not-italic tracking-wide">
              {currentQuote.author}
            </cite>
          </div>
        </div>
      </div>
    </div>
  )
}

