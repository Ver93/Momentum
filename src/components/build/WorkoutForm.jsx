
import SequenceEditor from './SequenceEditor'
import { createSequence } from '../../utils/workoutUtils'

export default function WorkoutForm({
  name,
  sequences,
  editingId,
  saving,
  message,
  onNameChange,
  onSequencesChange,
  onSave,
  onCancel
}) {
  const addSequence = () => {
    onSequencesChange([
      ...sequences,
      createSequence()
    ])
  }

  const updateSequence = updatedSequence => {
    onSequencesChange(
      sequences.map(sequence =>
        sequence.id === updatedSequence.id
          ? updatedSequence
          : sequence
      )
    )
  }

  const removeSequence = id => {
    onSequencesChange(
      sequences.filter(sequence => sequence.id !== id)
    )
  }

  const canSave =
    name.trim() &&
    sequences.length > 0 &&
    !saving

  return (
    <section className="builder-section">

      <div className="section-heading">
        <h2>
          {editingId ? 'Edit workout' : 'New workout'}
        </h2>
      </div>

      <div className="build-name">

        <label htmlFor="workout-name">
          Workout name
        </label>

        <input
          id="workout-name"
          className="input workout-name-input"
          placeholder="Name your workout"
          value={name}
          onChange={e => onNameChange(e.target.value)}
        />

      </div>

      <div className="sequences">

        {sequences.map(sequence => (
          <SequenceEditor
            key={sequence.id}
            sequence={sequence}
            onUpdate={updateSequence}
            onRemove={() => removeSequence(sequence.id)}
          />
        ))}

      </div>

      <button
        type="button"
        className="add-sequence"
        onClick={addSequence}
      >
        + Add block
      </button>

      <div className="build-save">

        <button
          type="button"
          className="btn btn-primary"
          disabled={!canSave}
          onClick={onSave}
        >
          {saving
            ? 'Saving...'
            : editingId
              ? 'Update workout'
              : 'Save workout'}
        </button>

        {editingId && (
          <button
            type="button"
            className="cancel-edit"
            onClick={onCancel}
          >
            Cancel editing
          </button>
        )}

        {message && (
          <p className="save-message" role="status">
            {message}
          </p>
        )}

      </div>

    </section>
  )
}
