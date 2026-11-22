import WorkoutLogCard from './WorkoutLogCard'

export default function WorkoutLogList({ logs }) {
  return (
    <section>
      {logs.map(log => (
        <WorkoutLogCard
          key={log.id}
          log={log}
        />
      ))}
    </section>
  )
}