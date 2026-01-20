"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Calendar, Users, Mail } from "lucide-react"
import type { AttendanceRecord } from "./attendance-app"
import { getTodayISO, formatDateForDisplay } from "@/lib/date-utils"

const USER_PREFS_KEY = "flamingo-attendance-user-prefs"

interface UserPreferences {
  name: string
  email: string
  preferredBatch: string
}

function loadUserPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(USER_PREFS_KEY)
    if (saved) {
      return JSON.parse(saved) as UserPreferences
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

function saveUserPreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

interface AttendanceFormProps {
  onSubmit: (record: Omit<AttendanceRecord, "id" | "timestamp">) => void | Promise<void>
  isSubmitting?: boolean
}

const batches = [
  { id: "morning", label: "Morning (Mon-Fri, 7:00 AM - 8:30 AM)" },
  { id: "afternoon", label: "Afternoon (Mon/Wed/Fri, 12:00 PM - 1:30 PM)" },
  { id: "evening", label: "Evening (Mon-Fri, 6:30 PM - 8:00 PM)" },
  { id: "women", label: "Women (Tue/Thu/Sat, 7:00 AM - 8:00 AM)" },
  { id: "weekend", label: "Weekend (Sat-Sun, 9:00 AM - 10:30 AM)" },
]

interface SessionTime {
  id: string
  startMinutes: number
  endMinutes: number
  days: number[] // 0 = Sunday, 1 = Monday, ... 6 = Saturday
}

const sessionTimes: SessionTime[] = [
  { id: "morning", startMinutes: 420, endMinutes: 510, days: [1, 2, 3, 4, 5] }, // Mon-Fri 7:00-8:30 AM
  { id: "women", startMinutes: 420, endMinutes: 480, days: [2, 4, 6] }, // Tue/Thu/Sat 7:00-8:00 AM
  { id: "weekend", startMinutes: 540, endMinutes: 630, days: [0, 6] }, // Sat-Sun 9:00-10:30 AM
  { id: "afternoon", startMinutes: 720, endMinutes: 810, days: [1, 3, 5] }, // Mon/Wed/Fri 12:00-1:30 PM
  { id: "evening", startMinutes: 1110, endMinutes: 1200, days: [1, 2, 3, 4, 5] }, // Mon-Fri 6:30-8:00 PM
]

function suggestBatch(): { batchId: string; status: "current" | "upcoming" | "none" } {
  const now = new Date()
  const day = now.getDay()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  // First, check if we're currently in a session
  for (const session of sessionTimes) {
    if (session.days.includes(day) && currentTime >= session.startMinutes && currentTime <= session.endMinutes) {
      return { batchId: session.id, status: "current" }
    }
  }

  // Find the next upcoming session today
  const todaySessions = sessionTimes
    .filter((s) => s.days.includes(day) && s.startMinutes > currentTime)
    .sort((a, b) => a.startMinutes - b.startMinutes)

  if (todaySessions.length > 0) {
    // Suggest if the next session is within 2 hours (120 minutes)
    const nextSession = todaySessions[0]
    const minutesUntil = nextSession.startMinutes - currentTime
    if (minutesUntil <= 120) {
      return { batchId: nextSession.id, status: "upcoming" }
    }
  }

  // Check if we just missed a session (within 30 minutes of end)
  const recentSessions = sessionTimes
    .filter((s) => s.days.includes(day) && currentTime > s.endMinutes && currentTime - s.endMinutes <= 30)
    .sort((a, b) => b.endMinutes - a.endMinutes)

  if (recentSessions.length > 0) {
    return { batchId: recentSessions[0].id, status: "current" }
  }

  return { batchId: "", status: "none" }
}

function getSuggestionMessage(batchId: string, status: "current" | "upcoming" | "none"): string {
  if (status === "none") return "No class is currently in session. Please select your batch."

  const now = new Date()
  const day = now.getDay()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const session = sessionTimes.find((s) => s.id === batchId)

  if (!session) return ""

  if (status === "current") {
    return "Class in session now!"
  }

  const minutesUntil = session.startMinutes - currentTime
  if (minutesUntil <= 60) {
    return `Class starts in ${minutesUntil} minutes`
  } else {
    const hours = Math.floor(minutesUntil / 60)
    const mins = minutesUntil % 60
    return `Class starts in ${hours}h ${mins}m`
  }
}


export function AttendanceForm({ onSubmit, isSubmitting = false }: AttendanceFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [batch, setBatch] = useState("")
  const [date, setDate] = useState(getTodayISO())
  const [suggestion, setSuggestion] = useState<{ batchId: string; status: "current" | "upcoming" | "none" }>({
    batchId: "",
    status: "none",
  })
  const userManuallyChangedBatch = useRef(false)

  // Load saved preferences and set initial batch on mount
  useEffect(() => {
    const savedPrefs = loadUserPreferences()
    if (savedPrefs) {
      setName(savedPrefs.name)
      setEmail(savedPrefs.email)
      // Use saved batch preference if available, otherwise use smart suggestion
      if (savedPrefs.preferredBatch) {
        setBatch(savedPrefs.preferredBatch)
        userManuallyChangedBatch.current = true // Treat saved preference like manual selection
      }
    }

    const detected = suggestBatch()
    setSuggestion(detected)
    // Only auto-set batch if no saved preference
    if (!savedPrefs?.preferredBatch) {
      setBatch(detected.batchId)
    }
  }, [])

  // Periodic update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newDetected = suggestBatch()
      setSuggestion(newDetected)
      // Only auto-update if user hasn't manually changed the batch
      if (!userManuallyChangedBatch.current) {
        setBatch(newDetected.batchId)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Handle user manually changing batch
  const handleBatchChange = (newBatch: string) => {
    userManuallyChangedBatch.current = true
    setBatch(newBatch)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !batch || !date) return

    // Save user preferences for next time
    saveUserPreferences({
      name,
      email,
      preferredBatch: batch,
    })

    const selectedBatch = batches.find((b) => b.id === batch)
    onSubmit({ name, email, batch: selectedBatch?.label || batch, date })
    // Keep name and email populated for convenience (they're saved anyway)
    // Reset to suggested batch after submission
    userManuallyChangedBatch.current = false
    setBatch(suggestion.batchId)
    setDate(getTodayISO())
  }

  return (
    <Card className="border-2 border-primary/20 bg-card shadow-lg shadow-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <UserCheck className="w-5 h-5 text-primary" />
          Mark Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-input border-border text-foreground focus:ring-primary focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">{formatDateForDisplay(date)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Your Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Select Batch
              {suggestion.status !== "none" && (
                <span className={`text-xs ml-1 ${suggestion.status === "current" ? "text-green-600" : "text-primary"}`}>
                  ({suggestion.status === "current" ? "In Session" : "Suggested"})
                </span>
              )}
            </Label>
            <Select value={batch} onValueChange={handleBatchChange} required>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Choose your batch" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-popover-foreground">
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className={`text-xs ${suggestion.status === "current" ? "text-green-600 font-medium" : "text-muted-foreground"}`}
            >
              {getSuggestionMessage(suggestion.batchId, suggestion.status)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
