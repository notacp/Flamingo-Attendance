import type React from "react"
import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Poppins, Atkinson_Hyperlegible } from 'next/font/google'

// Initialize fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-poppins',
  display: 'swap',
})

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ["400", "700"],
  variable: '--font-atkinson',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Dojo Check-In | Jiu Jitsu Attendance",
  description: "Mark your attendance for Jiu Jitsu class - Train hard, stay consistent!",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#FC0000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${atkinson.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
