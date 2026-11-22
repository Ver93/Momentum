
import { useEffect, useMemo, useState } from 'react'

import useStatistics from '../../hooks/useStatistics'

import StatisticsFilters from '../../components/statistics/StatisticsFilters'
import StatisticsSelectors from '../../components/statistics/StatisticsSelectors'
import StatisticsOverview from '../../components/statistics/StatisticsOverview'
import StatisticsCharts from '../../components/statistics/StatisticsCharts'
import StatisticsHistory from '../../components/statistics/StatisticsHistory'
import StatisticsEmpty from '../../components/statistics/StatisticsEmpty'

import {
    filterLogsByPeriod,
    getUniqueExercises,
    getWorkoutOptions,
    getCurrentWorkout,
    buildProgression,
    calculateStatistics
} from '../../utils/statisticsUtils'

import './StatisticsPage.css'

export default function StatisticsPage({ session }) {
    const userId = session?.user?.id

    const {
        logs,
        loading,
        error
    } = useStatistics(userId)

    const [period, setPeriod] = useState('all')
    const [selectedExercise, setSelectedExercise] = useState('')
    const [selectedWorkout, setSelectedWorkout] = useState('')

    // UNIQUE EXERCISES

    const exercises = useMemo(
        () => getUniqueExercises(logs),
        [logs]
    )

    // AUTOMATIC EXERCISE SELECTION

    useEffect(() => {
        if (!exercises.includes(selectedExercise)) {
            setSelectedExercise(exercises[0] || '')
        }
    }, [exercises, selectedExercise])

    // WORKOUT OPTIONS

    const workoutOptions = useMemo(
        () => getWorkoutOptions(logs, selectedExercise),
        [logs, selectedExercise]
    )

    // AUTOMATIC WORKOUT SELECTION

    useEffect(() => {
        if (!workoutOptions.some(
            workout => workout.value === selectedWorkout
        )) {
            setSelectedWorkout(workoutOptions[0]?.value || '')
        }
    }, [workoutOptions, selectedWorkout])

    // CURRENT WORKOUT

    const currentWorkout = useMemo(
        () => getCurrentWorkout(workoutOptions, selectedWorkout),
        [workoutOptions, selectedWorkout]
    )

    // FILTER BY PERIOD

    const filteredLogs = useMemo(
        () => filterLogsByPeriod(logs, period),
        [logs, period]
    )

    // BUILD PROGRESSION

    const progression = useMemo(
        () => buildProgression(
            filteredLogs,
            selectedExercise,
            selectedWorkout
        ),
        [filteredLogs, selectedExercise, selectedWorkout]
    )

    // GENERAL STATISTICS

    const stats = useMemo(
        () => calculateStatistics(progression),
        [progression]
    )

    // ABSOLUTE WEIGHT PROGRESSION

    const weightProgress = useMemo(() => {
        if (!progression.length) {
            return {
                startWeight: 0,
                currentWeight: 0,
                increase: 0,
                percentage: 0
            }
        }

        const sorted = [...progression].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        )

        const startWeight = Number(sorted[0].weight) || 0

        const currentWeight = Number(
            sorted[sorted.length - 1].weight
        ) || 0

        const increase = currentWeight - startWeight

        const percentage = startWeight > 0
            ? (increase / startWeight) * 100
            : 0

        return {
            startWeight,
            currentWeight,
            increase,
            percentage
        }
    }, [progression])

    // FORMATTERS

    const formatWeight = value =>
        `${Number(value.toFixed(2))} kg`

    // LOADING

    if (loading) {
        return (
            <main className="statistics-page">
                <p className="statistics-loading">
                    Loading statistics...
                </p>
            </main>
        )
    }

    // ERROR

    if (error) {
        return (
            <main className="statistics-page">
                <p className="statistics-error">{error}</p>
            </main>
        )
    }

    // AUTHENTICATION

    if (!userId) {
        return (
            <main className="statistics-page">
                <p className="statistics-error">
                    Please sign in to view statistics.
                </p>
            </main>
        )
    }

    // PAGE

    return (
        <main className="statistics-page">

            <header className="statistics-header">
                <div>
                    <span className="statistics-eyebrow">
                        PERFORMANCE OVERVIEW
                    </span>

                    <h1>Statistics</h1>

                    <p>
                        Track your exercise progression and performance.
                    </p>
                </div>
            </header>

            {/* PERIOD FILTER */}

            <StatisticsFilters
                period={period}
                setPeriod={setPeriod}
            />

            {/* SELECTORS */}

            <StatisticsSelectors
                exercises={exercises}
                selectedExercise={selectedExercise}
                setSelectedExercise={setSelectedExercise}
                workoutOptions={workoutOptions}
                selectedWorkout={selectedWorkout}
                setSelectedWorkout={setSelectedWorkout}
            />

            {/* EMPTY STATE */}

            {progression.length === 0 ? (
                <StatisticsEmpty />
            ) : (
                <>

                    {/* EXERCISE HEADER */}

                    <section className="statistics-exercise-header">
                        <div>
                            <span className="statistics-eyebrow">
                                EXERCISE PROGRESSION
                            </span>

                            <h2>{selectedExercise}</h2>

                            <p>{currentWorkout?.label}</p>

                            <span className="statistics-session-count">
                                {stats.sessions} recorded sessions
                            </span>
                        </div>
                    </section>

                    {/* OVERVIEW */}

                    <StatisticsOverview
                        stats={stats}
                        weightProgress={weightProgress}
                    />

                    {/* WEIGHT INCREASE */}

                    <section className="statistics-section">
                        <div className="statistics-section-heading">
                            <div>
                                <h2>Absolute weight increase</h2>
                                <p>
                                    Difference between your first and latest
                                    recorded session
                                </p>
                            </div>
                        </div>

                        <div className="statistics-grid">

                            <article className="statistics-card">
                                <p>Starting weight</p>
                                <h2>
                                    {formatWeight(
                                        weightProgress.startWeight
                                    )}
                                </h2>
                            </article>

                            <article className="statistics-card">
                                <p>Current weight</p>
                                <h2>
                                    {formatWeight(
                                        weightProgress.currentWeight
                                    )}
                                </h2>
                            </article>

                            <article className="statistics-card">
                                <p>Total increase</p>
                                <h2>
                                    {weightProgress.increase > 0 ? '+' : ''}
                                    {formatWeight(
                                        weightProgress.increase
                                    )}
                                </h2>
                            </article>

                            <article className="statistics-card">
                                <p>Percentage increase</p>
                                <h2>
                                    {weightProgress.percentage > 0 ? '+' : ''}
                                    {weightProgress.percentage.toFixed(1)}%
                                </h2>
                            </article>

                        </div>
                    </section>

                    {/* PROGRESSION CHARTS */}

                    <StatisticsCharts
                        progression={progression}
                    />

                    {/* EXERCISE HISTORY */}

                    <StatisticsHistory
                        progression={progression}
                        workoutName={currentWorkout?.label}
                    />

                </>
            )}

        </main>
    )
}
