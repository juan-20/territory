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

  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/T.*/,'').split('-').reverse().join('-')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Voltar
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/territories/${id}/edit`)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          Editar
        </Button>
      </div>

      <Card className="p-6 bg-card">
        <h1 className="text-2xl font-bold mb-4">{territory.name}</h1>
        <div className="grid gap-4">
          <div>
            <h2 className="text-lg font-semibold">Região</h2>
            <p>{territory.region}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Descrição</h2>
            <p>{territory.description}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Status</h2>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${territory.doneRecently ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-muted-foreground">
                {territory.doneRecently ? 'Feito Recentemente' : 'Não Feito Recentemente'}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Datas pregadas</h2>
            <div className="space-y-2 mt-2">
              {territory.timesWhereItWasDone?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma data registrada</p>
              ) : (
                territory.timesWhereItWasDone?.map((date) => (
                  <div key={date} className="bg-muted p-2 rounded">
                    <span>{formatDate(date)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
