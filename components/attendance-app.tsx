"use client"

import { useState } from "react"
import { AttendanceForm } from "./attendance-form"
import { AttendanceList } from "./attendance-list"
import { Header } from "./header"
import { SuccessModal } from "./success-modal"

export interface AttendanceRecord {
  id: string
  name: string
  email: string
  batch: string
  date: string
  timestamp: number
}

export function AttendanceApp() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastSubmitted, setLastSubmitted] = useState<string>("")

  const handleSubmit = (record: Omit<AttendanceRecord, "id" | "timestamp">) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    setRecords((prev) => [newRecord, ...prev])
    setLastSubmitted(record.name)
    setShowSuccess(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          <AttendanceForm onSubmit={handleSubmit} />
          <AttendanceList records={records} />
        </div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} name={lastSubmitted} />
    </main>
  )
}
