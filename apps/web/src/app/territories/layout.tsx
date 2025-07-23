'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useToken } from '@/hooks/useToken'

export default function TerritoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = useToken()
  const router = useRouter()

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return children
}
