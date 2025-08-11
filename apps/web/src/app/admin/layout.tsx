'use client'

import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, isLoading } = useIsAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/territories')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>Verificando permissões...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Você não tem permissão para acessar esta área.</p>
            <Link href="/territories">
              <Button>Voltar para Territórios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Administração</h1>
        <nav className="flex space-x-4">
          <Link href="/admin">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost">Gerenciar Usuários</Button>
          </Link>
          <Link href="/admin/users/create">
            <Button variant="ghost">Criar Usuário</Button>
          </Link>
          <Link href="/admin/territories">
            <Button variant="ghost">Rastreamento de Edições</Button>
          </Link>
          <Link href="/territories">
            <Button variant="outline">Voltar aos Territórios</Button>
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
