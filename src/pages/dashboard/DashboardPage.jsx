
import { useState } from 'react'
import DashboardLayout from '../../layout/DashboardLayout'
import Calendar from '../../components/dashboard/Calendar'
import WorkoutRunner from '../../components/dashboard/WorkoutRunner'
import WorkoutCard from '../../components/dashboard/WorkoutCard'
import BuildPage from '../build/BuildPage'
import ProfilePage from '../profile/ProfilePage'
import LogPage from '../log/LogPage'
import StatisticsPage from '../statistics/StatisticsPage'
import useDashboard from '../../hooks/useDashboard'
import './DashboardPage.css'

function formatDate(date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function RecentWorkout({ log, expanded, onToggle }) {
  const exercises = Array.isArray(log.workout_exercises)
    ? log.workout_exercises
    : []

  const totalSets = exercises.reduce(
    (total, exercise) =>
      total + (Array.isArray(exercise.sets) ? exercise.sets.length : 0),
    0
  )

  const totalVolume = exercises.reduce((total, exercise) => {
    const sets = Array.isArray(exercise.sets) ? exercise.sets : []

    return total + sets.reduce((sum, set) => {
      return sum +
        (Number(set.reps) || 0) *
        (Number(set.weight) || 0)
    }, 0)
  }, 0)

  return (
    <article className={`recent-workout ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="recent-workout-toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="recent-workout-heading">
          <div className="recent-workout-title">
            <h3>{log.workout_name || 'Workout'}</h3>
            <span>{formatDate(log.completed_at)}</span>
          </div>

          <div className="recent-workout-summary">
            <span>{exercises.length} exercises</span>
            <span>{totalSets} sets</span>
            <span>{totalVolume.toLocaleString('sv-SE')} kg</span>
          </div>
        </div>

        <span className={`recent-workout-chevron ${expanded ? 'open' : ''}`}>
          ⌄
        </span>
      </button>

      {expanded && (
        <div className="recent-workout-details">
          {exercises.length === 0 ? (
            <p className="recent-workout-empty">
              No exercises recorded for this workout.
            </p>
          ) : (
            exercises.map((exercise, exerciseIndex) => {
              const sets = Array.isArray(exercise.sets)
                ? exercise.sets
                : []

              return (
                <div
                  className="recent-exercise"
                  key={exercise.id || `${exercise.exercise_name}-${exerciseIndex}`}
                >
                  <h4>{exercise.exercise_name}</h4>

                  {sets.length === 0 ? (
                    <p className="recent-exercise-empty">No sets recorded</p>
                  ) : (
                    <div className="recent-exercise-sets">
                      {sets.map((set, setIndex) => (
                        <div
                          className="recent-exercise-set"
                          key={set.id || setIndex}
                        >
                          <span className="recent-set-number">
                            Set {setIndex + 1}
                          </span>

                          <span>
                            {set.reps ?? 0} reps
                          </span>

                          <strong>
                            {set.weight ?? 0} kg
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </article>
  )
}

export default function DashboardPage({ session, onLogout }) {
  const [activePage, setActivePage] = useState('home')
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [expandedLogId, setExpandedLogId] = useState(null)

  const { workouts, logs, loading, error } = useDashboard(
    session.user.id,
    activePage
  )

  const username =
    session.user.user_metadata?.username ||
    session.user.email?.split('@')[0] ||
    'Athlete'

  function startWorkout(workout) {
    setSelectedWorkout(workout)
    setActivePage('run')
  }

  function exitWorkout() {
    setSelectedWorkout(null)
    setActivePage('home')
  }

  function navigateTo(page) {
    setSelectedWorkout(null)
    setActivePage(page)
  }

  const latestLogs = logs.slice(0, 5)

  return (
    <DashboardLayout
      username={username}
      activePage={activePage === 'run' ? 'home' : activePage}
      setActivePage={navigateTo}
      onLogout={onLogout}
    >
      {activePage === 'home' && (
        <main className="dashboard-page">
          <Calendar logs={logs} />

          <section className="dashboard-workouts">
            <div className="dashboard-section-heading">
              <div>
                <h2>My workouts</h2>
                <p>Your training library</p>
              </div>

              <span className="workout-count">{workouts.length}</span>
            </div>

            {loading ? (
              <div className="dashboard-empty">
                Loading workouts...
              </div>
            ) : error ? (
              <div className="dashboard-empty">{error}</div>
            ) : workouts.length === 0 ? (
              <div className="dashboard-empty">
                <strong>No workouts yet</strong>
                <p>Create your first workout in Build.</p>

                <button
                  type="button"
                  onClick={() => navigateTo('build')}
                >
                  Create workout
                </button>
              </div>
            ) : (
              <div className="dashboard-workout-list">
                {workouts.map(workout => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onUseWorkout={startWorkout}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-recent-logs">
            <div className="dashboard-section-heading">
              <div>
                <h2>Recent activity</h2>
                <p>Your latest completed workouts</p>
              </div>

              <button
                type="button"
                className="recent-logs-view-all"
                onClick={() => navigateTo('log')}
              >
                View all
                <span>→</span>
              </button>
            </div>

            {loading ? (
              <div className="dashboard-empty">
                Loading activity...
              </div>
            ) : latestLogs.length === 0 ? (
              <div className="dashboard-empty">
                <strong>No training history yet</strong>
                <p>Completed workouts will appear here.</p>
              </div>
            ) : (
              <div className="recent-workout-list">
                {latestLogs.map(log => (
                  <RecentWorkout
                    key={log.id}
                    log={log}
                    expanded={expandedLogId === log.id}
                    onToggle={() =>
                      setExpandedLogId(
                        expandedLogId === log.id ? null : log.id
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {activePage === 'build' && (
        <main className="dashboard-page">
          <BuildPage />
        </main>
      )}

      {activePage === 'run' && selectedWorkout && (
        <WorkoutRunner
          workout={selectedWorkout}
          onExit={exitWorkout}
        />
      )}

      {activePage === 'log' && (
        <main className="dashboard-page">
          <LogPage session={session} />
        </main>
      )}

      {activePage === 'statistics' && (
        <StatisticsPage session={session} />
      )}

      {activePage === 'profile' && (
        <ProfilePage
          session={session}
          onLogout={onLogout}
        />
      )}
    </DashboardLayout>
  )
}
