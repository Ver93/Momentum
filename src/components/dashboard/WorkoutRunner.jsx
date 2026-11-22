
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../db/supabase'
import './WorkoutRunner.css'

export default function WorkoutRunner({ workout, onExit }) {

    // AUDIO FILES
    const audioPaths = {
        countdown: '/momentum/sounds/countdown.mp3',
        start: '/momentum/sounds/start.mp3',
        finish: '/momentum/sounds/finish.mp3'
    }

    // WEB AUDIO API
    const audioContextRef = useRef(null)
    const audioBuffersRef = useRef({})
    const activeSourceRef = useRef(null)
    const audioReadyRef = useRef(null)

    // INITIALIZE AUDIO AND PRELOAD BUFFERS
    useEffect(() => {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext

        if (!AudioContextClass) {
            console.error('Web Audio API is not supported.')
            return
        }

        const context = new AudioContextClass({
            latencyHint: 'interactive'
        })

        audioContextRef.current = context

        audioReadyRef.current = Promise.all(
            Object.entries(audioPaths).map(async ([name, path]) => {
                try {
                    const response = await fetch(path)

                    if (!response.ok) {
                        throw new Error(`Could not load ${path}`)
                    }

                    const arrayBuffer = await response.arrayBuffer()
                    const buffer = await context.decodeAudioData(arrayBuffer)

                    audioBuffersRef.current[name] = buffer

                } catch (error) {
                    console.error(`Audio loading failed (${name}):`, error)
                }
            })
        )

        return () => {
            if (activeSourceRef.current) {
                try {
                    activeSourceRef.current.stop()
                } catch {}
            }

            context.close()

            audioContextRef.current = null
            activeSourceRef.current = null
            audioBuffersRef.current = {}
        }
    }, [])

    // PLAY SOUND INSTANTLY
    const playSound = name => {
        const context = audioContextRef.current
        const buffer = audioBuffersRef.current[name]

        if (!context || !buffer || context.state !== 'running') {
            return
        }

        // Stop previous sound
        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop()
            } catch {}
        }

        // Create audio source from preloaded memory
        const source = context.createBufferSource()

        source.buffer = buffer
        source.connect(context.destination)

        activeSourceRef.current = source

        // Schedule immediately
        source.start(0)
    }

    // BUILD TIMELINE
    const steps = useMemo(() => {
        const timeline = []

        ;(workout.sequences || []).forEach((sequence, sequenceIndex) => {
            const rounds = Math.max(1, Number(sequence.rounds) || 1)

            for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
                ;(sequence.modules || []).forEach((module, moduleIndex) => {
                    const duration = Math.max(0, Number(module.duration) || 0)

                    if (duration <= 1) return

                    if (
                        module.type === 'countdown' &&
                        roundIndex > 0
                    ) {
                        return
                    }

                    timeline.push({
                        ...module,
                        duration,
                        sequenceIndex,
                        roundIndex,
                        moduleIndex,
                        key: `${sequenceIndex}-${roundIndex}-${moduleIndex}`
                    })
                })
            }
        })

        return timeline
    }, [workout])

    // STATE
    const [currentIndex, setCurrentIndex] = useState(0)
    const [remaining, setRemaining] = useState(steps[0]?.duration || 0)
    const [isRunning, setIsRunning] = useState(false)
    const [completed, setCompleted] = useState(false)

    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [hasSaved, setHasSaved] = useState(false)

    const current = steps[currentIndex]
    const next = steps[currentIndex + 1]

    const isLastStep = currentIndex === steps.length - 1

    // TIMER RESET
    useEffect(() => {
        setRemaining(steps[currentIndex]?.duration || 0)
    }, [currentIndex, steps])

    // SAVE WORKOUT
    const saveWorkoutLog = async () => {
        if (hasSaved || isSaving) return

        setIsSaving(true)
        setSaveError('')

        try {
            const duration = steps.reduce(
                (sum, step) => sum + step.duration,
                0
            )

            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser()

            if (userError) throw userError

            if (!user) {
                throw new Error('You must be logged in to save your workout.')
            }

            const { error } = await supabase
                .from('workout_logs')
                .insert({
                    user_id: user.id,
                    workout_name: workout.name,
                    duration_seconds: duration
                })

            if (error) throw error

            setHasSaved(true)
            setCompleted(true)
            setIsRunning(false)

        } catch (error) {
            console.error('Could not save workout:', error)
            setSaveError('Could not save workout. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    // FINISH WORKOUT
    const finishWorkout = () => {
        setIsRunning(false)
        playSound('finish')
        saveWorkoutLog()
    }

    // MOVE TO NEXT MODULE
    const advanceModule = () => {
        if (isLastStep) {
            finishWorkout()
            return
        }

        playSound('start')

        setCurrentIndex(index => index + 1)
    }

    // TIMER AND COUNTDOWN AUDIO
    useEffect(() => {
        if (!isRunning || completed || !current || isSaving) return

        const timer = setInterval(() => {

            if (remaining <= 1) {
                advanceModule()
                return
            }

            const nextRemaining = remaining - 1

            setRemaining(nextRemaining)

            // No countdown sounds on last module
            if (isLastStep) return

            // Countdown: sound every second
            if (current.type === 'countdown') {
                playSound('countdown')
                return
            }

            // Work / Rest: sound at 3, 2 and 1
            if ([3, 2, 1].includes(nextRemaining)) {
                playSound('countdown')
            }

        }, 1000)

        return () => clearInterval(timer)

    }, [
        isRunning,
        completed,
        currentIndex,
        current,
        remaining,
        isSaving,
        isLastStep
    ])

    // START / PAUSE
    const toggleTimer = async () => {
        if (completed || !current || isSaving) return

        if (isRunning) {
            setIsRunning(false)
            return
        }

        try {
            const context = audioContextRef.current

            // Unlock audio immediately from user interaction
            const resumePromise = context?.state === 'suspended'
                ? context.resume()
                : Promise.resolve()

            // Wait for audio files to finish decoding
            if (audioReadyRef.current) {
                await audioReadyRef.current
            }

            await resumePromise

            setIsRunning(true)

        } catch (error) {
            console.error('Could not initialize audio:', error)
            setIsRunning(true)
        }
    }

    // NEXT MODULE
    const skipNext = () => {
        if (isSaving || completed) return

        advanceModule()
    }

    // PREVIOUS MODULE
    const skipPrevious = () => {
        if (currentIndex <= 0 || isSaving) return

        setCurrentIndex(index => index - 1)
    }

    // RESTART
    const restart = () => {
        if (isSaving) return

        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop()
            } catch {}

            activeSourceRef.current = null
        }

        setIsRunning(false)
        setCurrentIndex(0)
        setRemaining(steps[0]?.duration || 0)
        setCompleted(false)
        setHasSaved(false)
        setSaveError('')
    }

    // FORMAT TIME
    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60

        return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
    }

    // MODULE NAME
    const getModuleName = module => {
        if (!module) return ''

        switch (module.type) {
            case 'work':
                return module.includeExercise && module.exerciseName
                    ? module.exerciseName
                    : 'Work'

            case 'rest':
                return 'Rest'

            case 'countdown':
                return 'Get Ready'

            default:
                return module.type || 'Module'
        }
    }

    // EMPTY WORKOUT
    if (!steps.length) {
        return (
            <main className="workout-runner">
                <button className="runner-back" onClick={onExit}>
                    ← Back
                </button>

                <div className="runner-empty">
                    <h2>No modules</h2>
                    <p>This workout has no timed modules.</p>
                </div>
            </main>
        )
    }

    // COMPLETED
    if (completed) {
        return (
            <main className="workout-runner">
                <div className="runner-completed">
                    <div className="runner-completed-icon">✓</div>

                    <h1>Workout complete!</h1>
                    <p>{workout.name}</p>

                    <p>Workout successfully saved!</p>

                    <button
                        className="runner-primary-button"
                        onClick={restart}
                    >
                        Run again
                    </button>

                    <button
                        className="runner-secondary-button"
                        onClick={onExit}
                    >
                        Back to dashboard
                    </button>
                </div>
            </main>
        )
    }

    // CURRENT MODULE
    const isWork = current.type === 'work'
    const isRest = current.type === 'rest'
    const isCountdown = current.type === 'countdown'

    const progress = current.duration > 0
        ? ((current.duration - remaining) / current.duration) * 100
        : 0

    return (
        <main className="workout-runner">

            <header className="runner-header">
                <button
                    className="runner-back"
                    onClick={() => {
                        if (window.confirm('Exit this workout?')) {
                            onExit()
                        }
                    }}
                >
                    ×
                </button>

                <div className="runner-workout-title">
                    <strong>{workout.name}</strong>
                    <span>
                        Module {currentIndex + 1} / {steps.length}
                    </span>
                </div>

                <button
                    className="runner-restart"
                    onClick={restart}
                >
                    ↻
                </button>
            </header>

            <div className="runner-progress">
                {steps.map((step, index) => (
                    <div
                        key={step.key}
                        className={`runner-progress-segment
                            ${index < currentIndex ? 'completed' : ''}
                            ${index === currentIndex ? 'current' : ''}
                            ${step.type}`}
                    />
                ))}
            </div>

            <section
                className={`runner-main ${
                    isWork
                        ? 'is-work'
                        : isRest
                            ? 'is-rest'
                            : 'is-countdown'
                }`}
            >
                <span className="runner-type">
                    {isWork
                        ? 'WORK'
                        : isRest
                            ? 'REST'
                            : isCountdown
                                ? 'COUNTDOWN'
                                : current.type.toUpperCase()}
                </span>

                <h1>{getModuleName(current)}</h1>

                <div className="runner-timer">
                    {formatTime(remaining)}
                </div>

                <div className="runner-timer-progress">
                    <div style={{ width: `${progress}%` }} />
                </div>

                <span className="runner-duration-label">
                    {!isRunning
                        ? 'Ready when you are'
                        : isWork
                            ? 'Stay focused'
                            : isRest
                                ? 'Take a breath'
                                : 'Get ready'}
                </span>
            </section>

            <section className="runner-next">
                <span>UP NEXT</span>

                {next ? (
                    <div className="runner-next-card">
                        <div className={`runner-next-dot ${next.type}`} />

                        <div>
                            <strong>{getModuleName(next)}</strong>
                            <span>
                                {next.type.toUpperCase()} · {formatTime(next.duration)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="runner-next-card">
                        <strong>Finish workout</strong>
                    </div>
                )}
            </section>

            {saveError && (
                <div className="runner-error">
                    <p>{saveError}</p>

                    <button
                        className="runner-primary-button"
                        onClick={saveWorkoutLog}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Try again'}
                    </button>
                </div>
            )}

            <footer className="runner-controls">
                <button
                    className="runner-secondary-button"
                    onClick={skipPrevious}
                    disabled={currentIndex === 0 || isSaving}
                >
                    ←
                </button>

                <button
                    className="runner-primary-button"
                    onClick={toggleTimer}
                    disabled={isSaving}
                >
                    {isSaving
                        ? 'Saving...'
                        : isRunning
                            ? 'Pause'
                            : 'Start'}
                </button>

                <button
                    className="runner-secondary-button"
                    onClick={skipNext}
                    disabled={isSaving}
                >
                    →
                </button>
            </footer>

            <button
                className="runner-exit"
                onClick={() => {
                    if (window.confirm('End this workout?')) {
                        onExit()
                    }
                }}
            >
                End workout
            </button>

        </main>
    )
}
