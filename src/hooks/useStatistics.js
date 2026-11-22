
import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../db/supabase'
import { getWorkoutStatistics } from '../services/statisticsService'

export default function useStatistics(userId) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadStatistics = useCallback(async (showLoading = false) => {
        if (!userId) {
            setLogs([])
            setLoading(false)
            return
        }

        try {
            if (showLoading) setLoading(true)

            setError('')

            const data = await getWorkoutStatistics(userId)

            setLogs(data)
        } catch (err) {
            console.error('Statistics error:', err)
            setError('Could not load statistics.')
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (!userId) {
            setLogs([])
            setLoading(false)
            return
        }

        loadStatistics(true)

        const channel = supabase
            .channel(`statistics-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'workout_logs',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    loadStatistics()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'workout_exercises'
                },
                () => {
                    loadStatistics()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, loadStatistics])

    return {
        logs,
        loading,
        error,
        refreshStatistics: loadStatistics
    }
}
