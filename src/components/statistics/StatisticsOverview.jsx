
export default function StatisticsOverview({
    stats,
    progressionIncrease
}) {
    const formatNumber = value =>
        Math.round(value).toLocaleString('en-GB')

    const formatWeight = value =>
        `${Number(value || 0).toFixed(2)} kg`

    const formatIncrease = (value, formatter = formatNumber) =>
        `${value > 0 ? '+' : ''}${formatter(value)}`

    const increaseClass = value =>
        value > 0 ? 'increase-positive' : 'increase-negative'

    const increases = [
        {
            label: 'Reps increase',
            value: progressionIncrease.reps,
            format: formatNumber,
            description: 'Change in total repetitions'
        },
        {
            label: 'Weight increase',
            value: progressionIncrease.weight,
            format: formatWeight,
            description: 'Change in heaviest weight'
        },
        {
            label: 'Sets increase',
            value: progressionIncrease.sets,
            format: formatNumber,
            description: 'Change in completed sets'
        },
        {
            label: 'Volume increase',
            value: progressionIncrease.volume,
            format: formatVolume,
            description: 'Change in total training volume'
        }
    ]

    function formatVolume(value) {
        return `${formatNumber(value)} kg`
    }

    return (
        <section className="statistics-overview">

            <div className="statistics-grid">

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
                    <h2>{formatNumber(stats.totalReps)}</h2>
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

            </div>

            <div className="statistics-grid statistics-increase-grid">

                {increases.map(item => (
                    <article
                        className="statistics-card"
                        key={item.label}
                    >
                        <p>{item.label}</p>

                        <h2 className={increaseClass(item.value)}>
                            {formatIncrease(item.value, item.format)}
                        </h2>

                        <span className="statistics-card-sub">
                            {item.description}
                        </span>
                    </article>
                ))}

            </div>

        </section>
    )
}
