
export const createModule = type => ({
  id: crypto.randomUUID(),
  type,
  duration: type === 'work' ? 40 : 20,
  includeExercise: false,
  exerciseName: ''
})

export const createSequence = () => ({
  id: crypto.randomUUID(),
  rounds: 1,
  modules: [
    {
      id: crypto.randomUUID(),
      type: 'countdown',
      duration: 10,
      includeExercise: false,
      exerciseName: ''
    }
  ]
})

export const formatTime = seconds => {
  const total = Number(seconds) || 0

  const minutes = Math.floor(total / 60)
  const remaining = total % 60

  if (!minutes) return `${remaining}s`
  if (!remaining) return `${minutes} min`

  return `${minutes}m ${remaining}s`
}

export const getWorkoutStats = workoutOrSequences => {
  const sequences = Array.isArray(workoutOrSequences)
    ? workoutOrSequences
    : workoutOrSequences?.sequences || []

  let work = 0
  let rest = 0
  let modules = 0

  const timeline = []

  sequences.forEach(sequence => {
    const rounds = Math.max(1, Number(sequence.rounds) || 1)

    sequence.modules?.forEach(module => {
      const duration = Math.max(0, Number(module.duration) || 0)

      modules += rounds

      if (module.type === 'work') {
        work += duration * rounds
      } else if (module.type === 'rest') {
        rest += duration * rounds
      }

      for (let round = 0; round < rounds; round++) {
        timeline.push(module)
      }
    })
  })

  return {
    work,
    rest,
    total: work + rest,
    modules,
    totalWork: work,
    totalRest: rest,
    totalDuration: work + rest,
    totalModules: modules,
    timeline
  }
}

export const getTotalRounds = sequences => {
  return sequences.reduce(
    (total, sequence) =>
      total + (Number(sequence.rounds) || 1),
    0
  )
}

export const getTimelineModules = sequences => {
  return getWorkoutStats(sequences).timeline
}

export const prepareWorkoutData = (name, sequences) => ({
  name: name.trim(),

  sequences: sequences.map(sequence => ({
    ...sequence,

    rounds: Number(sequence.rounds),

    modules: sequence.modules.map(module => ({
      ...module,
      duration: Number(module.duration) || 0
    }))
  }))
})

export const validateWorkout = (name, sequences) => {
  if (!name.trim()) {
    return 'Workout name is required.'
  }

  if (!sequences.length) {
    return 'Add at least one block.'
  }

  if (
    sequences.some(sequence =>
      !sequence.modules.length ||
      !Number(sequence.rounds) ||
      Number(sequence.rounds) < 1
    )
  ) {
    return 'Every block needs at least one module and one round.'
  }

  return null
}
