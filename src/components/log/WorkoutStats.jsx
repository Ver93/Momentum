export default function WorkoutStats({ logs }) {
  const totalWorkouts = logs.length

  const totalSeconds = logs.reduce(
    (sum, log) => sum + (log.duration_seconds || 0),
    0
  )

  const totalHours = (
    totalSeconds / 3600
  ).toFixed(1)

  return (
    <section className="log-stats">
      <div>
        <strong>{totalWorkouts}</strong>
        <span>Workouts</span>
      </div>

      <div>
        <strong>{totalHours}</strong>
        <span>Hours</span>
      </div>
    </section>
  )
}