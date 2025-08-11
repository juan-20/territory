'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'

import { Input } from '@/components/ui/input'
import { redirect, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from '@/hooks/useToken'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { SearchIcon, UserIcon } from 'lucide-react'

interface Territory {
  _id: string
  name: string
  description: string
  doneRecently: boolean
  updatedAt: string
  region: string
  timesWhereItWasDone?: string[]
  leastEditedBy?: string[]
}

export default function Territories() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const pageSize = 9
  const token = useToken()
  const { isAdmin } = useIsAdmin()
  const [items, setItems] = useState<Territory[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [filterByDoneRecently, setFilterByDoneRecently] = useState<boolean | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isChangingFilter, setIsChangingFilter] = useState(false)

  const territories = useQuery(api.territory.getPaginatedTerritories, 
    token ? {
      paginationOpts: { numItems: pageSize, cursor },
      token,
      filterByDoneRecently
    } : "skip"
  )

  useEffect(() => {
    if (territories?.page) {
      if (cursor === null) {
        setItems(territories.page)
        setIsChangingFilter(false)
      } else {
        setItems(prev => [...prev, ...territories.page])
        setIsLoadingMore(false)
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
    <div className="container mx-auto p-4">
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
              <div className="flex-col md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold">Territórios</h1>
                
              </div>
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

              <div className="flex-col md:flex-row gap-2">
                  <Button
                    variant={filterByDoneRecently === null ? "secondary" : "outline"}
                    onClick={() => {
                      setIsChangingFilter(true)
                      setFilterByDoneRecently(null)
                      setCursor(null)
                      setItems([])
                    }}
                    disabled={isChangingFilter}
                  >{isChangingFilter && filterByDoneRecently === null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      "Todos"
                    )}
                  </Button>
                  <Button
                    variant={filterByDoneRecently === true ? "secondary" : "outline"}
                    onClick={() => {
                      setIsChangingFilter(true)
                      setFilterByDoneRecently(true)
                      setCursor(null)
                      setItems([])
                    }}
                    disabled={isChangingFilter}
                  >
                    {isChangingFilter && filterByDoneRecently === true ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      "Feitos Recentemente"
                    )}
                  </Button>
                  <Button
                    variant={filterByDoneRecently === false ? "secondary" : "outline"}
                    onClick={() => {
                      setIsChangingFilter(true)
                      setFilterByDoneRecently(false)
                      setCursor(null)
                      setItems([])
                    }}
                    disabled={isChangingFilter}
                  >
                    {isChangingFilter && filterByDoneRecently === false ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      "Não Feitos"
                    )}
                  </Button>
                </div>

            </div>
          </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Loading skeletons */}
          {(!territories || isLoadingMore) && (
            <>
              {[...Array(pageSize)].map((_, index) => (
                <Card key={`skeleton-${index}`} className="p-6 bg-card border border-border">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
                    </div>
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-full animate-pulse mt-1" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                    </div>
                    <div className="h-9 bg-muted rounded w-full mt-4 animate-pulse" />
                  </div>
                </Card>
              ))}
            </>
          )}
          
          {/* Actual territories */}
          {territories && displayedTerritories?.map((territory) => (
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
                {territory.leastEditedBy && territory.leastEditedBy.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Editado por: {territory.leastEditedBy[0]}
                      {territory.leastEditedBy.length > 1 && (
                        <span className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
                          +{territory.leastEditedBy.length - 1}
                        </span>
                      )}
                    </p>
                  </div>
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

        {!search && territories?.continueCursor && territories.page.length >= pageSize && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                setIsLoadingMore(true)
                setCursor(territories.continueCursor)
              }}
              variant="outline"
              className="w-full md:w-auto mb-4"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </div>
              ) : (
                'Ver mais territórios'
              )}
            </Button>
          </div>
        )}
        
        {territories && displayedTerritories?.length === 0 && (
          <Card className="p-6 bg-card text-center">
            <p className="text-muted-foreground">Nenhum território encontrado</p>
          </Card>
        )}
      </div>
    </div>
  )
}
