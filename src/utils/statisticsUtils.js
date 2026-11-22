
import {
    normalizeExerciseName,
    getExerciseKey
} from './exerciseNames'

// FILTER BY PERIOD

export function filterLogsByPeriod(logs, period) {
    if (period === 'all') return logs

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - Number(period))

    return logs.filter(log =>
        new Date(log.completed_at) >= cutoff
    )
}

// GET UNIQUE EXERCISES

export function getUniqueExercises(logs) {
    const exercises = new Map()

    logs.forEach(log => {
        (log.workout_exercises || []).forEach(exercise => {
            const name = normalizeExerciseName(
                exercise.exercise_name
            )

            if (!name) return

            exercises.set(getExerciseKey(name), name)
        })
    })

    return [...exercises.values()].sort((a, b) =>
        a.localeCompare(b)
    )
}

// GET WORKOUT OPTIONS

export function getWorkoutOptions(logs, selectedExercise) {
    if (!selectedExercise) return []

    const options = new Map()
    const selectedKey = getExerciseKey(selectedExercise)

    logs.forEach(log => {
        const hasExercise = (
            log.workout_exercises || []
        ).some(exercise =>
            getExerciseKey(exercise.exercise_name) === selectedKey
        )

        if (!hasExercise) return

        const id = log.workout_id
            ? `id:${log.workout_id}`
            : `name:${(log.workout_name || 'Unnamed workout').toLowerCase()}`

        if (!options.has(id)) {
            options.set(id, {
                value: id,
                label: log.workout_name || 'Unnamed workout'
            })
        }
    })

    return [...options.values()].sort((a, b) =>
        a.label.localeCompare(b.label)
    )
}

// GET CURRENT WORKOUT

export function getCurrentWorkout(options, selectedWorkout) {
    return options.find(workout =>
        workout.value === selectedWorkout
    ) || null
}

// BUILD EXERCISE PROGRESSION


export function buildProgression(
    logs,
    selectedExercise,
    selectedWorkout
) {
    if (!selectedExercise || !selectedWorkout) return []

    const result = []
    const selectedKey = getExerciseKey(selectedExercise)

    logs.forEach(log => {
        const workoutKey = log.workout_id
            ? `id:${log.workout_id}`
            : `name:${(log.workout_name || 'Unnamed workout').toLowerCase()}`

        if (workoutKey !== selectedWorkout) return

        const entries = (log.workout_exercises || []).filter(
            exercise =>
                getExerciseKey(exercise.exercise_name) === selectedKey
        )

        if (!entries.length) return

        const allSets = entries.flatMap(exercise =>
            Array.isArray(exercise.sets) ? exercise.sets : []
        )

        const validSets = allSets.map(set => ({
            reps: Math.max(0, Number(set.reps) || 0),
            weight: Math.max(0, Number(set.weight) || 0)
        })).filter(set => set.reps > 0)

        if (!validSets.length) return

        const totalReps = validSets.reduce(
            (sum, set) => sum + set.reps,
            0
        )

        const totalVolume = validSets.reduce(
            (sum, set) => sum + set.reps * set.weight,
            0
        )

        const maxWeight = Math.max(
            ...validSets.map(set => set.weight)
        )

        const averageWeight = validSets.reduce(
            (sum, set) => sum + set.weight,
            0
        ) / validSets.length

        result.push({
            id: log.id,
            date: log.completed_at,

            label: new Date(log.completed_at).toLocaleDateString(
                'en-GB',
                { day: 'numeric', month: 'short' }
            ),

            sets: validSets.length,
            reps: totalReps,
            weight: maxWeight,
            averageWeight,
            volume: totalVolume
        })
    })

    return result.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    )
}

export function calculateStatistics(progression) {
    if (!progression.length) {
        return {
            sessions: 0,
            bestWeight: 0,
            latestWeight: 0,
            firstWeight: 0,
            weightIncrease: 0,
            totalSets: 0,
            totalReps: 0,
            totalVolume: 0,
            bestVolume: 0,
            bestReps: 0,
            averageWeight: 0
        }
    }

    const firstWeight = progression[0].weight
    const latestWeight = progression[progression.length - 1].weight

    const totalSets = progression.reduce(
        (sum, item) => sum + item.sets,
        0
    )

    const totalReps = progression.reduce(
        (sum, item) => sum + item.reps,
        0
    )

    const totalVolume = progression.reduce(
        (sum, item) => sum + item.volume,
        0
    )

    const totalWeightedSets = progression.reduce(
        (sum, item) => sum + item.averageWeight * item.sets,
        0
    )

    return {
        sessions: progression.length,

        bestWeight: Math.max(
            ...progression.map(item => item.weight)
        ),

        latestWeight,
        firstWeight,
        weightIncrease: latestWeight - firstWeight,

        totalSets,
        totalReps,
        totalVolume,

        bestVolume: Math.max(
            ...progression.map(item => item.volume)
        ),

        bestReps: Math.max(
            ...progression.map(item => item.reps)
        ),

        averageWeight: totalSets
            ? totalWeightedSets / totalSets
            : 0
    }
}


// FORMATTERS

export function formatNumber(value) {
    return Math.round(value).toLocaleString('en-GB')
}

export function formatWeight(value) {
    return `${Number(value.toFixed(2))} kg`
}

export function formatVolume(value) {
    return `${formatNumber(value)} kg`
}
