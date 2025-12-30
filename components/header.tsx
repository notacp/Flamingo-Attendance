import Image from "next/image"

const LOGO_URL = "/logo.png"

export function Header() {
  return (
    <header className="border-b border-border bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <Image
            src={LOGO_URL}
            alt="Flamingo Jiu-Jitsu"
            width={400}
            height={120}
            className="object-contain h-24 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  )
}
