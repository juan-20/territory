'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@territory/backend/convex/_generated/api'
import { setToken as setCookieToken } from '@/hooks/useToken'
import { toast } from 'sonner'

export default function AuthPage() {
  const [tokenInput, setTokenInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const loginWithToken = useMutation(api.auth.loginWithToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedToken = tokenInput.trim()
    
    if (!trimmedToken) {
      setError('Por favor, digite o token de acesso')
      toast.error('Token não pode estar vazio')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      
      const result = await loginWithToken({ token: trimmedToken })
      
      
      setCookieToken(trimmedToken)
      
      if (result.isFirstUser) {
        toast.success(`Bem-vindo! Você é o primeiro administrador do sistema.`)
      } else {
        toast.success(`Bem-vindo, ${result.user.username}!`)
      }
      router.refresh()
      router.push('/territories')
      
      
    } catch (err: any) {
      console.error('Authentication error:', err)
      
      if (err?.message) {
        setError(err.message)
        toast.error(err.message)
      } else {
        setError('Erro ao validar o token. Por favor, tente novamente.')
        toast.error('Falha na autenticação')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Autenticação</h1>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Digite seu token de acesso
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Digite seu token de acesso"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full"
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
          <p>• Se é a primeira vez, qualquer token criará o administrador inicial</p>
          <p>• Se já existem usuários, use o token fornecido pelo administrador</p>
        </div>
      </Card>
    </div>
  )
}
