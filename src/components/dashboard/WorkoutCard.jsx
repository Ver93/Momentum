
import { useState } from 'react'
import WorkoutTimeline from './WorkoutTimeline'
import { getWorkoutStats, formatTime } from '../../utils/workoutUtils'

export default function WorkoutCard({ workout, onUseWorkout }) {
  const [expanded, setExpanded] = useState(false)
  const stats = getWorkoutStats(workout)

  return (
    <article className={`dashboard-workout-card ${expanded ? 'expanded' : ''}`}>

      <button
        type="button"
        className="workout-card-header"
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
      >
        <div className="workout-card-main">
          <h3>{workout.name}</h3>
          <span>{stats.totalModules} modules</span>
        </div>

        <div className="workout-card-summary">
          <strong>{formatTime(stats.totalDuration)}</strong>
          <span className={`workout-card-chevron ${expanded ? 'open' : ''}`}>
            ⌄
          </span>
        </div>
      </button>

      {expanded && (
        <div className="workout-card-details">

          <WorkoutTimeline timeline={stats.timeline} />

          <div className="workout-card-stats">
            <div>
              <span>WORK</span>
              <strong>{formatTime(stats.totalWork)}</strong>
            </div>

            <div>
              <span>REST</span>
              <strong>{formatTime(stats.totalRest)}</strong>
            </div>

            <div>
              <span>MODULES</span>
              <strong>{stats.totalModules}</strong>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-use-button"
            disabled={!stats.totalModules}
            onClick={() => onUseWorkout(workout)}
          >
            Start workout
            <span>→</span>
          </button>

        </div>
      )}

    </article>
  )
}
