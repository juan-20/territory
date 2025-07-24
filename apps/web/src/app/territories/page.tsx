'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'

import { Input } from '@/components/ui/input'
import { redirect, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from '@/hooks/useToken'
import { SearchIcon } from 'lucide-react'

interface Territory {
  _id: string
  name: string
  description: string
  doneRecently: boolean
  updatedAt: string
  region: string
  timesWhereItWasDone?: string[]
}

export default function Territories() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const pageSize = 9
  const token = useToken()
  const [items, setItems] = useState<Territory[]>([])
  const [cursor, setCursor] = useState<string | null>(null)

  const territories = useQuery(api.territory.getPaginatedTerritories, 
    token ? {
      paginationOpts: { numItems: pageSize, cursor },
      token
    } : "skip"
  )

  // Update items when new data arrives
  useEffect(() => {
    if (territories?.page) {
      if (cursor === null) {
        // First load or reset
        setItems(territories.page)
      } else {
        // Append new items
        setItems(prev => [...prev, ...territories.page])
      }
    }
  }, [territories?.page, cursor])

  const stats = useQuery(api.territory.doneTerritories, 
    token ? { token } : "skip"
  )

  const searchResults = useQuery(api.territory.getSearchableTerritories, 
    token ? {
      search,
      token
    } : "skip"
  )

  const displayedTerritories = search ? searchResults : items

  const handleTerritoryClick = (id: string) => {
    router.push(`/territories/${id}`)
  }

  if (!token) {
    redirect('/auth')
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4">
         

          {stats && (
            <Card className="w-full p-6 bg-card">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Status dos Territórios</h2>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progresso Total</span>
                    <span className="font-medium">{((stats.doneRecentlyCount / stats.totalCount) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                      style={{ width: `${(stats.doneRecentlyCount / stats.totalCount) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Feitos: {stats.doneRecentlyCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-muted" />
                      <span>Total: {stats.totalCount}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center mt-2">
                  Atualizado com base no último ano
                </div>
              </div>
            </Card>
          )}
        </div>

           <Card className="w-full p-6 bg-card">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">Territórios</h1>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Procurar quadras por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
          </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {displayedTerritories?.map((territory) => (
            <Card
              key={territory._id}
              className="p-6 bg-card cursor-pointer hover:shadow-lg transition-all duration-200 border border-border"
              onClick={() => handleTerritoryClick(territory._id)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{territory.name}</h3>
                  <div className={`h-2 w-2 rounded-full ${territory.doneRecently ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <p className="text-muted-foreground">{territory.region}</p>
                {territory.description && (
                  <p className="text-sm mt-1 line-clamp-2 text-muted-foreground">{territory.description}</p>
                )}
                {territory.timesWhereItWasDone && territory.timesWhereItWasDone.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Pregado pela última vez: {new Date(territory.timesWhereItWasDone[0]).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {territory.doneRecently ? 'Feito recentemente' : 'Não feito recentemente'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {territory.timesWhereItWasDone && territory.timesWhereItWasDone.length > 0
                    ? `Última vez: ${new Date(territory.timesWhereItWasDone[0]).toLocaleDateString('pt-BR')}`
                    : 'Nunca feito'}
                </span>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/territories/${territory._id}`)
                }}
              >
                Ver Detalhes
              </Button>
            </Card>
          ))}
        </div>

        {!search && territories?.continueCursor && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setCursor(territories.continueCursor)}
              variant="outline"
              className="w-full md:w-auto mb-4"
            >
              Ver mais territórios
            </Button>
          </div>
        )}
        
        {displayedTerritories?.length === 0 && (
          <Card className="p-6 bg-card text-center">
            <p className="text-muted-foreground">Nenhum território encontrado</p>
          </Card>
        )}
      </div>
    </div>
  )
}
