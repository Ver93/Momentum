
import { useEffect, useState } from 'react'
import { supabase } from '../db/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) console.error(error)

      setSession(data?.session ?? null)
      setLoading(false)
    }

    initialize()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, newSession) => {
        if (mounted) setSession(newSession)
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { session, loading, logout }
}
