import type React from "react"
import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Geist_Mono, Acme as V0_Font_Acme, Geist_Mono as V0_Font_Geist_Mono, Lora as V0_Font_Lora } from 'next/font/google'

// Initialize fonts
const _acme = V0_Font_Acme({ subsets: ['latin'], weight: ["400"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _lora = V0_Font_Lora({ subsets: ['latin'], weight: ["400","500","600","700"] })

export const metadata: Metadata = {
  title: "Dojo Check-In | Jiu Jitsu Attendance",
  description: "Mark your attendance for Jiu Jitsu class - Train hard, stay consistent!",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
