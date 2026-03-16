import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { Analytics } from "@vercel/analytics/next"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Midori - Your Productive Garden",
  description: "Grow your tasks, cultivate your focus.",
  generator: 'Midori',
  icons: {
    icon: '/midori_logo.png',
    apple: '/midori_logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
