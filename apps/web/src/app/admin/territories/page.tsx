'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from '@/hooks/useToken'
import { UserIcon, Trash2Icon, MapIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useState } from 'react'

export default function TerritoryTrackingPage() {
  const token = useToken()
  const [isClearing, setIsClearing] = useState(false)
  const [expandedTerritories, setExpandedTerritories] = useState<Set<string>>(new Set())
  
  const territoriesWithEditInfo = useQuery(
    api.territory.getTerritoriesWithEditInfo,
    token ? { token } : "skip"
  )
  
  const clearLastEditedBy = useMutation(api.territory.clearLastEditedBy)
  const clearAllLastEditedBy = useMutation(api.territory.clearAllLastEditedBy)

  const toggleExpanded = (territoryId: string) => {
    const newExpanded = new Set(expandedTerritories)
    if (newExpanded.has(territoryId)) {
      newExpanded.delete(territoryId)
    } else {
      newExpanded.add(territoryId)
    }
    setExpandedTerritories(newExpanded)
  }

  const handleClearSingle = async (territoryId: string) => {
    if (!token) return
    
    try {
      await clearLastEditedBy({ id: territoryId as any, token })
      toast.success('Informação de edição removida!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover informação')
    }
  }

  const handleClearAll = async () => {
    if (!token) return
    
    setIsClearing(true)
    try {
      const result = await clearAllLastEditedBy({ token })
      toast.success(`${result.clearedCount} territórios limpos com sucesso!`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao limpar informações')
    } finally {
      setIsClearing(false)
    }
  }

  if (!token) return null

  const territoriesWithEdits = territoriesWithEditInfo?.filter(t => t.leastEditedBy && t.leastEditedBy.length > 0) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rastreamento de Edições</h2>
        {territoriesWithEdits.length > 0 && (
          <Button
            onClick={handleClearAll}
            disabled={isClearing}
            variant="destructive"
          >
            <Trash2Icon className="h-4 w-4 mr-2" />
            {isClearing ? 'Limpando...' : 'Limpar Todas as Edições'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Territórios com Informações de Edição</CardTitle>
        </CardHeader>
        <CardContent>
          {territoriesWithEdits.length === 0 ? (
            <div className="text-center py-8">
              <MapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum território possui informações de edição no momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {territoriesWithEdits.map((territory) => (
                <div key={territory._id} className="border rounded-lg">
                  <div className="flex justify-between items-center p-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{territory.name}</h3>
                        <span className="text-sm text-muted-foreground">({territory.region})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="h-3 w-3" />
                        <span>
                          Editado por: {territory.lastEditor}
                          {territory.totalEditors > 1 && (
                            <span className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
                              +{territory.totalEditors - 1} outros
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Atualizado em: {new Date(territory.updatedAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {territory.totalEditors > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(territory._id)}
                        >
                          {expandedTerritories.has(territory._id) ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Link href={`/territories/${territory._id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClearSingle(territory._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2Icon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expanded editors list */}
                  {expandedTerritories.has(territory._id) && territory.totalEditors > 1 && (
                    <div className="px-4 pb-4 border-t bg-muted/30">
                      <h4 className="text-sm font-medium mb-2 mt-2">Todos os Editores:</h4>
                      <div className="space-y-1">
                        {territory.leastEditedBy.map((editor, index) => (
                          <div key={`${editor}-${index}`} className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-3 w-3 text-muted-foreground" />
                            <span>{editor}</span>
                            {index === 0 && (
                              <span className="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded">
                                Mais recente
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Edição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{territoriesWithEditInfo?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total de Territórios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{territoriesWithEdits.length}</p>
              <p className="text-sm text-muted-foreground">Com Informações de Edição</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {territoriesWithEditInfo ? 
                  Math.round((territoriesWithEdits.length / territoriesWithEditInfo.length) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Rastreamento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
