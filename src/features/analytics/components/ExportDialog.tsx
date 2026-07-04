'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer, FileSpreadsheet } from 'lucide-react'
import { HabitPerformanceItem } from '../types'
import { format } from 'date-fns'

interface ExportDialogProps {
  performance: HabitPerformanceItem[]
}

export function ExportDialog({ performance }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      const headers = [
        'Habit Name',
        'Category',
        'Difficulty',
        'Success Rate',
        'Total Completions',
        'Missed Days',
        'Current Streak',
        'Longest Streak',
        'Weekly Rate (Past 7d)',
        'MonthlyRate (Past 30d)',
      ]

      const rows = performance.map((item) => [
        item.habitTitle,
        item.category,
        item.difficulty,
        `${item.completionRate}%`,
        item.totalCompletions,
        item.missedDays,
        `${item.currentStreak}d`,
        `${item.longestStreak}d`,
        `${item.weeklyRate}%`,
        `${item.monthlyRate}%`,
      ])

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `loop_analytics_${format(new Date(), 'yyyy_MM_dd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    } finally {
      setIsExporting(false)
      setOpen(false)
    }
  }

  const handlePrintPDF = () => {
    setOpen(false)
    // Wait for modal transition to finish before triggering print dialog
    setTimeout(() => {
      window.print()
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center border border-border/60 bg-background hover:bg-muted text-foreground text-xs font-semibold h-8 px-3 rounded-lg gap-2 cursor-pointer transition-colors focus:outline-none">
        <Download className="h-3.5 w-3.5" />
        Export Data
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] border-border/40 select-none">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground">Export Habit Analytics</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Download your completion records to a spreadsheet or print a summary report.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* CSV Option */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-accent/40 hover:text-accent transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Spreadsheet (CSV)</span>
            <span className="text-[10px] text-muted-foreground text-center mt-1">
              Detailed metrics for MS Excel or Numbers
            </span>
          </button>

          {/* PDF Option */}
          <button
            type="button"
            onClick={handlePrintPDF}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-accent/40 hover:text-accent transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Printer className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Report (PDF)</span>
            <span className="text-[10px] text-muted-foreground text-center mt-1">
              Printable summary of your habit consistency
            </span>
          </button>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 text-xs font-semibold hover:bg-muted cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
