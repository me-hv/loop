'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { JournalDashboard } from '@/features/journal/components/JournalDashboard'

export default function DateJournalPage() {
  const params = useParams()
  const date = params.date as string

  return <JournalDashboard date={date} />
}
