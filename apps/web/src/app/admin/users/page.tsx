'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from '@/hooks/useToken'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function UsersPage() {
  const token = useToken()
  
  const allUsers = useQuery(
    api.auth.getAllUsers,
    token ? { token } : "skip"
  )

  if (!token) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Link href="/admin/users/create">
          <Button>Criar Novo Usuário</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers?.map((user) => (
              <div key={user._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.username}</p>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Token: {user.token.slice(0, 12)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  {user.role !== 'ADMIN' && (
                    <Button variant="destructive" size="sm">
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            )) ?? (
              <div className="text-center py-8">
                <p>Carregando usuários...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
