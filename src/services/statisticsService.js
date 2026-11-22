
import { supabase } from '../db/supabase'

export async function getWorkoutStatistics(userId) {
    if (!userId) return []

    const { data, error } = await supabase
        .from('workout_logs')
        .select(`
            id,
            user_id,
            workout_id,
            workout_name,
            completed_at,
            duration_seconds,
            workout_exercises (
                id,
                exercise_name,
                sets
            )
        `)
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true })

    if (error) throw error

    return data || []
}
