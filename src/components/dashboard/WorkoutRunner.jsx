
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

    // AUDIO REFERENCES
    const audioRef = useRef({})
    const activeAudioRef = useRef(null)
    const audioReadyRef = useRef(false)
    const audioUnlockedRef = useRef(false)

    // TIMER REFERENCES
    const endTimeRef = useRef(null)
    const lastSecondRef = useRef(null)
    const wakeLockRef = useRef(null)

    const completedRef = useRef(false)
    const runningRef = useRef(false)
    const currentIndexRef = useRef(0)
    const isSavingRef = useRef(false)

    // PRELOAD AUDIO
    useEffect(() => {
        let mounted = true

        Object.entries(audioPaths).forEach(([name, path]) => {
            const audio = new Audio(path)

            audio.preload = 'auto'
            audio.load()

            audioRef.current[name] = audio
        })

        const preloadAudio = async () => {
            const players = Object.values(audioRef.current)

            await Promise.all(
                players.map(audio => {
                    if (audio.readyState >= 3) {
                        return Promise.resolve()
                    }

                    return new Promise(resolve => {
                        const done = () => resolve()

                        audio.addEventListener('canplaythrough', done, {
                            once: true
                        })

                        audio.addEventListener('error', done, {
                            once: true
                        })

                        setTimeout(done, 5000)
                    })
                })
            )

            if (mounted) {
                audioReadyRef.current = true
            }
        }

        preloadAudio()

        return () => {
            mounted = false

            Object.values(audioRef.current).forEach(audio => {
                audio.pause()
                audio.removeAttribute('src')
                audio.load()
            })

            audioRef.current = {}
        }
    }, [])

    // UNLOCK AUDIO
    const unlockAudio = async () => {
        if (audioUnlockedRef.current) return

        const players = Object.values(audioRef.current)

        try {
            await Promise.all(
                players.map(async audio => {
                    audio.muted = true
                    audio.currentTime = 0

                    try {
                        await audio.play()
                        audio.pause()
                        audio.currentTime = 0
                    } catch (error) {
                        console.warn('Audio unlock failed:', error)
                    }

                    audio.muted = false
                })
            )

            audioUnlockedRef.current = true

        } catch (error) {
            console.warn('Could not unlock audio:', error)
        }
    }

    // PLAY SOUND
    const playSound = name => {
        const audio = audioRef.current[name]

        if (!audio) return

        if (
            activeAudioRef.current &&
            activeAudioRef.current !== audio
        ) {
            activeAudioRef.current.pause()
            activeAudioRef.current.currentTime = 0
        }

        audio.pause()

        try {
            audio.currentTime = 0
        } catch {}

        activeAudioRef.current = audio

        const promise = audio.play()

        if (promise) {
            promise.catch(error => {
                console.warn(`Could not play ${name}:`, error)
            })
        }
    }

    // WAKE LOCK
    const requestWakeLock = async () => {
        if (!('wakeLock' in navigator)) return

        try {
            wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (error) {
            console.warn('Wake Lock unavailable:', error)
        }
    }

    const releaseWakeLock = async () => {
        if (!wakeLockRef.current) return

        try {
            await wakeLockRef.current.release()
        } catch {}

        wakeLockRef.current = null
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

                    if (module.type === 'countdown' && roundIndex > 0) {
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

    // KEEP REFS UPDATED
    useEffect(() => {
        runningRef.current = isRunning
    }, [isRunning])

    useEffect(() => {
        currentIndexRef.current = currentIndex
    }, [currentIndex])

    useEffect(() => {
        isSavingRef.current = isSaving
    }, [isSaving])

    useEffect(() => {
        completedRef.current = completed
    }, [completed])

    // SAVE WORKOUT
    const saveWorkoutLog = async () => {
        if (hasSaved || isSavingRef.current) return

        isSavingRef.current = true
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
            completedRef.current = true

            runningRef.current = false
            setIsRunning(false)

            releaseWakeLock()

        } catch (error) {
            console.error('Could not save workout:', error)
            setSaveError('Could not save workout. Please try again.')
        } finally {
            isSavingRef.current = false
            setIsSaving(false)
        }
    }

    // FINISH WORKOUT
    const finishWorkout = () => {
        if (completedRef.current) return

        runningRef.current = false
        setIsRunning(false)

        endTimeRef.current = null

        playSound('finish')
        saveWorkoutLog()
    }

    // MOVE TO NEXT MODULE
    const advanceModule = () => {
        if (completedRef.current || isSavingRef.current) return

        const index = currentIndexRef.current

        if (index >= steps.length - 1) {
            finishWorkout()
            return
        }

        playSound('start')

        const nextIndex = index + 1
        const duration = steps[nextIndex].duration

        currentIndexRef.current = nextIndex
        setCurrentIndex(nextIndex)

        endTimeRef.current = Date.now() + duration * 1000
        lastSecondRef.current = duration

        setRemaining(duration)
    }

    // ACCURATE TIMER
    useEffect(() => {
        if (!isRunning || completed || !current || isSaving) return

        const tick = () => {
            if (
                !runningRef.current ||
                completedRef.current ||
                isSavingRef.current
            ) {
                return
            }

            if (!endTimeRef.current) {
                endTimeRef.current = Date.now() + remaining * 1000
            }

            const millisecondsLeft = endTimeRef.current - Date.now()

            const secondsLeft = Math.max(
                0,
                Math.ceil(millisecondsLeft / 1000)
            )

            if (secondsLeft <= 0) {
                setRemaining(0)
                advanceModule()
                return
            }

            if (secondsLeft !== lastSecondRef.current) {
                lastSecondRef.current = secondsLeft
                setRemaining(secondsLeft)

                const index = currentIndexRef.current
                const step = steps[index]
                const last = index === steps.length - 1

                if (!last) {
                    if (step.type === 'countdown') {
                        playSound('countdown')
                    } else if ([3, 2, 1].includes(secondsLeft)) {
                        playSound('countdown')
                    }
                }
            }
        }

        tick()

        const timer = setInterval(tick, 100)

        return () => clearInterval(timer)

    }, [isRunning, completed, currentIndex, isSaving])

    // RESTORE TIMER AFTER BACKGROUND
    useEffect(() => {
        const handleVisibility = () => {
            if (
                document.visibilityState === 'visible' &&
                runningRef.current
            ) {
                if (!endTimeRef.current) return

                const secondsLeft = Math.max(
                    0,
                    Math.ceil((endTimeRef.current - Date.now()) / 1000)
                )

                setRemaining(secondsLeft)
                lastSecondRef.current = secondsLeft

                if (secondsLeft <= 0) {
                    advanceModule()
                }

                requestWakeLock()
            }
        }

        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibility
            )
        }
    }, [steps])

    // RESTORE WAKE LOCK WHEN APP RETURNS
    useEffect(() => {
        const handleFocus = () => {
            if (
                document.visibilityState === 'visible' &&
                runningRef.current
            ) {
                requestWakeLock()
            }
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    // START / PAUSE
    const toggleTimer = async () => {
        if (completed || !current || isSaving) return

        if (isRunning) {
            runningRef.current = false
            setIsRunning(false)

            endTimeRef.current = null

            releaseWakeLock()
            return
        }

        await unlockAudio()

        if (!audioReadyRef.current) {
            console.warn('Some audio files may still be loading.')
        }

        runningRef.current = true

        endTimeRef.current = Date.now() + remaining * 1000
        lastSecondRef.current = remaining

        setIsRunning(true)

        requestWakeLock()
    }

    // NEXT MODULE
    const skipNext = () => {
        if (isSaving || completed) return

        advanceModule()
    }

    // PREVIOUS MODULE
    const skipPrevious = () => {
        if (currentIndex <= 0 || isSaving) return

        const previousIndex = currentIndex - 1
        const duration = steps[previousIndex].duration

        currentIndexRef.current = previousIndex

        setCurrentIndex(previousIndex)
        setRemaining(duration)

        endTimeRef.current = isRunning
            ? Date.now() + duration * 1000
            : null

        lastSecondRef.current = duration
    }

    // RESTART
    const restart = () => {
        if (isSaving) return

        if (activeAudioRef.current) {
            activeAudioRef.current.pause()
            activeAudioRef.current.currentTime = 0
            activeAudioRef.current = null
        }

        runningRef.current = false
        completedRef.current = false
        currentIndexRef.current = 0

        endTimeRef.current = null
        lastSecondRef.current = null

        setIsRunning(false)
        setCurrentIndex(0)
        setRemaining(steps[0]?.duration || 0)
        setCompleted(false)
        setHasSaved(false)
        setSaveError('')

        releaseWakeLock()
    }

    // FORMAT TIME
    const formatTime = seconds => {
        const safeSeconds = Math.max(0, seconds)
        const minutes = Math.floor(safeSeconds / 60)
        const remainingSeconds = safeSeconds % 60

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
                            runningRef.current = false
                            releaseWakeLock()
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
                        runningRef.current = false
                        releaseWakeLock()
                        onExit()
                    }
                }}
            >
                End workout
            </button>

        </main>
    )
}
