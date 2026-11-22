
export default function ModuleEditor({
  module,
  index,
  totalModules,
  onUpdate,
  onMove,
  onRemove
}) {
  const isWork = module.type === 'work'
  const isRest = module.type === 'rest'
  const isCountdown = module.type === 'countdown'

  return (
    <article className={`module-card module-${module.type}`}>

      <div className="module-header">

        <span className={`module-badge ${module.type}`}>
          {isCountdown
            ? 'COUNTDOWN'
            : isWork
              ? 'WORK'
              : 'REST'}
        </span>

        {!isCountdown && (
          <div className="module-actions">

            <button
              type="button"
              className="icon-button"
              disabled={index <= 1}
              onClick={() => onMove(-1)}
              aria-label="Move up"
            >
              ↑
            </button>

            <button
              type="button"
              className="icon-button"
              disabled={index === totalModules - 1}
              onClick={() => onMove(1)}
              aria-label="Move down"
            >
              ↓
            </button>

            <button
              type="button"
              className="icon-button delete-button"
              onClick={onRemove}
              aria-label="Remove module"
            >
              ×
            </button>

          </div>
        )}

      </div>

      <div className="module-controls">

        <div className="duration-field">

          <label>Duration</label>

          <div className="duration-input-wrapper">

            <input
              className="input duration-input"
              type="number"
              inputMode="numeric"
              min="0"
              value={module.duration}
              onChange={e =>
                onUpdate(
                  'duration',
                  e.target.value === ''
                    ? ''
                    : Math.max(0, Number(e.target.value))
                )
              }
            />

            <span>sec</span>

          </div>

        </div>

        {isWork && (
          <label className="exercise-toggle">

            <input
              type="checkbox"
              checked={!!module.includeExercise}
              onChange={e =>
                onUpdate(
                  'includeExercise',
                  e.target.checked
                )
              }
            />

            <span>Exercise</span>

          </label>
        )}

        {isWork && module.includeExercise && (
          <input
            className="input exercise-name-input"
            placeholder="Exercise name"
            value={module.exerciseName || ''}
            onChange={e =>
              onUpdate(
                'exerciseName',
                e.target.value
              )
            }
          />
        )}

      </div>

    </article>
  )
}
