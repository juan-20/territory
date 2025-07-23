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
    done: false
  })

  useEffect(() => {
    if (territory) {
      setFormData({
        description: territory.description,
        region: territory.region,
        done: territory.done
      })
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
      done: formData.done,
      token: "bdshfvbsdhjfbhjsbjh"
    })
    router.back()
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
      </div>

      <Card className="p-6 bg-card">
        <h1 className="text-2xl font-bold">Edit Territory: {territory.name}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Region</Label>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="done"
              checked={formData.done}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, done: checked === true }))
              }
            />
            <Label htmlFor="done">Mark as completed</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
