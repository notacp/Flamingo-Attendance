"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
}

const motivationalQuotes = [
  "Every training session is a step towards mastery!",
  "The mat is where champions are forged.",
  "Discipline today, victory tomorrow.",
  "Your only competition is who you were yesterday.",
  "Train like a beast, roll like an artist.",
]

const LOGO_URL = "/images/screenshot-202025-11-30-20at-205.png"

export function SuccessModal({ isOpen, onClose, name }: SuccessModalProps) {
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/50 text-center max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Image
                  src={LOGO_URL || "/placeholder.svg"}
                  alt="Flamingo Jiu-Jitsu"
                  width={50}
                  height={50}
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
        </div>
        <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Let's Train!
        </Button>
      </DialogContent>
    </Dialog>
  )
}
