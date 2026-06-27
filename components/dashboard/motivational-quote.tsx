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
      className={`relative pt-7 pb-2 transition-all duration-700 max-w-3xl mx-auto ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Hanging String */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 pointer-events-none z-10">
        <svg className="w-full h-full text-[#8B5A2B]/45 dark:text-emerald-700/40" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M50,3 L15,24 M50,3 L85,24" />
          <circle cx="50" cy="3" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {/* Scroll Container */}
      <div
        className="kakemono-scroll relative overflow-hidden mx-auto mt-2 px-6 sm:px-12 py-9 bg-[#fdfaf2] dark:bg-[#121c15] border-l border-r border-[#ebdcb9]/60 dark:border-emerald-800/10 shadow-xl transition-all duration-500 rounded-sm"
        style={{
          backgroundImage: `
            radial-gradient(rgba(139, 90, 43, 0.02) 1px, transparent 0),
            radial-gradient(rgba(139, 90, 43, 0.015) 1px, transparent 0)
          `,
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0, 6px 6px',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes kakemono-sway {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(0.4deg); }
            75% { transform: rotate(-0.4deg); }
            100% { transform: rotate(0deg); }
          }
          .kakemono-scroll {
            transform-origin: top center;
          }
          .kakemono-scroll:hover {
            animation: kakemono-sway 4.5s ease-in-out infinite;
          }
        `}} />

        {/* Washi Paper Edges (Vertical accents simulating traditional mounting structure) */}
        <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-[#ebdcb9]/30 dark:bg-emerald-800/5 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-4 w-[2px] bg-[#ebdcb9]/30 dark:bg-emerald-800/5 pointer-events-none" />

        {/* Top Roller Bar with traditional circular ends */}
        <div className="absolute top-0 left-4 right-4 h-3 bg-gradient-to-r from-[#4a3329] via-[#8B5A2B] to-[#4a3329] dark:from-[#080f0a] dark:via-[#1e3424] dark:to-[#080f0a] rounded-sm shadow-sm z-20 flex justify-between items-center">
          <div className="w-3.5 h-5 -ml-3.5 bg-[#2d1f18] dark:bg-[#040805] rounded-l-md shadow-md border-r border-[#1a110c]" />
          <div className="w-3.5 h-5 -mr-3.5 bg-[#2d1f18] dark:bg-[#040805] rounded-r-md shadow-md border-l border-[#1a110c]" />
        </div>

        {/* Bottom Roller Bar with traditional circular ends */}
        <div className="absolute bottom-0 left-4 right-4 h-3 bg-gradient-to-r from-[#4a3329] via-[#8B5A2B] to-[#4a3329] dark:from-[#080f0a] dark:via-[#1e3424] dark:to-[#080f0a] rounded-sm shadow-sm z-20 flex justify-between items-center">
          <div className="w-3.5 h-5 -ml-3.5 bg-[#2d1f18] dark:bg-[#040805] rounded-l-md shadow-md border-r border-[#1a110c]" />
          <div className="w-3.5 h-5 -mr-3.5 bg-[#2d1f18] dark:bg-[#040805] rounded-r-md shadow-md border-l border-[#1a110c]" />
        </div>

        {/* Gradient overlay for authentic soft texture */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#8b5a2b]/[0.015] via-transparent to-[#ebdcb9]/[0.015] dark:from-emerald-500/[0.02] dark:via-transparent dark:to-transparent pointer-events-none" />

        {/* Center-aligned decorative kanji waterstamp */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-[7.5rem] sm:text-[9.5rem] font-black leading-none select-none pointer-events-none text-[#8b5a2b]/[0.022] dark:text-emerald-400/[0.035] font-serif transition-all duration-500 z-0 ${
            isFading ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
          aria-hidden="true"
        >
          {currentQuote.kanji}
        </div>

        {/* Action Buttons styled subtly as stamps */}
        <div className="absolute top-4 right-5 z-20 flex items-center gap-1">
          {/* Mood Selector Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                disabled={isLoadingMood}
                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-all duration-300 focus:outline-none disabled:opacity-50"
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
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-all duration-300 focus:outline-none"
            title="Refresh Quote"
          >
            <Icons.reset
              className={`w-3.5 h-3.5 transition-transform duration-500 ${
                spinRefresh ? "rotate-[360deg]" : ""
              }`}
            />
          </button>
        </div>

        {/* Centered Typography Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 mt-2.5">
          <div className={`transition-all duration-300 max-w-2xl ${
            isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}>
            <blockquote className="font-serif-luxury text-base sm:text-lg lg:text-xl text-[#3d2b1f]/95 dark:text-slate-200 leading-relaxed tracking-wide italic">
              &ldquo;{currentQuote.text}&rdquo;
            </blockquote>
            <div className="mt-3.5 flex items-center justify-center gap-3.5">
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#8B5A2B]/40 to-transparent" />
              <cite className="text-[10px] sm:text-xs font-bold text-[#8B5A2B] dark:text-emerald-400/80 not-italic tracking-widest uppercase">
                {currentQuote.author}
              </cite>
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#8B5A2B]/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
