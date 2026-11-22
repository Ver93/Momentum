
import { useCallback, useEffect, useState } from 'react'

import {
    getLogs,
    createLog,
    updateLog,
    deleteLog,
    linkWorkoutSeries
} from '../../services/logService'

import WorkoutLogForm from './WorkoutLogForm'
import './LogPage.css'

export default function LogPage({ session }) {
    const userId = session?.user?.id

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingLog, setEditingLog] = useState(null)
    const [repeatLog, setRepeatLog] = useState(null)
    const [error, setError] = useState('')
    const [expandedLogs, setExpandedLogs] = useState([])

    const loadLogs = useCallback(async () => {
        if (!userId) {
            setLogs([])
            setLoading(false)
            return
        }

        try {
            setError('')

            const data = await getLogs(userId)
            setLogs(data || [])
        } catch (err) {
            console.error('Load logs error:', err)
            setError('Could not load workout logs.')
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

const handleSave = async workout => {
    try {
        setSaving(true)
        setError('')

        const payload = {
            ...workout,
            user_id: userId
        }

        if (editingLog) {
            // Update existing workout
            await updateLog(editingLog.id, payload)

        } else {
            // Create new workout
            if (repeatLog) {
                const seriesId =
                    repeatLog.workout_id || repeatLog.id

                // Connect original workout to its series
                if (!repeatLog.workout_id) {
                    await linkWorkoutSeries(
                        repeatLog.id,
                        userId,
                        seriesId
                    )
                }

                // Connect new workout to the same series
                payload.workout_id = seriesId
                payload.previous_workout_id = repeatLog.id

            } else {
                // Completely new workout
                payload.workout_id = null
                payload.previous_workout_id = null
            }

            await createLog(payload)
        }

        // Reload logs from database
        const updatedLogs = await getLogs(userId)
        setLogs(updatedLogs || [])

        // Close form
        setShowForm(false)
        setEditingLog(null)
        setRepeatLog(null)

    } catch (err) {
        console.error('Save workout error:', err)
        setError(err.message || 'Could not save workout.')
        throw err

    } finally {
        setSaving(false)
    }
}
    const openNewWorkout = () => {
        setEditingLog(null)
        setRepeatLog(null)
        setError('')
        setShowForm(true)
    }

    const openEditWorkout = log => {
        setEditingLog(log)
        setRepeatLog(null)
        setError('')
        setShowForm(true)
    }

    const openRepeatWorkout = log => {
        setEditingLog(null)
        setRepeatLog(log)
        setError('')
        setShowForm(true)
    }

    const closeForm = () => {
        if (saving) return

        setShowForm(false)
        setEditingLog(null)
        setRepeatLog(null)
    }

    const toggleLog = id => {
        setExpandedLogs(current =>
            current.includes(id)
                ? current.filter(item => item !== id)
                : [...current, id]
        )
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this workout?')) return

        try {
            setError('')

            await deleteLog(id, userId)

            setLogs(current =>
                current.filter(log => log.id !== id)
            )

            setExpandedLogs(current =>
                current.filter(item => item !== id)
            )
        } catch (err) {
            console.error(err)
            setError('Could not delete workout.')
        }
    }

    if (loading) {
        return (
            <main className="log-page">
                <p className="log-loading">Loading...</p>
            </main>
        )
    }

    if (!userId) {
        return (
            <main className="log-page">
                <p className="log-error">
                    Please sign in to view your workouts.
                </p>
            </main>
        )
    }

    return (
        <main className="log-page">
            <header className="log-header">
                <div>
                    <h1>Workout Log</h1>

                    <p>
                        {logs.length}{' '}
                        {logs.length === 1
                            ? 'workout'
                            : 'workouts'} recorded
                    </p>
                </div>

                <button
                    className="log-add-button"
                    onClick={openNewWorkout}
                    aria-label="Add workout"
                >
                    +
                </button>
            </header>

            {error && (
                <p className="log-error">{error}</p>
            )}

            {showForm && (
                <WorkoutLogForm
                    key={
                        editingLog?.id ||
                        (repeatLog
                            ? `repeat-${repeatLog.id}`
                            : 'new-workout')
                    }
                    initialWorkout={editingLog || repeatLog}
                    isRepeat={Boolean(repeatLog)}
                    onSave={handleSave}
                    onClose={closeForm}
                    saving={saving}
                />
            )}

            {logs.length === 0 ? (
                <div className="log-empty">
                    <p>No workouts logged yet.</p>
                    <span>
                        Press + to add your first workout.
                    </span>
                </div>
            ) : (
                <div className="log-list">
                    {logs.map(log => {
                        const expanded =
                            expandedLogs.includes(log.id)

                        const exercises =
                            log.workout_exercises || []

                        const totalSets = exercises.reduce(
                            (sum, exercise) =>
                                sum + (exercise.sets?.length || 0),
                            0
                        )

                        const totalVolume = exercises.reduce(
                            (sum, exercise) =>
                                sum + (exercise.sets || []).reduce(
                                    (setSum, set) =>
                                        setSum +
                                        (Number(set.reps) || 0) *
                                        (Number(set.weight) || 0),
                                    0
                                ),
                            0
                        )

                        const seriesId = log.workout_id || log.id

                        const repeatedCount = logs.filter(item =>
                            item.id === seriesId ||
                            item.workout_id === seriesId
                        ).length

                        return (
                            <article
                                className={`log-card ${
                                    expanded ? 'expanded' : ''
                                }`}
                                key={log.id}
                            >
                                <button
                                    type="button"
                                    className="log-card-toggle"
                                    onClick={() =>
                                        toggleLog(log.id)
                                    }
                                    aria-expanded={expanded}
                                >
                                    <div className="log-card-info">
                                        <h3>{log.workout_name}</h3>

                                        <p>
                                            {new Date(
                                                log.completed_at
                                            ).toLocaleDateString()}
                                        </p>

                                        <div className="log-card-meta">
                                            <span>
                                                {exercises.length} exercises
                                            </span>

                                            <span>
                                                {totalSets} sets
                                            </span>

                                            {totalVolume > 0 && (
                                                <span>
                                                    {totalVolume.toLocaleString()} kg volume
                                                </span>
                                            )}

                                            {repeatedCount > 1 && (
                                                <span>
                                                    {repeatedCount} sessions
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="log-card-actions">
                                        <span className="log-chevron">
                                            {expanded ? '−' : '+'}
                                        </span>
                                    </div>
                                </button>

                                {expanded && (
                                    <div className="log-card-content">
                                        {exercises.length === 0 ? (
                                            <p className="log-no-exercises">
                                                No exercises recorded.
                                            </p>
                                        ) : (
                                            exercises.map(exercise => (
                                                <div
                                                    className="log-saved-exercise"
                                                    key={exercise.id}
                                                >
                                                    <strong>
                                                        {exercise.exercise_name}
                                                    </strong>

                                                    <div className="log-saved-sets">
                                                        {(exercise.sets || []).map(
                                                            (set, index) => (
                                                                <span key={index}>
                                                                    {index + 1}.{' '}
                                                                    {set.reps} reps ×{' '}
                                                                    {set.weight} kg
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        <div className="log-card-edit-actions">
                                            <button
                                                type="button"
                                                className="log-repeat-button"
                                                onClick={() =>
                                                    openRepeatWorkout(log)
                                                }
                                            >
                                                <span>↻</span>
                                                Repeat workout
                                            </button>

                                            <button
                                                type="button"
                                                className="log-edit-button"
                                                onClick={() =>
                                                    openEditWorkout(log)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="log-delete-button"
                                                onClick={() =>
                                                    handleDelete(log.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
