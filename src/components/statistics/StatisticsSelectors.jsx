
export default function StatisticsSelectors({
    exercises,
    selectedExercise,
    setSelectedExercise,
    workoutOptions,
    selectedWorkout,
    setSelectedWorkout
}) {
    return (
        <section className="statistics-selectors">
            <div className="statistics-selector">
                <label htmlFor="exercise-select">
                    Exercise
                </label>

                <select
                    id="exercise-select"
                    value={selectedExercise}
                    onChange={e => setSelectedExercise(e.target.value)}
                >
                    {!exercises.length && (
                        <option value="">No exercises available</option>
                    )}

                    {exercises.map(exercise => (
                        <option key={exercise} value={exercise}>
                            {exercise}
                        </option>
                    ))}
                </select>
            </div>

            <div className="statistics-selector">
                <label htmlFor="workout-select">
                    Workout
                </label>

                <select
                    id="workout-select"
                    value={selectedWorkout}
                    onChange={e => setSelectedWorkout(e.target.value)}
                    disabled={!workoutOptions.length}
                >
                    {!workoutOptions.length && (
                        <option value="">No workouts available</option>
                    )}

                    {workoutOptions.map(workout => (
                        <option key={workout.value} value={workout.value}>
                            {workout.label}
                        </option>
                    ))}
                </select>
            </div>
        </section>
    )
}
