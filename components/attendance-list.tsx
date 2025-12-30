"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, User, Clock } from "lucide-react"
import type { AttendanceRecord } from "./attendance-app"

interface AttendanceListProps {
  records: AttendanceRecord[]
}

export function AttendanceList({ records }: AttendanceListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getBatchColor = (batch: string) => {
    if (batch.includes("Morning")) return "bg-primary text-primary-foreground"
    if (batch.includes("Afternoon")) return "bg-primary/80 text-primary-foreground"
    if (batch.includes("Evening")) return "bg-primary/60 text-primary-foreground"
    if (batch.includes("Women")) return "bg-accent text-accent-foreground"
    if (batch.includes("Weekend")) return "bg-primary/70 text-primary-foreground"
    return "bg-secondary text-secondary-foreground"
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-xl text-foreground">
          <span className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Today's Warriors
          </span>
          <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
            {records.length} checked in
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[360px] pr-4">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <div className="text-6xl mb-4">🥋</div>
              <p className="text-center">No warriors yet today.</p>
              <p className="text-sm text-center mt-1">Be the first to check in!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all animate-in slide-in-from-top-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{record.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getBatchColor(record.batch)}`}>
                        {record.batch.split("(")[0].trim()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
