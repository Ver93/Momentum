
import { useEffect, useState } from 'react'
import { supabase } from '../db/supabase'
import { getLogs } from '../services/logService'

export default function useDashboard(userId, activePage) {
  const [workouts, setWorkouts] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activePage !== 'home') return

    async function loadDashboardData() {
      setLoading(true)
      setError('')

      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const workoutLogs = await getLogs(userId)

        setWorkouts(data || [])
        setLogs(workoutLogs || [])
      } catch (err) {
        console.error(err)
        setError('Could not load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadDashboardData()
    }
  }, [userId, activePage])

  return {
    workouts,
    logs,
    loading,
    error
  }
}
