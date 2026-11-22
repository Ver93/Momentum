
export default function StatisticsOverview({
    stats,
    weightProgress
}) {
    const formatNumber = value =>
        Math.round(value).toLocaleString('en-GB')

    const formatWeight = value =>
        `${Number(value || 0).toFixed(2)} kg`

    return (
        <section className="statistics-grid">

            <article className="statistics-card">
                <p>Best weight</p>
                <h2>{formatWeight(stats.bestWeight)}</h2>
                <span className="statistics-card-sub">
                    Heaviest set
                </span>
            </article>

            <article className="statistics-card">
                <p>Total sets</p>
                <h2>{formatNumber(stats.totalSets)}</h2>
                <span className="statistics-card-sub">
                    Sets completed
                </span>
            </article>

            <article className="statistics-card">
                <p>Total reps</p>
                <h2>{formatNumber(stats.totalReps ?? stats.bestReps ?? 0)}</h2>
                <span className="statistics-card-sub">
                    Repetitions completed
                </span>
            </article>

            <article className="statistics-card">
                <p>Total volume</p>
                <h2>{formatNumber(stats.totalVolume)} kg</h2>
                <span className="statistics-card-sub">
                    Kilograms lifted
                </span>
            </article>

            <article className="statistics-card">
                <p>Absolute weight increase</p>
                <h2>
                    {weightProgress.increase > 0 ? '+' : ''}
                    {formatWeight(weightProgress.increase)}
                </h2>
                <span className="statistics-card-sub">
                    Since first recorded session
                </span>
            </article>

            <article className="statistics-card">
                <p>Weight increase (%)</p>
                <h2>
                    {weightProgress.percentage.toFixed(1)}%
                </h2>
                <span className="statistics-card-sub">
                    Compared with starting weight
                </span>
            </article>

        </section>
    )
}
