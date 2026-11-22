
import {
    formatWeight,
    formatVolume
} from '../../utils/statisticsUtils'

export default function StatisticsHistory({ progression, workoutName }) {
    return (
        <section className="statistics-section">
            <div className="statistics-section-heading">
                <div>
                    <h2>Exercise history</h2>
                    <p>Previous {workoutName} sessions</p>
                </div>
            </div>

            <div className="exercise-history">
                {[...progression].reverse().map(item => (
                    <article
                        className="exercise-history-item"
                        key={item.id}
                    >
                        <div className="exercise-history-date">
                            <strong>{item.label}</strong>
                            <span>
                                {new Date(item.date).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="exercise-history-stats">
                            <div>
                                <span>Weight</span>
                                <strong>{formatWeight(item.weight)}</strong>
                            </div>

                            <div>
                                <span>Reps</span>
                                <strong>{item.reps}</strong>
                            </div>

                            <div>
                                <span>Sets</span>
                                <strong>{item.sets}</strong>
                            </div>

                            <div>
                                <span>Volume</span>
                                <strong>{formatVolume(item.volume)}</strong>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
