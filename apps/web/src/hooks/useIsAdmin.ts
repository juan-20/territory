'use client'

import { useQuery } from 'convex/react'
import { api } from '@territory/backend/convex/_generated/api'
import { useToken } from './useToken'

/**
 * Hook to check if the current user is an admin
 */
export function useIsAdmin() {
  const token = useToken()
  
  const tokenInfo = useQuery(
    api.auth.getTokenInfo,
    token ? { token } : "skip"
  )
  
  return {
    isAdmin: tokenInfo?.isAdmin ?? false,
    isLoading: tokenInfo === undefined && token !== null,
    userInfo: tokenInfo
  }
}
