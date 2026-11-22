
// import { useState } from 'react'
// import './SessionBuilder.css'

// const TYPES = [
//   { id: 'EMOM', description: 'Every Minute On the Minute' },
//   { id: 'AMRAP', description: 'As Many Rounds As Possible' },
//   { id: 'FOR TIME', description: 'Complete as fast as possible' },
//   { id: 'TABATA', description: 'Work and rest intervals' },
//   { id: 'STRENGTH', description: 'Traditional strength training' }
// ]

// function createSet() {
//   return {
//     id: crypto.randomUUID(),
//     reps: 10,
//     weight: 0
//   }
// }

// function createExercise() {
//   return {
//     id: crypto.randomUUID(),
//     name: '',
//     sets: [createSet()]
//   }
// }

// export default function SessionBuilder({ onClose, onCreate }) {
//   const [name, setName] = useState('')
//   const [type, setType] = useState('EMOM')
//   const [duration, setDuration] = useState(20)
//   const [rounds, setRounds] = useState(5)
//   const [work, setWork] = useState(20)
//   const [rest, setRest] = useState(10)
//   const [exercises, setExercises] = useState([
//     createExercise()
//   ])

//   function updateExercise(id, field, value) {
//     setExercises(prev =>
//       prev.map(ex =>
//         ex.id === id ? { ...ex, [field]: value } : ex
//       )
//     )
//   }

//   function updateSet(exerciseId, setId, field, value) {
//     setExercises(prev =>
//       prev.map(ex => {
//         if (ex.id !== exerciseId) return ex

//         return {
//           ...ex,
//           sets: ex.sets.map(set =>
//             set.id === setId
//               ? { ...set, [field]: value }
//               : set
//           )
//         }
//       })
//     )
//   }

//   function addExercise() {
//     setExercises(prev => [...prev, createExercise()])
//   }

//   function removeExercise(id) {
//     setExercises(prev => prev.filter(ex => ex.id !== id))
//   }

//   function addSet(exerciseId) {
//     setExercises(prev =>
//       prev.map(ex =>
//         ex.id === exerciseId
//           ? { ...ex, sets: [...ex.sets, createSet()] }
//           : ex
//       )
//     )
//   }

//   function removeSet(exerciseId, setId) {
//     setExercises(prev =>
//       prev.map(ex =>
//         ex.id === exerciseId
//           ? {
//               ...ex,
//               sets: ex.sets.filter(set => set.id !== setId)
//             }
//           : ex
//       )
//     )
//   }

//   function getDuration() {
//     if (type === 'EMOM' || type === 'AMRAP' || type === 'FOR TIME') {
//       return duration
//     }

//     if (type === 'TABATA') {
//       return Math.ceil(
//         (work + rest) * rounds * exercises.length / 60
//       )
//     }

//     return null
//   }

//   function handleSubmit(e) {
//     e.preventDefault()

//     const validExercises = exercises.filter(
//       ex => ex.name.trim() && ex.sets.length > 0
//     )

//     if (!name.trim() || validExercises.length === 0) return

//     onCreate({
//       name: name.trim(),
//       type,
//       duration: getDuration(),
//       rounds: type === 'STRENGTH' ? null : rounds,
//       work,
//       rest,
//       exercises: validExercises.map(ex => ({
//         ...ex,
//         name: ex.name.trim(),
//         sets: ex.sets.map(set => ({
//           ...set,
//           reps: Number(set.reps),
//           weight: Number(set.weight)
//         }))
//       }))
//     })
//   }

//   return (
//     <div className="builder-overlay">
//       <div className="builder-modal">

//         <header className="builder-header">
//           <div>
//             <span className="eyebrow">MOMENTUM / BUILDER</span>
//             <h2>Create workout</h2>
//             <p>Build your next training session.</p>
//           </div>

//           <button
//             type="button"
//             className="close-button"
//             onClick={onClose}
//           >
//             ×
//           </button>
//         </header>

//         <form onSubmit={handleSubmit}>

//           <div className="form-group">
//             <label>WORKOUT NAME</label>
//             <input
//               value={name}
//               onChange={e => setName(e.target.value)}
//               placeholder="e.g. Push Day"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>WORKOUT FORMAT</label>

//             <div className="workout-type-grid">
//               {TYPES.map(item => (
//                 <button
//                   type="button"
//                   key={item.id}
//                   className={`type-option ${
//                     type === item.id ? 'selected' : ''
//                   }`}
//                   onClick={() => setType(item.id)}
//                 >
//                   <strong>{item.id}</strong>
//                   <span>{item.description}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {type !== 'STRENGTH' && (
//             <div className="format-settings">
//               {type === 'EMOM' && (
//                 <div className="form-group">
//                   <label>NUMBER OF MINUTES</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="180"
//                     value={duration}
//                     onChange={e => setDuration(Number(e.target.value))}
//                   />
//                 </div>
//               )}

//               {type === 'AMRAP' && (
//                 <div className="form-group">
//                   <label>TIME CAP (MINUTES)</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="180"
//                     value={duration}
//                     onChange={e => setDuration(Number(e.target.value))}
//                   />
//                 </div>
//               )}

//               {type === 'FOR TIME' && (
//                 <div className="form-group">
//                   <label>TIME CAP (MINUTES)</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="180"
//                     value={duration}
//                     onChange={e => setDuration(Number(e.target.value))}
//                   />
//                 </div>
//               )}

//               {type === 'TABATA' && (
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>WORK (SEC)</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={work}
//                       onChange={e => setWork(Number(e.target.value))}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>REST (SEC)</label>
//                     <input
//                       type="number"
//                       min="0"
//                       value={rest}
//                       onChange={e => setRest(Number(e.target.value))}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>ROUNDS</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={rounds}
//                       onChange={e => setRounds(Number(e.target.value))}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <section className="exercise-section">
//             <div className="exercise-heading">
//               <div>
//                 <h3>Exercises</h3>
//                 <p>Configure every set individually.</p>
//               </div>
//               <span>{exercises.length} movements</span>
//             </div>

//             {exercises.map((exercise, index) => (
//               <article className="exercise-card" key={exercise.id}>
//                 <div className="exercise-card-heading">
//                   <span className="exercise-number">
//                     {String(index + 1).padStart(2, '0')}
//                   </span>

//                   <button
//                     type="button"
//                     className="remove-exercise"
//                     onClick={() => removeExercise(exercise.id)}
//                   >
//                     Remove ×
//                   </button>
//                 </div>

//                 <div className="form-group">
//                   <label>EXERCISE NAME</label>
//                   <input
//                     value={exercise.name}
//                     onChange={e =>
//                       updateExercise(exercise.id, 'name', e.target.value)
//                     }
//                     placeholder="e.g. Bench Press"
//                     required
//                   />
//                 </div>

//                 <div className="sets-heading">
//                   <span>SET</span>
//                   <span>REPS</span>
//                   <span>WEIGHT (KG)</span>
//                   <span></span>
//                 </div>

//                 {exercise.sets.map((set, setIndex) => (
//                   <div className="set-row" key={set.id}>
//                     <span className="set-number">
//                       {setIndex + 1}
//                     </span>

//                     <input
//                       aria-label={`Set ${setIndex + 1} reps`}
//                       type="number"
//                       min="1"
//                       value={set.reps}
//                       onChange={e =>
//                         updateSet(
//                           exercise.id,
//                           set.id,
//                           'reps',
//                           e.target.value
//                         )
//                       }
//                     />

//                     <input
//                       aria-label={`Set ${setIndex + 1} weight`}
//                       type="number"
//                       min="0"
//                       step="0.5"
//                       value={set.weight}
//                       onChange={e =>
//                         updateSet(
//                           exercise.id,
//                           set.id,
//                           'weight',
//                           e.target.value
//                         )
//                       }
//                     />

//                     <button
//                       type="button"
//                       className="remove-set"
//                       disabled={exercise.sets.length === 1}
//                       onClick={() => removeSet(exercise.id, set.id)}
//                       aria-label="Remove set"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}

//                 <button
//                   type="button"
//                   className="add-set-button"
//                   onClick={() => addSet(exercise.id)}
//                 >
//                   + Add set
//                 </button>
//               </article>
//             ))}

//             <button
//               type="button"
//               className="add-exercise-button"
//               onClick={addExercise}
//             >
//               + Add exercise
//             </button>
//           </section>

//           <div className="duration-preview">
//             <span>Estimated duration</span>
//             <strong>
//               {getDuration() === null
//                 ? 'Flexible'
//                 : `${getDuration()} min`}
//             </strong>
//           </div>

//           <button className="submit-session" type="submit">
//             Save workout →
//           </button>

//         </form>
//       </div>
//     </div>
//   )
// }
