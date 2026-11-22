
import { useCallback, useEffect, useState } from 'react'
import {
    getLogs,
    createLog,
    deleteLog
} from '../../services/logService'

import WorkoutLogForm from './WorkoutLogForm'
import './LogPage.css'

export default function LogPage({ session }) {
    const userId = session?.user?.id

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')
    const [expandedLogs, setExpandedLogs] = useState([])

    const loadLogs = useCallback(async () => {
        try {
            setError('')
            const data = await getLogs(userId)
            setLogs(data || [])
        } catch (err) {
            console.error(err)
            setError('Could not load workout logs.')
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (userId) loadLogs()
    }, [userId, loadLogs])

    const handleSave = async workout => {
        try {
            setSaving(true)
            setError('')

            await createLog({
                ...workout,
                user_id: userId
            })

            setShowForm(false)
            await loadLogs()
        } catch (err) {
            console.error(err)
            setError('Could not save workout.')
        } finally {
            setSaving(false)
        }
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

    const totalWorkouts = logs.length

    return (
        <main className="log-page">

            <header className="log-header">
                <div>
                    <h1>Workout Log</h1>
                    <p>
                        {totalWorkouts} {totalWorkouts === 1 ? 'workout' : 'workouts'} recorded
                    </p>
                </div>

                <button
                    className="log-add-button"
                    onClick={() => {
                        setError('')
                        setShowForm(true)
                    }}
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
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                    saving={saving}
                />
            )}

            {logs.length === 0 ? (
                <div className="log-empty">
                    <p>No workouts logged yet.</p>
                    <span>Press + to add your first workout.</span>
                </div>
            ) : (
                <div className="log-list">

                    {logs.map(log => {
                        const expanded = expandedLogs.includes(log.id)
                        const exercises = log.workout_exercises || []

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

                        return (
                            <article
                                className={`log-card ${expanded ? 'expanded' : ''}`}
                                key={log.id}
                            >
                                <button
                                    type="button"
                                    className="log-card-toggle"
                                    onClick={() => toggleLog(log.id)}
                                    aria-expanded={expanded}
                                >
                                    <div className="log-card-info">
                                        <h3>{log.workout_name}</h3>

                                        <p>
                                            {new Date(log.completed_at)
                                                .toLocaleDateString()}
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
                                                        {exercise.sets?.map((set, index) => (
                                                            <span key={index}>
                                                                {index + 1}. {set.reps} reps × {set.weight} kg
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        <button
                                            className="log-delete-button"
                                            onClick={() => handleDelete(log.id)}
                                        >
                                            Delete workout
                                        </button>
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
