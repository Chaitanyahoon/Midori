"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

const motivationalQuotes = [
  {
    text: "Like a tree, grow your roots deep and reach for the sky.",
    author: "Midori Wisdom",
    emoji: "🌳",
  },
  {
    text: "Every small step is a seed planted for future success.",
    author: "Growth Mindset",
    emoji: "🌱",
  },
  {
    text: "Productivity blooms when you water it with consistency.",
    author: "Garden of Success",
    emoji: "🌸",
  },
  {
    text: "Just as plants need sunlight, your goals need daily attention.",
    author: "Nature's Productivity",
    emoji: "☀️",
  },
  {
    text: "Growth happens slowly, then suddenly - trust the process.",
    author: "Organic Progress",
    emoji: "🌿",
  },
  {
    text: "Prune away distractions to let your focus flourish.",
    author: "Mindful Gardening",
    emoji: "✂️",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Ancient Wisdom",
    emoji: "🌲",
  },
  {
    text: "Your potential is like a seed - it contains everything needed to grow.",
    author: "Inner Garden",
    emoji: "🌰",
  },
  {
    text: "Seasons change, but consistent growth creates lasting results.",
    author: "Productivity Seasons",
    emoji: "🍂",
  },
  {
    text: "Nurture your dreams like a gardener tends their plants.",
    author: "Dream Cultivation",
    emoji: "🌺",
  },
  {
    text: "Focus is the fertilizer for your productivity garden.",
    author: "Deep Work Philosophy",
    emoji: "💪",
  },
  {
    text: "Small daily improvements lead to massive results over time.",
    author: "Compound Growth",
    emoji: "📈",
  },
  {
    text: "Your future self will thank you for the seeds you plant today.",
    author: "Future Harvest",
    emoji: "🎯",
  },
  {
    text: "Every completed task is a flower blooming in your garden of achievements.",
    author: "Achievement Garden",
    emoji: "🏆",
  },
  {
    text: "Patience and persistence turn the smallest seeds into the mightiest trees.",
    author: "Timeless Growth",
    emoji: "⏳",
  },
]

export function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setCurrentQuote(motivationalQuotes[randomIndex])
  }, [])

  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
            {currentQuote.emoji || "🌱"}
          </div>
          <div className="flex-1 min-w-0">
            <blockquote className="text-gray-700 dark:text-gray-200 text-base leading-relaxed mb-2">
              "{currentQuote.text}"
            </blockquote>
            <cite className="text-xs text-gray-500 dark:text-gray-400">
              — {currentQuote.author}
            </cite>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
