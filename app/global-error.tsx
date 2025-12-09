"use client"

import { Outfit } from "next/font/google"
import { Button } from "@/components/ui/button"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"] })

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en">
            <body className={outfit.className}>
                <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
                    <h1 className="text-4xl font-bold">Something went wrong</h1>
                    <p className="text-xl text-gray-600">{error.message || "A critical error occurred."}</p>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    )
}
