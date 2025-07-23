'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'

interface Territory {
  _id: string;
  name: string;
  description: string;
  done: boolean;
  updatedAt: string;
  region: string;
}
import { Input } from '@/components/ui/input'
import { redirect, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@territory/backend/convex/_generated/api';
import { useToken } from '@/hooks/useToken';

export default function Territories() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const token = useToken()

  const territories = useQuery(api.territory.getPaginatedTerritories, 
    token ? {
      paginationOpts: { numItems: pageSize, cursor: null },
      token
    } : "skip"
  )

  const searchResults = useQuery(api.territory.getSearchableTerritories, 
    token ? {
      search,
      token
    } : "skip"
  )

  const displayedTerritories = (search ? searchResults : territories?.page) as Territory[] | undefined

  const handleTerritoryClick = (id: string) => {
    router.push(`/territories/${id}`)
  }

  if (!token) {
    redirect('/auth')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Procurar quadras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTerritories?.map((territory) => (
          <Card
            key={territory._id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleTerritoryClick(territory._id)}
          >
            <h3 className="text-lg font-semibold">{territory.name}</h3>
            <p className="text-gray-600">{territory.region}</p>
            <p className="text-sm mt-2 line-clamp-2">{territory.description}</p>
          </Card>
        ))}
      </div>

      {!search && territories?.continueCursor && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => setPage(page + 1)}
            variant="default"
          >
            Ver mais
          </Button>
        </div>
      )}
    </div>
  )
}
