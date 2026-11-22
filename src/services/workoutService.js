
import { supabase } from '../db/supabase'

const getCurrentUser = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error('You must be logged in.')

  return user
}

// Fetch all workouts belonging to the current user
export const getWorkouts = async () => {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

// Create a new workout
export const createWorkout = async workoutData => {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('workouts')
    .insert({
      ...workoutData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  return data
}

// Update an existing workout
export const updateWorkout = async (id, workoutData) => {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('workouts')
    .update(workoutData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  return data
}

// Delete a workout
export const deleteWorkout = async id => {
  const user = await getCurrentUser()

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}
