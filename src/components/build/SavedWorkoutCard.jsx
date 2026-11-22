
import WorkoutDetails from './WorkoutDetails'

import {
  formatTime,
  getWorkoutStats,
  getTimelineModules
} from '../../utils/workoutUtils'

export default function SavedWorkoutCard({
  workout,
  expanded,
  deleting,
  onToggle,
  onEdit,
  onDelete
}) {
  const sequences = workout.sequences || []

  const stats = getWorkoutStats(sequences)

  const timelineModules = getTimelineModules(sequences)

  return (
    <article
      className={`saved-workout ${expanded ? 'expanded' : ''}`}
    >

      <button
        type="button"
        className="saved-workout-main"
        onClick={onToggle}
        aria-expanded={expanded}
      >

        <div className="saved-workout-top">

          <div className="saved-workout-title">
            <strong>{workout.name}</strong>

            <span>
              {sequences.length} blocks
              {' · '}
              {stats.modules} modules
            </span>
          </div>

          <span className="expand-icon">
            {expanded ? '−' : '+'}
          </span>

        </div>

        <div className="workout-timeline">

          {timelineModules.map((module, index) => (
            <div
              key={`${module.id}-${index}`}
              className={`timeline-segment ${module.type}`}
              style={{
                flex: Math.max(
                  Number(module.duration) || 0,
                  0.5
                )
              }}
            />
          ))}

        </div>

        <div className="saved-workout-stats">

          <div className="workout-legend">

            <span className="legend-work">
              <i /> Work
            </span>

            <span className="legend-rest">
              <i /> Rest
            </span>

          </div>

          <span className="workout-duration">
            {formatTime(stats.total)}
          </span>

        </div>

      </button>

      {expanded && (
        <>
          <WorkoutDetails sequences={sequences} />

          <div className="saved-workout-actions">

            <button
              type="button"
              className="edit-workout-button"
              onClick={onEdit}
            >
              Edit workout
            </button>

            <button
              type="button"
              className="delete-workout-button"
              disabled={deleting}
              onClick={onDelete}
            >
              {deleting ? '...' : 'Delete'}
            </button>

          </div>
        </>
      )}

    </article>
  )
}
