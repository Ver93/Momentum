
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

    return data || []
}

export async function createLog(log) {
    const { exercises, ...logData } = log

    const { data, error } = await supabase
        .from('workout_logs')
        .insert(logData)
        .select()
        .single()

    if (error) throw error

    try {
        if (exercises?.length) {
            const exerciseRows = exercises.map(exercise => ({
                workout_log_id: data.id,
                exercise_name: exercise.exercise_name,
                sets: exercise.sets
            }))

            const { error: exerciseError } = await supabase
                .from('workout_exercises')
                .insert(exerciseRows)

            if (exerciseError) throw exerciseError
        }
    } catch (err) {
        await supabase
            .from('workout_logs')
            .delete()
            .eq('id', data.id)
            .eq('user_id', logData.user_id)

        throw err
    }

    return data
}


export async function updateLog(logId, log) {
    const { exercises = [], user_id, ...logData } = log

    if (!user_id || !logId) {
        throw new Error('Missing workout or user ID.')
    }

    // 1. Update workout log
    const { data, error } = await supabase
        .from('workout_logs')
        .update(logData)
        .eq('id', logId)
        .eq('user_id', user_id)
        .select()
        .single()

    if (error) throw error

    // 2. Fetch existing exercises
    const { data: existingExercises, error: fetchError } =
        await supabase
            .from('workout_exercises')
            .select('id')
            .eq('workout_log_id', logId)

    if (fetchError) throw fetchError

    const existingIds = new Set(
        (existingExercises || []).map(exercise => exercise.id)
    )

    // 3. Identify existing exercises that should remain
    const submittedExistingIds = new Set(
        exercises
            .filter(exercise =>
                exercise.id && existingIds.has(exercise.id)
            )
            .map(exercise => exercise.id)
    )

    // 4. Delete removed exercises
    const idsToDelete = [...existingIds].filter(
        id => !submittedExistingIds.has(id)
    )

    if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from('workout_exercises')
            .delete()
            .eq('workout_log_id', logId)
            .in('id', idsToDelete)

        if (deleteError) throw deleteError
    }

    // 5. Update existing exercises or insert new ones
    for (const exercise of exercises) {
        const exerciseData = {
            exercise_name: exercise.exercise_name.trim(),
            sets: exercise.sets
        }

        if (
            exercise.id &&
            existingIds.has(exercise.id)
        ) {
            const { error: updateError } = await supabase
                .from('workout_exercises')
                .update(exerciseData)
                .eq('id', exercise.id)
                .eq('workout_log_id', logId)

            if (updateError) throw updateError

        } else {
            const { error: insertError } = await supabase
                .from('workout_exercises')
                .insert({
                    workout_log_id: logId,
                    ...exerciseData
                })

            if (insertError) throw insertError
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

export async function linkWorkoutSeries(
    logId,
    userId,
    workoutId
) {
    const { error } = await supabase
        .from('workout_logs')
        .update({ workout_id: workoutId })
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
