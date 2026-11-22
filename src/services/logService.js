
import { supabase } from '../db/supabase'

export async function getLogs(userId) {
    const { data, error } = await supabase
        .from('workout_logs')
        .select(`
            *,
            workout_exercises (
                id,
                exercise_name,
                sets
            )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createLog(log) {
    const { exercises, ...logData } = log

    const { data, error } = await supabase
        .from('workout_logs')
        .insert(logData)
        .select()
        .single()

    if (error) throw error

    if (exercises?.length) {
        const exerciseRows = exercises.map(exercise => ({
            workout_log_id: data.id,
            exercise_name: exercise.exercise_name,
            sets: exercise.sets
        }))

        const { error: exerciseError } = await supabase
            .from('workout_exercises')
            .insert(exerciseRows)

        if (exerciseError) {
            // Roll back the parent log if exercise insertion fails
            await supabase
                .from('workout_logs')
                .delete()
                .eq('id', data.id)
                .eq('user_id', logData.user_id)

            throw exerciseError
        }
    }

    return data
}

export async function deleteLog(logId, userId) {
    const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', userId)

    if (error) throw error
}

export async function deleteAllLogs(userId) {
    const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('user_id', userId)

    if (error) throw error
}
