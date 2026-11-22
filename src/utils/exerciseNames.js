
const EXERCISE_ALIASES = {
    'dumbell press': 'Dumbbell Press',
    'dumbbell press': 'Dumbbell Press',
    'bench press': 'Bench Press',
    'dumbbell row': 'Dumbbell Row',
    'lowbar squat': 'Low Bar Squat',
    'low bar squat': 'Low Bar Squat'
}

export function normalizeExerciseName(name) {
    if (!name || typeof name !== 'string') {
        return ''
    }

    const normalized = name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()

    return EXERCISE_ALIASES[normalized] ||
        name.trim().replace(/\s+/g, ' ')
}

export function getExerciseKey(name) {
    return normalizeExerciseName(name).toLowerCase()
}
