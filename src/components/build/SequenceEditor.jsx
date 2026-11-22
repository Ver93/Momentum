
import ModuleEditor from './ModuleEditor'
import { createModule } from '../../utils/workoutUtils'

export default function SequenceEditor({
  sequence,
  onUpdate,
  onRemove
}) {
    const updateSequence = (field, value) => {
        onUpdate({
        ...sequence,
        [field]: value
        })
    }

    const updateModule = (moduleId, field, value) => {
        updateSequence(
        'modules',
        sequence.modules.map(module =>
            module.id === moduleId
            ? { ...module, [field]: value }
            : module
        )
        )
    }

    const addModule = type => {
        updateSequence('modules', [
        ...sequence.modules,
        createModule(type)
        ])
    }

    const removeModule = moduleId => {
    const module = sequence.modules.find(
        module => module.id === moduleId
    )

    if (!module || module.type === 'countdown') return

    updateSequence(
        'modules',
        sequence.modules.filter(module => module.id !== moduleId)
    )
    }

    const moveModule = (index, direction) => {
    const target = index + direction

    if (index === 0 || target <= 0) return
    if (target >= sequence.modules.length) return

    const modules = [...sequence.modules]

    ;[modules[index], modules[target]] = [
        modules[target],
        modules[index]
    ]

    updateSequence('modules', modules)
    }

  return (
    <section className="sequence">

      <div className="sequence-header">

        <div className="rounds-row">

          <label htmlFor={`rounds-${sequence.id}`}>
            Rounds
          </label>

          <input
            id={`rounds-${sequence.id}`}
            className="input rounds-input"
            type="number"
            inputMode="numeric"
            min="1"
            value={sequence.rounds}
            onChange={e =>
              updateSequence(
                'rounds',
                e.target.value === ''
                  ? ''
                  : Math.max(1, Number(e.target.value))
              )
            }
          />

        </div>

        <button
          type="button"
          className="icon-button delete-button"
          onClick={onRemove}
          aria-label="Remove block"
        >
          ×
        </button>

      </div>

      <div className="module-list">

        {sequence.modules.map((module, index) => (
          <ModuleEditor
            key={module.id}
            module={module}
            index={index}
            totalModules={sequence.modules.length}
            onUpdate={(field, value) =>
              updateModule(module.id, field, value)
            }
            onMove={direction =>
              moveModule(index, direction)
            }
            onRemove={() =>
              removeModule(module.id)
            }
          />
        ))}

      </div>

      <div className="add-module">

        <button
          type="button"
          className="add-work"
          onClick={() => addModule('work')}
        >
          + Work
        </button>

        <button
          type="button"
          className="add-rest"
          onClick={() => addModule('rest')}
        >
          + Rest
        </button>

      </div>

    </section>
  )
}
