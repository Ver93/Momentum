
import { useState } from 'react'

const newExercise = () => ({
    id: crypto.randomUUID(),
    exercise_name: '',
    sets: [{ reps: '', weight: '' }]
})

export default function WorkoutLogForm({ onSave, onClose, saving }) {
    const [name, setName] = useState('')
    const [date, setDate] = useState(
        new Date().toLocaleDateString('en-CA')
    )
    const [exercises, setExercises] = useState([newExercise()])
    const [error, setError] = useState('')

    const updateExercise = (id, field, value) => {
        setExercises(current =>
            current.map(exercise =>
                exercise.id === id
                    ? { ...exercise, [field]: value }
                    : exercise
            )
        )
    }

    const addExercise = () => {
        setExercises(current => [...current, newExercise()])
    }

    const removeExercise = id => {
        setExercises(current =>
            current.filter(exercise => exercise.id !== id)
        )
    }

    const updateSet = (exerciseId, index, field, value) => {
        setExercises(current =>
            current.map(exercise =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set, i) =>
                            i === index
                                ? { ...set, [field]: value }
                                : set
                        )
                    }
                    : exercise
            )
        )
    }

    const addSet = id => {
        setExercises(current =>
            current.map(exercise =>
                exercise.id === id
                    ? {
                        ...exercise,
                        sets: [...exercise.sets, { reps: '', weight: '' }]
                    }
                    : exercise
            )
        )
    }

    const removeSet = (id, index) => {
        setExercises(current =>
            current.map(exercise =>
                exercise.id === id
                    ? {
                        ...exercise,
                        sets: exercise.sets.filter((_, i) => i !== index)
                    }
                    : exercise
            )
        )
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('Enter a workout name.')
            return
        }

        const validExercises = exercises.filter(
            exercise => exercise.exercise_name.trim()
        )

        if (!validExercises.length) {
            setError('Add at least one exercise.')
            return
        }

        for (const exercise of validExercises) {
            if (!exercise.sets.length || exercise.sets.some(set =>
                set.reps === '' ||
                !Number.isInteger(Number(set.reps)) ||
                Number(set.reps) <= 0 ||
                set.weight === '' ||
                !Number.isFinite(Number(set.weight)) ||
                Number(set.weight) < 0
            )) {
                setError(`Check sets for ${exercise.exercise_name}.`)
                return
            }
        }

        await onSave({
            workout_name: name.trim(),
            completed_at: new Date(`${date}T12:00:00`).toISOString(),
            duration_seconds: 0,
            exercises: validExercises.map(exercise => ({
                exercise_name: exercise.exercise_name.trim(),
                sets: exercise.sets.map(set => ({
                    reps: Number(set.reps),
                    weight: Number(set.weight)
                }))
            }))
        })
    }

    return (
        <div className="log-modal-overlay">
            <form className="log-form" onSubmit={handleSubmit}>
                <div className="log-form-header">
                    <h2>Add workout</h2>
                    <button type="button" onClick={onClose}>×</button>
                </div>

                <label>Workout name</label>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Push Day"
                    required
                />

                <label>Date</label>
                <input
                    type="date"
                    value={date}
                    max={new Date().toLocaleDateString('en-CA')}
                    onChange={e => setDate(e.target.value)}
                    required
                />

                <div className="log-exercises">
                    <h3>Exercises</h3>

                    {exercises.map((exercise, exerciseIndex) => (
                        <section className="log-exercise" key={exercise.id}>
                            <div className="log-exercise-header">
                                <span>Exercise {exerciseIndex + 1}</span>

                                {exercises.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeExercise(exercise.id)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <input
                                placeholder="Exercise name"
                                value={exercise.exercise_name}
                                onChange={e =>
                                    updateExercise(
                                        exercise.id,
                                        'exercise_name',
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <div className="log-set-labels">
                                <span>SET</span>
                                <span>REPS</span>
                                <span>WEIGHT (KG)</span>
                                <span />
                            </div>

                            {exercise.sets.map((set, index) => (
                                <div className="log-set-row" key={index}>
                                    <span>{index + 1}</span>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="10"
                                        value={set.reps}
                                        onChange={e =>
                                            updateSet(
                                                exercise.id,
                                                index,
                                                'reps',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="60"
                                        value={set.weight}
                                        onChange={e =>
                                            updateSet(
                                                exercise.id,
                                                index,
                                                'weight',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        disabled={exercise.sets.length === 1}
                                        onClick={() => removeSet(exercise.id, index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            <button
                                className="log-add-set"
                                type="button"
                                onClick={() => addSet(exercise.id)}
                            >
                                + Add set
                            </button>
                        </section>
                    ))}

                    <button
                        className="log-add-exercise"
                        type="button"
                        onClick={addExercise}
                    >
                        + Add exercise
                    </button>
                </div>

                {error && <p className="log-error">{error}</p>}

                <button
                    className="log-save-button"
                    type="submit"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save workout'}
                </button>
            </form>
        </div>
    )
}
