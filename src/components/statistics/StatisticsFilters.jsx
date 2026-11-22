
export default function StatisticsFilters({ period, setPeriod }) {
    const options = [
        { label: '7D', value: '7' },
        { label: '30D', value: '30' },
        { label: '90D', value: '90' },
        { label: 'All time', value: 'all' }
    ]

    return (
        <section className="statistics-filters">
            <div className="statistics-periods">
                {options.map(option => (
                    <button
                        key={option.value}
                        className={
                            period === option.value ? 'active' : ''
                        }
                        onClick={() => setPeriod(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </section>
    )
}
