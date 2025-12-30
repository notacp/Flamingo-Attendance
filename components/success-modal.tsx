"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

interface SuccessModalProps {
  isOpen: boolean
  onClose: (feedback?: string) => Promise<void>
  name: string
}

const motivationalQuotes = [
  "Every training session is a step towards mastery!",
  "The mat is where champions are forged.",
  "Discipline today, victory tomorrow.",
  "Your only competition is who you were yesterday.",
  "Train like a beast, roll like an artist.",
]

const LOGO_URL = "/logo-icon.png"

export function SuccessModal({ isOpen, onClose, name }: SuccessModalProps) {
  const [feedback, setFeedback] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const quote = useMemo(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    [isOpen]
  )

  const handleClose = async () => {
    setIsSaving(true)
    try {
      await onClose(feedback.trim() || undefined)
      setFeedback("") // Reset for next time
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSaving && handleClose()}>
      <DialogContent className="bg-card border-primary/50 text-center max-w-md" onPointerDownOutside={(e) => isSaving && e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-2 border-primary/10 p-2">
                <Image
                  src={LOGO_URL}
                  alt="Flamingo Jiu-Jitsu"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">OSS, {name}!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-lg text-foreground font-medium">Attendance Marked Successfully!</p>
          <p className="text-muted-foreground italic text-sm">"{quote}"</p>

          {/* Optional Feedback */}
          <div className="text-left space-y-2 pt-2">
            <label htmlFor="feedback" className="text-sm text-muted-foreground">
              Feedback <span className="text-xs">(optional)</span>
            </label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts about today's session..."
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
              className="min-h-[80px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <Button onClick={handleClose} disabled={isSaving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Let's Train!"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
