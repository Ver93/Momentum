
import { useCallback, useEffect, useState } from 'react'

import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout
} from '../services/workoutService'

export default function useWorkouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const loadWorkouts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getWorkouts()

      setWorkouts(data)

      return data
    } catch (err) {
      setError(err.message || 'Could not load workouts.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorkouts().catch(() => {})
  }, [loadWorkouts])

  const saveWorkout = async (workoutData, editingId = null) => {
    setSaving(true)
    setError('')

    try {
      const savedWorkout = editingId
        ? await updateWorkout(editingId, workoutData)
        : await createWorkout(workoutData)

      setWorkouts(current => {
        const updated = editingId
          ? current.map(workout =>
              workout.id === savedWorkout.id
                ? savedWorkout
                : workout
            )
          : [savedWorkout, ...current]

        return updated.sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
      })

      return savedWorkout
    } catch (err) {
      setError(err.message || 'Could not save workout.')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const removeWorkout = async id => {
    setDeletingId(id)
    setError('')

    try {
      await deleteWorkout(id)

      setWorkouts(current =>
        current.filter(workout => workout.id !== id)
      )
    } catch (err) {
      setError(err.message || 'Could not delete workout.')
      throw err
    } finally {
      setDeletingId(null)
    }
  }

  return {
    workouts,
    loading,
    saving,
    deletingId,
    error,
    setError,
    loadWorkouts,
    saveWorkout,
    removeWorkout
  }
}
