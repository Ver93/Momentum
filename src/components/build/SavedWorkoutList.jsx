
import SavedWorkoutCard from './SavedWorkoutCard'

export default function SavedWorkoutList({
  workouts,
  loading,
  deletingId,
  expandedId,
  onToggle,
  onEdit,
  onDelete
}) {
  return (
    <section className="saved-workouts">

      <div className="saved-workouts-heading">

        <div>
          <h2>My workouts</h2>
          <p>Your saved training plans</p>
        </div>

        <span className="workout-count">
          {workouts.length}
        </span>

      </div>

      {loading ? (
        <p>Loading workouts...</p>
      ) : workouts.length === 0 ? (

        <div className="workouts-empty">
          <strong>No workouts yet</strong>
          <p>Create your first workout above.</p>
        </div>

      ) : (

        <div className="saved-workout-list">

          {workouts.map(workout => (
            <SavedWorkoutCard
              key={workout.id}
              workout={workout}
              expanded={expandedId === workout.id}
              deleting={deletingId === workout.id}
              onToggle={() => onToggle(workout.id)}
              onEdit={() => onEdit(workout)}
              onDelete={() => onDelete(workout.id)}
            />
          ))}

        </div>

      )}

    </section>
  )
}
