'use client'

import React from 'react'
import { useQuery } from 'convex/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect, useRouter } from 'next/navigation'
import { api } from '@territory/backend/convex/_generated/api'
import type { Id } from '@territory/backend/convex/_generated/dataModel'
import { useToken } from '@/hooks/useToken'

interface Params {
  id: Id<'territories'>
}

interface PageProps {
  params: Promise<Params>
}

export default function TerritoryPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = React.use(params)
  const token = useToken()
  const territory = useQuery(api.territory.getById, token ? {
    id,
    token
  } : "skip")

  if (!token) {
      redirect('/auth')
    }

  if (!territory) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/territories/${id}/edit`)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          Edit
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{territory.name}</h1>
        <div className="grid gap-4">
          <div>
            <h2 className="text-lg font-semibold">Region</h2>
            <p>{territory.region}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p>{territory.description}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Status</h2>
            <p>{territory.done ? 'Completed' : 'Pending'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Last Updated</h2>
            <p>{new Date(territory.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
