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
  const initToken = useMutation(api.territory.initializeToken)

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
      // Initialize token in database first
      await initToken({ token: trimmedToken })
      
      // Store in cookies and ensure proper path and domain
      setCookieToken(trimmedToken)
      toast.success('Login realizado com sucesso!')
      
      // Give the browser time to set the cookie and middleware to recognize it
      router.refresh() // Refresh to update middleware state
      
      // Small delay to ensure cookie is set before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Use replace with shallow: false to ensure full page reload
      window.location.href = '/territories'
    } catch (err: any) {
      console.error('Authentication error:', err)
      
      if (err?.data?.message) {
        setError(err.data.message)
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('Erro ao validar o token. Por favor, tente novamente.')
      }
      
      toast.error('Falha na autenticação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Autenticação</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Digite o token de acesso"
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
      </Card>
    </div>
  )
}
