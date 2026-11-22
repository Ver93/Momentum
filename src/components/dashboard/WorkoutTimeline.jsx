
export default function WorkoutTimeline({ timeline = [] }) {
  if (!timeline.length) {
    return (
      <div className="dashboard-no-modules">
        No modules added
      </div>
    )
  }

  return (
    <div className="workout-timeline">
      <div className="workout-timeline-track">
        {timeline.map((module, index) => (
          <div
            key={`${module.id}-${index}`}
            className={`workout-timeline-segment ${module.type}`}
            style={{
              flex: Math.max(1, Number(module.duration) || 1)
            }}
            title={`${module.type} · ${module.duration}s`}
          />
        ))}
      </div>
    </div>
  )
}
