'use client'

import React from 'react'
import { useQuery, useMutation } from 'convex/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redirect, useRouter } from 'next/navigation'
import { api } from '@territory/backend/convex/_generated/api'
import type { Id } from '@territory/backend/convex/_generated/dataModel'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect } from 'react'
import { useToken } from '@/hooks/useToken'
import { DatePicker } from '@/components/ui/date-picker'
import { Trash } from 'lucide-react'

interface Params {
  id: Id<'territories'>
}

interface PageProps {
  params: Promise<Params>
}

export default function EditTerritoryPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = React.use(params)
  const token = useToken()
  if (!token) {
    redirect('/auth')
  }

  const territory = useQuery(api.territory.getById, { id, token })
  const updateTerritory = useMutation(api.territory.toggle)
  const regions = useQuery(api.territory.getRegions, { token })

  const [formData, setFormData] = useState({
    description: '',
    region: '',
    timesWhereItWasDone: [] as string[],
    newDate: ''
  })

  useEffect(() => {
    // Set the initial date when component mounts on client
    setFormData(prev => ({
      ...prev,
      newDate: new Date().toISOString().split('T')[0]
    }))
  }, [])

  useEffect(() => {
    if (territory) {
      setFormData(prev => ({
        description: territory.description,
        region: territory.region,
        timesWhereItWasDone: territory.timesWhereItWasDone || [],
        newDate: prev.newDate // Preserve the current date
      }))
    }
  }, [territory])

  if (!territory || !regions) {
    return <div>Loading...</div>
  }

  if (!token) {
      redirect('/auth')
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateTerritory({
      id,
      description: formData.description,
      region: formData.region,
      token: token,
      timesWhereItWasDone: formData.timesWhereItWasDone.join(',')
    })
    router.back()
  }

  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/T.*/,'').split('-').reverse().join('-')
  }

  const handleAddDate = () => {
    if (formData.newDate) {
      const selectedDate = formData.newDate
      setFormData(prev => ({
        ...prev,
        timesWhereItWasDone: [
          ...prev.timesWhereItWasDone.filter(date => date !== selectedDate),
          selectedDate
        ].sort().reverse()
      }))
    }
  }

  const handleRemoveDate = (dateToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      timesWhereItWasDone: prev.timesWhereItWasDone.filter(date => date !== dateToRemove)
    }))
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
      </div>
      <Card className="p-6 bg-card">
        <h1 className="text-2xl font-bold">Editar território: {territory.name}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Região</Label>
            <select
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Datas pregadas</Label>
              {territory && (
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${territory.doneRecently ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-muted-foreground">
                    {territory.doneRecently ? 'Feito Recentemente' : 'Não Feito Recentemente'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <DatePicker
                  date={new Date(formData.newDate + 'T12:00:00')}
                  setDate={(date) => {
                    if (date) {
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                      setFormData(prev => ({ ...prev, newDate: localDate.toISOString().split('T')[0] }))
                    }
                  }}
                />
              </div>
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleAddDate}
              >
                Adicionar Data
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.timesWhereItWasDone.map((date) => (
                <div key={date} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span>{formatDate(date)}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveDate(date)}
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
