"use client"

import { useState, useEffect } from "react"
import { Icons } from "@/components/icons"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

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
  const [isFading, setIsFading] = useState(false)
  const [spinRefresh, setSpinRefresh] = useState(false)
  const [isLoadingMood, setIsLoadingMood] = useState(false)

  const fetchMoodQuote = async (mood: string) => {
    if (isFading || isLoadingMood) return
    setIsFading(true)
    setIsLoadingMood(true)
    try {
      const res = await fetch("/api/growth-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "quote",
          context: { mood }
        })
      })
      if (!res.ok) throw new Error("Failed to fetch quote")
      const data = await res.json()
      if (data.text) {
        setCurrentQuote({
          text: data.text,
          author: data.author || "Midori AI",
          kanji: data.kanji || "禅"
        })
      }
    } catch (e) {
      console.error(e)
      // Fallback: pick a random quote
      let nextQuote = currentQuote
      while (nextQuote.text === currentQuote.text) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
        nextQuote = motivationalQuotes[randomIndex]
      }
      setCurrentQuote(nextQuote)
    } finally {
      setIsFading(false)
      setIsLoadingMood(false)
    }
  }

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setCurrentQuote(motivationalQuotes[randomIndex])
    // Trigger fade-in after mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    if (isFading) return
    setIsFading(true)
    setSpinRefresh(true)
    setTimeout(() => {
      let nextQuote = currentQuote
      while (nextQuote.text === currentQuote.text) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
        nextQuote = motivationalQuotes[randomIndex]
      }
      setCurrentQuote(nextQuote)
      setIsFading(false)
      // reset spin after half a second
      setTimeout(() => setSpinRefresh(false), 500)
    }, 300)
  }

  return (
    <div 
      className={`relative pt-7 pb-2 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Hanging String */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 pointer-events-none z-10">
        <svg className="w-full h-full text-amber-800/50 dark:text-emerald-700/40" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M50,3 L15,24 M50,3 L85,24" />
          <circle cx="50" cy="3" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {/* Scroll Container */}
      <div
        className="kakemono-scroll relative overflow-hidden mx-auto mt-2 px-6 sm:px-10 py-8 bg-[#fdfaf2] dark:bg-[#121c15] border-l-2 border-r-2 border-[#ebdcb9] dark:border-emerald-800/20 shadow-xl transition-all duration-500 rounded-sm"
        style={{
          backgroundImage: `
            radial-gradient(rgba(139, 90, 43, 0.02) 1px, transparent 0),
            radial-gradient(rgba(139, 90, 43, 0.015) 1px, transparent 0)
          `,
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0, 6px 6px',
        }}
      >
        {/* Sway animation styling */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes kakemono-sway {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(0.5deg); }
            75% { transform: rotate(-0.5deg); }
            100% { transform: rotate(0deg); }
          }
          .kakemono-scroll {
            transform-origin: top center;
          }
          .kakemono-scroll:hover {
            animation: kakemono-sway 4s ease-in-out infinite;
          }
        `}} />

        {/* Top Roller Bar */}
        <div className="absolute top-0 left-2 right-2 h-3.5 bg-gradient-to-r from-[#5c4033] via-[#8B5A2B] to-[#5c4033] dark:from-[#0f1911] dark:via-[#26442e] dark:to-[#0f1911] rounded-sm shadow-md z-20 flex justify-between items-center px-1">
          <div className="w-2.5 h-5 -ml-2 bg-[#3d2b1f] dark:bg-[#070d09] rounded-sm shadow-inner" />
          <div className="w-2.5 h-5 -mr-2 bg-[#3d2b1f] dark:bg-[#070d09] rounded-sm shadow-inner" />
        </div>

        {/* Bottom Roller Bar */}
        <div className="absolute bottom-0 left-2 right-2 h-3.5 bg-gradient-to-r from-[#5c4033] via-[#8B5A2B] to-[#5c4033] dark:from-[#0f1911] dark:via-[#26442e] dark:to-[#0f1911] rounded-sm shadow-md z-20 flex justify-between items-center px-1">
          <div className="w-2.5 h-5 -ml-2 bg-[#3d2b1f] dark:bg-[#070d09] rounded-sm shadow-inner" />
          <div className="w-2.5 h-5 -mr-2 bg-[#3d2b1f] dark:bg-[#070d09] rounded-sm shadow-inner" />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] via-transparent to-amber-500/[0.02] dark:from-emerald-500/[0.04] dark:via-transparent dark:to-amber-500/[0.02] pointer-events-none" />

        {/* Decorative kanji */}
        <div
          className={`absolute -right-2 -bottom-4 text-[7rem] sm:text-[9rem] font-black leading-none select-none pointer-events-none text-emerald-500/[0.03] dark:text-emerald-400/[0.05] font-serif-luxury transition-all duration-300 ${
            isFading ? "opacity-0 scale-75" : "opacity-100 scale-100"
          }`}
          aria-hidden="true"
        >
          {currentQuote.kanji}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-1">
          {/* Mood Selector Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                disabled={isLoadingMood}
                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 focus:outline-none disabled:opacity-50"
                title="How are you feeling?"
              >
                {isLoadingMood ? (
                  <Icons.spinner className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                ) : (
                  <Icons.smile className="w-3.5 h-3.5" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-emerald-500/20 rounded-2xl shadow-xl p-3">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">My Mood Today</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => fetchMoodQuote("stressed")}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-500/10 active:scale-95 transition-all text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-xl">😩</span>
                    <span>Stressed</span>
                  </button>
                  <button
                    onClick={() => fetchMoodQuote("tired")}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-500/10 active:scale-95 transition-all text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-xl">😴</span>
                    <span>Tired</span>
                  </button>
                  <button
                    onClick={() => fetchMoodQuote("uninspired")}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-500/10 active:scale-95 transition-all text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-xl">😶‍🌫️</span>
                    <span>Uninspired</span>
                  </button>
                  <button
                    onClick={() => fetchMoodQuote("restless")}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-500/10 active:scale-95 transition-all text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-xl">🧘</span>
                    <span>Restless</span>
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 focus:outline-none"
            title="Refresh Quote"
          >
            <Icons.reset
              className={`w-3.5 h-3.5 transition-transform duration-500 ${
                spinRefresh ? "rotate-[360deg]" : ""
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-start gap-4 sm:gap-5 pr-8 mt-1.5">
          {/* Decorative accent line */}
          <div className="hidden sm:block w-0.5 self-stretch rounded-full bg-gradient-to-b from-[#8B5A2B]/40 via-emerald-500/20 to-transparent flex-shrink-0" />

          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            isFading ? "opacity-0 translate-x-1" : "opacity-100 translate-x-0"
          }`}>
            <blockquote className="font-serif-luxury text-base sm:text-lg lg:text-xl text-[#3d2b1f]/90 dark:text-slate-200 leading-relaxed tracking-wide italic">
              &ldquo;{currentQuote.text}&rdquo;
            </blockquote>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-6 h-px bg-gradient-to-r from-[#8B5A2B]/40 to-transparent" />
              <cite className="text-xs sm:text-sm font-semibold text-[#8B5A2B]/75 dark:text-emerald-500/80 not-italic tracking-wide uppercase">
                {currentQuote.author}
              </cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


