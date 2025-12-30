import Image from "next/image"

const LOGO_URL = "/images/screenshot-202025-11-30-20at-205.png"

export function Header() {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-center gap-4">
          <Image
            src={LOGO_URL || "/placeholder.svg"}
            alt="Flamingo Jiu-Jitsu Logo"
            width={60}
            height={60}
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Flamingo Jiu-Jitsu</h1>
            <p className="text-sm text-muted-foreground tracking-wide">Attendance Check-In</p>
          </div>
        </div>
      </div>
    </header>
  )
}
