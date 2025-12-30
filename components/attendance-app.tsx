"use client"

import { useState, useEffect, useCallback } from "react"
import { AttendanceForm } from "./attendance-form"
import { AttendanceList } from "./attendance-list"
import { Header } from "./header"
import { SuccessModal } from "./success-modal"
import { attendanceAPI, type AttendanceRecordAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setError(null)
      const result = await attendanceAPI.getAll()
      if (result.success && result.data) {
        // Transform API records to local format
        const transformedRecords: AttendanceRecord[] = result.data.map((record, index) => ({
          id: record.rowNumber?.toString() || index.toString(),
          rowNumber: record.rowNumber,
          name: record.name,
          email: record.email,
          batch: record.batch,
          date: record.date,
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

      if (result.success) {
        setLastSubmitted(record.name)
        setShowSuccess(true)
        // Refresh the list to get the new record with proper rowNumber
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

  const handleDelete = async (rowNumber: number) => {
    try {
      const result = await attendanceAPI.delete(rowNumber)
      if (result.success) {
        await fetchRecords()
      } else {
        setError(result.error || 'Failed to delete record')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
          <AttendanceList records={records} onDelete={handleDelete} onRefresh={fetchRecords} />
        </div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} name={lastSubmitted} />
    </main>
  )
}
