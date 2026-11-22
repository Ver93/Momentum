
import { useEffect, useState } from 'react'
import { supabase } from '../../db/supabase'
import { getLogs } from '../../services/logService'

import DashboardLayout from '../../layout/DashboardLayout'
import Calendar from '../../components/dashboard/Calendar'
import BuildPage from '../build/BuildPage'
import WorkoutRunner from '../../components/dashboard/WorkoutRunner'
import ProfilePage from '../profile/ProfilePage'
import LogPage from '../log/LogPage'
import StatisticsPage from '../statistics/StatisticsPage'

import './DashboardPage.css'

export default function DashboardPage({ session, onLogout }) {
    const [activePage, setActivePage] = useState('home')
    const [workouts, setWorkouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedWorkout, setSelectedWorkout] = useState(null)
    const [logs, setLogs] = useState([])

    const username =
        session.user.user_metadata?.username ||
        session.user.email?.split('@')[0] ||
        'Athlete'

    // Load dashboard data
    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true)
            setError('')

            try {
                const { data, error } = await supabase
                    .from('workouts')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error

                setWorkouts(data || [])

                const workoutLogs = await getLogs(session.user.id)
                setLogs(workoutLogs || [])

            } catch (err) {
                console.error(err)
                setError('Could not load dashboard data.')
            } finally {
                setLoading(false)
            }
        }

        if (activePage === 'home') {
            loadDashboardData()
        }
    }, [session.user.id, activePage])

    // Calculate workout information
    const getWorkoutStats = workout => {
        let totalDuration = 0
        let totalModules = 0
        let totalWork = 0
        let totalRest = 0

        const timeline = []

        ;(workout.sequences || []).forEach(sequence => {
            const rounds = Math.max(1, Number(sequence.rounds) || 1)

            for (let round = 0; round < rounds; round++) {
                ;(sequence.modules || []).forEach(module => {
                    const duration = Math.max(
                        0,
                        Number(module.duration) || 0
                    )

                    timeline.push(module)
                    totalDuration += duration
                    totalModules += 1

                    if (module.type === 'work') {
                        totalWork += duration
                    } else {
                        totalRest += duration
                    }
                })
            }
        })

        return {
            timeline,
            totalDuration,
            totalModules,
            totalWork,
            totalRest
        }
    }

    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60)
        const remaining = seconds % 60

        return `${minutes}:${String(remaining).padStart(2, '0')}`
    }

    const startWorkout = workout => {
        setSelectedWorkout(workout)
        setActivePage('run')
    }

    const exitWorkout = () => {
        setSelectedWorkout(null)
        setActivePage('home')
    }

    return (
        <DashboardLayout
            username={username}
            activePage={activePage === 'run' ? 'home' : activePage}
            setActivePage={page => {
                setSelectedWorkout(null)
                setActivePage(page)
            }}
            onLogout={onLogout}
        >

            {/* HOME */}

            {activePage === 'home' && (
                <main className="dashboard-page">

                    <Calendar logs={logs} />

                    <section className="dashboard-workouts">

                        <div className="dashboard-section-heading">
                            <div>
                                <h2>My workouts</h2>
                                <p>Your training library</p>
                            </div>

                            <span className="workout-count">
                                {workouts.length}
                            </span>
                        </div>

                        {loading ? (
                            <div className="dashboard-empty">
                                Loading workouts...
                            </div>
                        ) : error ? (
                            <div className="dashboard-empty">
                                {error}
                            </div>
                        ) : workouts.length === 0 ? (
                            <div className="dashboard-empty">
                                <strong>No workouts yet</strong>
                                <p>Create your first workout in Build.</p>

                                <button
                                    type="button"
                                    onClick={() => setActivePage('build')}
                                >
                                    Create workout
                                </button>
                            </div>
                        ) : (
                            <div className="dashboard-workout-list">

                                {workouts.map(workout => {
                                    const stats = getWorkoutStats(workout)

                                    return (
                                        <article
                                            className="dashboard-workout-card"
                                            key={workout.id}
                                        >

                                            <div className="dashboard-workout-top">
                                                <div>
                                                    <h3>{workout.name}</h3>
                                                    <span>
                                                        {stats.totalModules} modules
                                                    </span>
                                                </div>

                                                <span className="dashboard-workout-time">
                                                    {formatTime(stats.totalDuration)}
                                                </span>
                                            </div>

                                            {stats.timeline.length > 0 ? (
                                                <div className="dashboard-timeline">
                                                    {stats.timeline.map((module, index) => (
                                                        <div
                                                            key={`${module.id}-${index}`}
                                                            className={`dashboard-timeline-segment ${
                                                                module.type === 'work'
                                                                    ? 'work'
                                                                    : 'rest'
                                                            }`}
                                                            style={{
                                                                flex: Math.max(
                                                                    1,
                                                                    Number(module.duration) || 1
                                                                )
                                                            }}
                                                            title={`${module.type} - ${module.duration}s`}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="dashboard-no-modules">
                                                    No modules added
                                                </div>
                                            )}

                                            <div className="dashboard-workout-info">
                                                <div className="dashboard-legend">
                                                    <span>
                                                        <i className="legend-work-dot" />
                                                        Work {formatTime(stats.totalWork)}
                                                    </span>

                                                    <span>
                                                        <i className="legend-rest-dot" />
                                                        Rest {formatTime(stats.totalRest)}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className="dashboard-use-button"
                                                disabled={!stats.timeline.length}
                                                onClick={() => startWorkout(workout)}
                                            >
                                                Use workout
                                                <span>→</span>
                                            </button>

                                        </article>
                                    )
                                })}

                            </div>
                        )}

                    </section>

                </main>
            )}

            {/* BUILD */}

            {activePage === 'build' && (
                <main className="dashboard-page">
                    <BuildPage />
                </main>
            )}

            {/* WORKOUT RUNNER */}

            {activePage === 'run' && selectedWorkout && (
                <WorkoutRunner
                    workout={selectedWorkout}
                    onExit={exitWorkout}
                />
            )}

            {/* LOG */}

            {activePage === 'log' && (
                <main className="dashboard-page">
                    <LogPage session={session} />
                </main>
            )}

            {/* STATISTICS */}

            {activePage === 'statistics' && (
                <StatisticsPage session={session} />
            )}

            {/* PROFILE */}

            {activePage === 'profile' && (
                <ProfilePage
                    session={session}
                    onLogout={onLogout}
                />
            )}

        </DashboardLayout>
    )
}
