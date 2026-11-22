export default function WorkoutLogCard({ log }) {
  return (
    <article className="log-card">
      <h3>{log.workout_name}</h3>

      <p>
        {new Date(log.completed_at).toLocaleDateString()}
      </p>

      <p>
        Duration: {log.duration_seconds}s
      </p>
    </article>
  )
}