'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useMutation } from 'convex/react'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from '@/hooks/useToken'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    username: '',
    newUserToken: '',
    role: 'USER' as 'ADMIN' | 'USER'
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const token = useToken()
  
  const createUser = useMutation(api.auth.createUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Token de autenticação não encontrado')
      return
    }

    if (!formData.username.trim()) {
      toast.error('Nome de usuário é obrigatório')
      return
    }

    if (!formData.newUserToken.trim()) {
      toast.error('Token do usuário é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      await createUser({
        token,
        newUserToken: formData.newUserToken.trim(),
        username: formData.username.trim(),
        role: formData.role
      })
      
      toast.success('Usuário criado com sucesso!')
      router.push('/admin/users')
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err)
      toast.error(err.message || 'Erro ao criar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Digite o nome do usuário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUserToken">Token do Usuário</Label>
              <Input
                id="newUserToken"
                type="text"
                value={formData.newUserToken}
                onChange={(e) => setFormData(prev => ({ ...prev, newUserToken: e.target.value }))}
                placeholder="Digite o token único do usuário"
                required
              />
              <p className="text-xs text-muted-foreground">
                Este token será usado pelo usuário para fazer login no sistema
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'ADMIN' | 'USER' }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {formData.role === 'ADMIN' 
                  ? 'Administradores podem gerenciar usuários e territórios' 
                  : 'Usuários podem apenas visualizar e atualizar territórios'
                }
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Criando...' : 'Criar Usuário'}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
