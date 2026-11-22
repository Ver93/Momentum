
import { formatTime } from '../../utils/workoutUtils'

export default function WorkoutDetails({
  sequences
}) {
  const work = sequences.reduce((total, sequence) => {
    const rounds = Number(sequence.rounds) || 1

    return total + (sequence.modules || []).reduce(
      (sum, module) =>
        sum + (
          module.type === 'work'
            ? (Number(module.duration) || 0) * rounds
            : 0
        ),
      0
    )
  }, 0)

  const rest = sequences.reduce((total, sequence) => {
    const rounds = Number(sequence.rounds) || 1

    return total + (sequence.modules || []).reduce(
      (sum, module) =>
        sum + (
          module.type === 'rest'
            ? (Number(module.duration) || 0) * rounds
            : 0
        ),
      0
    )
  }, 0)

  const totalRounds = sequences.reduce(
    (total, sequence) =>
      total + (Number(sequence.rounds) || 1),
    0
  )

  return (
    <div className="workout-details">

      <div className="detail-stats">

        <div>
          <strong>{formatTime(work)}</strong>
          <span>Work</span>
        </div>

        <div>
          <strong>{formatTime(rest)}</strong>
          <span>Rest</span>
        </div>

        <div>
          <strong>{totalRounds}</strong>
          <span>Rounds</span>
        </div>

      </div>

      <div className="detail-module-list">

        {sequences.map((sequence, index) => (
          <div
            className="detail-sequence"
            key={sequence.id || index}
          >

            <div className="detail-sequence-header">
              <strong>Block {index + 1}</strong>
              <span>{sequence.rounds} rounds</span>
            </div>

            {(sequence.modules || []).map((module, moduleIndex) => (
              <div
                className="detail-module"
                key={module.id || moduleIndex}
              >

                <span className={`detail-dot ${module.type}`} />

                <div className="detail-module-name">
                  <strong>
                    {module.type === 'work'
                      ? module.includeExercise && module.exerciseName
                        ? module.exerciseName
                        : 'Work'
                      : 'Rest'}
                  </strong>
                </div>

                <span className="detail-duration">
                  {formatTime(module.duration)}
                </span>

              </div>
            ))}

          </div>
        ))}

      </div>

    </div>
  )
}
