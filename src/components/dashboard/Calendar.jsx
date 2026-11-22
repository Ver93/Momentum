
import { useState } from 'react'
import './Calendar.css'

const WEEKDAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S']

export default function Calendar({ logs = [] }) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDate, setSelectedDate] = useState(null)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monday = new Date(today)
    monday.setDate(
        today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7
    )

    const formatDate = date => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    const getLogsForDate = date => {
        const dateString = formatDate(date)

        return logs.filter(log =>
            formatDate(new Date(log.completed_at)) === dateString
        )
    }

    const getWeekNumber = date => {
        const d = new Date(date)
        d.setDate(d.getDate() + 4 - (d.getDay() || 7))

        const yearStart = new Date(d.getFullYear(), 0, 1)

        return Math.ceil(
            (((d - yearStart) / 86400000) + 1) / 7
        )
    }

    const selectedLogs = selectedDate
        ? getLogsForDate(selectedDate)
        : []

    return (
        <section className="calendar">

            <header className="calendar-header">
                <div>
                    <h2>Activity</h2>
                    <span>Week {getWeekNumber(monday)}</span>
                </div>

                <div className="calendar-navigation">
                    <button
                        type="button"
                        onClick={() => {
                            setWeekOffset(v => v - 1)
                            setSelectedDate(null)
                        }}
                        aria-label="Previous week"
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        disabled={weekOffset >= 0}
                        onClick={() => {
                            setWeekOffset(v => v + 1)
                            setSelectedDate(null)
                        }}
                        aria-label="Next week"
                    >
                        ›
                    </button>
                </div>
            </header>

            <div className="calendar-days">
                {WEEKDAYS.map((day, index) => {
                    const date = new Date(monday)
                    date.setDate(monday.getDate() + index)

                    const isToday = date.getTime() === today.getTime()
                    const hasWorkout = getLogsForDate(date).length > 0

                    const isSelected =
                        selectedDate &&
                        formatDate(selectedDate) === formatDate(date)

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`calendar-day
                                ${isToday ? 'today' : ''}
                                ${isSelected ? 'selected' : ''}
                            `}
                            onClick={() => setSelectedDate(date)}
                            aria-pressed={!!isSelected}
                        >
                            <span className="calendar-day-name">
                                {day}
                            </span>

                            <span className="calendar-date">
                                {date.getDate()}
                            </span>

                            <span className={`calendar-indicator ${
                                hasWorkout ? 'completed' : ''
                            }`} />
                        </button>
                    )
                })}
            </div>

            {selectedDate && (
                <div className="calendar-details">

                    <div className="calendar-details-header">
                        <span>
                            {selectedDate.toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>

                        <button
                            type="button"
                            onClick={() => setSelectedDate(null)}
                        >
                            Close
                        </button>
                    </div>

                    {selectedLogs.length === 0 ? (
                        <p className="calendar-empty">
                            No activity recorded.
                        </p>
                    ) : (
                        <div className="calendar-log-list">
                            {selectedLogs.map(log => (
                                <article
                                    className="calendar-log"
                                    key={log.id}
                                >
                                    <div className="calendar-log-top">
                                        <strong>{log.workout_name}</strong>
                                        <span>
                                            {log.workout_exercises?.length || 0} exercises
                                        </span>
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
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </section>
    )
}
