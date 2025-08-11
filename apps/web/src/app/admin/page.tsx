'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useQuery } from 'convex/react'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from '@/hooks/useToken'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function AdminDashboard() {
  const token = useToken()
  const { userInfo } = useIsAdmin()
  
  const allUsers = useQuery(
    api.auth.getAllUsers,
    token ? { token } : "skip"
  )

  const territoryStats = useQuery(
    api.territory.doneTerritories,
    token ? { token } : "skip"
  )

  if (!token) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo, {userInfo?.username}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Você está logado como administrador do sistema.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{allUsers?.length ?? 0}</p>
            <p className="text-muted-foreground">Total de usuários no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Territórios Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{territoryStats?.totalCount ?? 0}</p>
            <p className="text-muted-foreground">Total de territórios cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Territórios Feitos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{territoryStats?.doneRecentlyCount ?? 0}</p>
            <p className="text-muted-foreground">Territórios feitos no último ano</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários no Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allUsers?.map((user) => (
              <div key={user._id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.token.slice(0, 8)}...
                </div>
              </div>
            )) ?? <p>Carregando usuários...</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
