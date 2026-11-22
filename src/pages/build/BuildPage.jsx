
import { useState } from 'react'

import WorkoutForm from '../../components/build/WorkoutForm'
import SavedWorkoutList from '../../components/build/SavedWorkoutList'

import useWorkouts from '../../hooks/useWorkouts'

import {
  prepareWorkoutData,
  validateWorkout
} from '../../utils/workoutUtils'

import './BuildPage.css'

export default function BuildPage() {
  const {
    workouts,
    loading,
    saving,
    deletingId,
    error,
    setError,
    saveWorkout,
    removeWorkout
  } = useWorkouts()

  // Form state
  const [name, setName] = useState('')
  const [sequences, setSequences] = useState([])

  // UI state
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [message, setMessage] = useState('')

  // Reset form
  const resetForm = () => {
    setName('')
    setSequences([])
    setEditingId(null)
    setMessage('')
    setError('')
  }

  // Save workout
  const handleSave = async () => {
    if (saving) return

    const validationError = validateWorkout(name, sequences)

    if (validationError) {
      setMessage(validationError)
      return
    }

    setMessage('')
    setError('')

    try {
      const workoutData = prepareWorkoutData(
        name,
        sequences
      )

      const savedWorkout = await saveWorkout(
        workoutData,
        editingId
      )

      setName('')
      setSequences([])
      setEditingId(null)
      setExpandedId(savedWorkout.id)
      setMessage('Workout saved!')

    } catch (err) {
      setMessage(
        err.message || 'Could not save workout.'
      )
    }
  }

  // Edit workout
  const handleEdit = workout => {
    setEditingId(workout.id)
    setName(workout.name)
    setSequences(workout.sequences || [])
    setExpandedId(workout.id)
    setMessage('')
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Delete workout
  const handleDelete = async id => {
    if (!window.confirm('Delete this workout?')) return

    setMessage('')
    setError('')

    try {
      await removeWorkout(id)

      if (editingId === id) {
        resetForm()
      }

      if (expandedId === id) {
        setExpandedId(null)
      }

    } catch (err) {
      setMessage(
        err.message || 'Could not delete workout.'
      )
    }
  }

  // Toggle workout details
  const handleToggle = id => {
    setExpandedId(current =>
      current === id ? null : id
    )
  }

  return (
    <main className="build-page">

      <header className="build-header">
        <div>
          <h1>Build</h1>
          <p>Create your own workout</p>
        </div>
      </header>

      <WorkoutForm
        name={name}
        sequences={sequences}
        editingId={editingId}
        saving={saving}
        message={message}
        onNameChange={setName}
        onSequencesChange={setSequences}
        onSave={handleSave}
        onCancel={resetForm}
      />

      {error && !message && (
        <p className="save-message" role="alert">
          {error}
        </p>
      )}

      <SavedWorkoutList
        workouts={workouts}
        loading={loading}
        deletingId={deletingId}
        expandedId={expandedId}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </main>
  )
}
