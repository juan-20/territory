'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function parseCookie(cookieString: string) {
  return cookieString
    .split('; ')
    .find(row => row.startsWith('territory-token='))
    ?.split('=')[1]
}

/**
 * Hook to manage token state and handle redirects when token is missing
 */
export function useToken() {
  const [token, setTokenState] = useState<string | null>(() => {
    // Initialize from cookie on mount
    if (typeof document !== 'undefined') {
      return parseCookie(document.cookie) || null
    }
    return null
  })
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're not already on the auth page
    if (!token && !window.location.pathname.includes('/auth')) {
      router.replace('/auth')
    }
  }, [token, router])

  // Update token state if cookie changes
  useEffect(() => {
    const checkCookie = () => {
      const tokenFromCookie = parseCookie(document.cookie)
      setTokenState(tokenFromCookie || null)
    }

    // Check immediately
    checkCookie()

    // Check when window regains focus
    window.addEventListener('focus', checkCookie)
    return () => window.removeEventListener('focus', checkCookie)
  }, [])

  return token
}

/**
 * Get token on the server side
 */
export function getServerToken() {
  if (typeof document === 'undefined') return null
  return parseCookie(document.cookie)
}

/**
 * Clear the token from cookies
 */
export function clearToken() {
  document.cookie = 'territory-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

/**
 * Set a new token in cookies
 */
export function setToken(token: string) {
  document.cookie = `territory-token=${token}; path=/; max-age=31536000` // 1 year
}
