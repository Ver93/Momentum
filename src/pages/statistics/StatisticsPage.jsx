
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
        const allProgression = buildProgression(
            logs,
            selectedExercise,
            selectedWorkout
        )

        if (allProgression.length < 1) {
            return {
                startWeight: 0,
                currentWeight: 0,
                increase: 0,
                percentage: 0
            }
        }

        const startWeight = allProgression[0].weight

        const currentWeight =
            allProgression[allProgression.length - 1].weight

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
    }, [logs, selectedExercise, selectedWorkout])


    const progressionIncrease = useMemo(() => {
        const allProgression = buildProgression(
            logs,
            selectedExercise,
            selectedWorkout
        )

        if (allProgression.length < 2) {
            return {
                reps: 0,
                weight: 0,
                sets: 0,
                volume: 0
            }
        }

        const first = allProgression[0]
        const latest = allProgression[allProgression.length - 1]

        return {
            reps: latest.reps - first.reps,
            weight: latest.weight - first.weight,
            sets: latest.sets - first.sets,
            volume: latest.volume - first.volume
        }
    }, [logs, selectedExercise, selectedWorkout])



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
                    {/* <span className="statistics-eyebrow">
                        PERFORMANCE OVERVIEW
                    </span> */}

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

                    {/* <StatisticsOverview
                        stats={stats}
                        weightProgress={weightProgress}
                    /> */}

                    <StatisticsOverview
                        stats={stats}
                        progressionIncrease={progressionIncrease}
                    />

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
