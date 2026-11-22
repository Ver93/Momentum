
import { useMemo, useState } from 'react'
import './Calendar.css'

const WEEKDAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S']

const formatDate = date => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getWeekNumber = date => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))

    const yearStart = new Date(d.getFullYear(), 0, 1)

    return Math.ceil(
        (((d - yearStart) / 86400000) + 1) / 7
    )
}

export default function Calendar({ logs = [] }) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDate, setSelectedDate] = useState(null)

    const today = useMemo(() => {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        return date
    }, [])

    const monday = useMemo(() => {
        const date = new Date(today)

        date.setDate(
            today.getDate() -
            ((today.getDay() + 6) % 7) +
            weekOffset * 7
        )

        return date
    }, [today, weekOffset])

    const logsByDate = useMemo(() => {
        const grouped = new Map()

        logs.forEach(log => {
            if (!log.completed_at) return

            const dateKey = formatDate(
                new Date(log.completed_at)
            )

            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, [])
            }

            grouped.get(dateKey).push(log)
        })

        return grouped
    }, [logs])

    const weekDays = useMemo(() => {
        return WEEKDAYS.map((day, index) => {
            const date = new Date(monday)
            date.setDate(monday.getDate() + index)

            const dateKey = formatDate(date)

            return {
                day,
                date,
                dateKey,
                isToday: dateKey === formatDate(today),
                hasWorkout: (logsByDate.get(dateKey)?.length || 0) > 0
            }
        })
    }, [monday, today, logsByDate])

    const selectedLogs = selectedDate
        ? logsByDate.get(formatDate(selectedDate)) || []
        : []

    const formatDuration = seconds => {
        const minutes = Math.floor((Number(seconds) || 0) / 60)
        return `${minutes} min`
    }

    const formatTime = date => {
        return new Date(date).toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <section className="calendar">

            <header className="calendar-header">
                <div className="calendar-heading">
                    <h2>Activity</h2>
                    <p>Your training activity</p>
                </div>

                <div className="calendar-navigation">
                    <button
                        type="button"
                        onClick={() => {
                            setWeekOffset(value => value - 1)
                            setSelectedDate(null)
                        }}
                        aria-label="Previous week"
                    >
                        ‹
                    </button>

                    <span>Week {getWeekNumber(monday)}</span>

                    <button
                        type="button"
                        disabled={weekOffset >= 0}
                        onClick={() => {
                            setWeekOffset(value => value + 1)
                            setSelectedDate(null)
                        }}
                        aria-label="Next week"
                    >
                        ›
                    </button>
                </div>
            </header>

            <div className="calendar-days">
                {weekDays.map(item => {
                    const isSelected =
                        selectedDate &&
                        formatDate(selectedDate) === item.dateKey

                    return (
                        <button
                            key={item.dateKey}
                            type="button"
                            className={`calendar-day
                                ${item.isToday ? 'today' : ''}
                                ${isSelected ? 'selected' : ''}
                                ${item.hasWorkout ? 'has-workout' : ''}
                            `}
                            onClick={() => setSelectedDate(item.date)}
                            aria-pressed={!!isSelected}
                        >
                            <span className="calendar-day-name">
                                {item.day}
                            </span>

                            <span className="calendar-date">
                                {item.date.getDate()}
                            </span>

                            <span className="calendar-indicator" />
                        </button>
                    )
                })}
            </div>

            {selectedDate && (
                <div className="calendar-details">

                    <div className="calendar-details-header">
                        <div>
                            <h3>
                                {selectedDate.toLocaleDateString('en-GB', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </h3>

                            <span>
                                {selectedLogs.length} workout
                                {selectedLogs.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedDate(null)}
                            aria-label="Close details"
                        >
                            ×
                        </button>
                    </div>

                    {selectedLogs.length === 0 ? (
                        <div className="calendar-empty">
                            <span className="calendar-empty-icon">○</span>
                            <p>No activity recorded</p>
                            <span>Complete a workout to see it here.</span>
                        </div>
                    ) : (
                        <div className="calendar-log-list">
                            {selectedLogs.map(log => {
                                const exercises = log.workout_exercises || []

                                const totalSets = exercises.reduce(
                                    (total, exercise) =>
                                        total + (exercise.sets?.length || 0),
                                    0
                                )

                                return (
                                    <article
                                        className="calendar-log"
                                        key={log.id}
                                    >
                                        <div className="calendar-log-header">
                                            <div>
                                                <h4>{log.workout_name || 'Workout'}</h4>
                                                {/* <span>{formatTime(log.completed_at)}</span> */}
                                            </div>

                                            <div className="calendar-log-summary">
                                                <span>{exercises.length} exercises</span>
                                                <span>{totalSets} sets</span>

                                                {log.duration_seconds != null && (
                                                    <span>
                                                        {formatDuration(log.duration_seconds)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {exercises.length > 0 && (
                                            <div className="calendar-exercises">
                                                {exercises.map(exercise => (
                                                    <div
                                                        className="calendar-exercise"
                                                        key={exercise.id}
                                                    >
                                                        <strong>
                                                            {exercise.exercise_name}
                                                        </strong>

                                                        <div className="calendar-exercise-sets">
                                                            {(exercise.sets || []).map((set, index) => (
                                                                <div
                                                                    className="calendar-exercise-set"
                                                                    key={set.id || index}
                                                                >
                                                                    <span>Set {index + 1}</span>
                                                                    <span>{set.reps ?? 0} reps</span>
                                                                    <strong>{set.weight ?? 0} kg</strong>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            <footer className="calendar-footer">
                <span>
                    <i />
                    Training completed
                </span>
                <span>{logs.length} total workouts</span>
            </footer>

        </section>
    )
}
