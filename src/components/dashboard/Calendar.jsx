
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

    // Group logs by calendar date
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

    return (
        <section className="calendar">

            {/* HEADER */}

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

            {/* WEEK DAYS */}

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

            {/* SELECTED DATE */}

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
                            <span className="calendar-empty-icon">
                                <span>○</span>
                            </span>

                            <p>No activity recorded</p>
                            <span>Complete/log a workout to see it here.</span>
                        </div>
                    ) : (
                        <div className="calendar-log-list">
                            {selectedLogs.map(log => (
                                <article
                                    className="calendar-log"
                                    key={log.id}
                                >
                                    <div className="calendar-log-icon">
                                        <span>✓</span>
                                    </div>

                                    <div className="calendar-log-content">
                                        <div className="calendar-log-top">
                                            <strong>
                                                {log.workout_name}
                                            </strong>

                                            <span className="calendar-log-status">
                                                Completed
                                            </span>
                                        </div>

                                        <div className="calendar-log-meta">
                                            <span>
                                                {log.workout_exercises?.length || 0} exercises
                                            </span>

                                            {log.duration_seconds != null && (
                                                <>
                                                    <span className="calendar-meta-dot" />
                                                    <span>
                                                        {formatDuration(log.duration_seconds)}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {log.workout_exercises?.length > 0 && (
                                            <div className="calendar-exercises">
                                                {log.workout_exercises.map(exercise => (
                                                    <div key={exercise.id}>
                                                        <span>
                                                            {exercise.exercise_name}
                                                        </span>

                                                        <small>
                                                            {exercise.sets?.length || 0} sets
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </section>
    )
}
