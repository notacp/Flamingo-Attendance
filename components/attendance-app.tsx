"use client"

import { useState, useEffect, useCallback } from "react"
import { AttendanceForm } from "./attendance-form"
import { AttendanceList } from "./attendance-list"
import { Header } from "./header"
import { SuccessModal } from "./success-modal"
import { attendanceAPI, type AttendanceRecordAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

import { getTodayISO, normalizeDate } from "@/lib/date-utils"

export interface AttendanceRecord {
  id: string
  rowNumber?: number
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
  const [lastSubmittedRowNumber, setLastSubmittedRowNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setError(null)
      const result = await attendanceAPI.getAll()
      if (result.success && result.data) {
        const transformedRecords: AttendanceRecord[] = result.data.map((record, index) => ({
          id: record.rowNumber?.toString() || index.toString(),
          rowNumber: record.rowNumber,
          name: record.name || record.Name || 'Unknown',
          email: record.email || record.Email || '',
          batch: record.batch || record.Batch || '',
          date: normalizeDate(record.date || record.Date || ''),
          timestamp: record.timestamp ? new Date(record.timestamp).getTime() : Date.now(),
        }))
        setRecords(transformedRecords)
      } else {
        setError(result.error || 'Failed to fetch records')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleSubmit = async (record: Omit<AttendanceRecord, "id" | "timestamp" | "rowNumber">) => {
    setSubmitting(true)
    setError(null)

    try {
      const result = await attendanceAPI.create({
        name: record.name,
        email: record.email,
        batch: record.batch,
        date: record.date,
      })

      if (result.success && result.data) {
        setLastSubmitted(record.name)
        const data = result.data as { rowNumber?: number }
        if (data.rowNumber) {
          setLastSubmittedRowNumber(data.rowNumber)
        }
        setShowSuccess(true)
        await fetchRecords()
      } else {
        setError(result.error || 'Failed to submit attendance')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading attendance records...</span>
          </div>
        </div>
      </main>
    )
  }

  const handleSuccessClose = async (feedback?: string) => {
    if (feedback && lastSubmittedRowNumber) {
      try {
        const result = await attendanceAPI.updateFeedback(lastSubmittedRowNumber, feedback)
        if (!result.success) {
          setError('Failed to save feedback. Please try again.')
          return
        }
      } catch (err) {
        setError('Failed to save feedback. Please try again.')
        return
      }
    }

    setShowSuccess(false)
    setLastSubmittedRowNumber(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-8 md:grid-cols-2">
          <AttendanceForm onSubmit={handleSubmit} isSubmitting={submitting} />
          <AttendanceList
            records={(() => {
              const today = getTodayISO();
              return records.filter(r => r.date === today);
            })()}
            onRefresh={fetchRecords}
          />
        </div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} name={lastSubmitted} />
    </main >
  )
}
