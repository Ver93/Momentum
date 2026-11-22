
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
