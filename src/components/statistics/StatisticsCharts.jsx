
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'

import { formatNumber } from '../../utils/statisticsUtils'

const charts = [
    {
        key: 'weight',
        title: 'Weight progression',
        description: 'Heaviest weight lifted per session',
        suffix: ' kg',
        color: '#c5f36b'
    },
    {
        key: 'reps',
        title: 'Reps progression',
        description: 'Total repetitions per session',
        suffix: '',
        color: '#8bc5ff'
    },
    {
        key: 'sets',
        title: 'Sets progression',
        description: 'Completed sets per session',
        suffix: '',
        color: '#c49aff'
    },
    {
        key: 'volume',
        title: 'Volume progression',
        description: 'Total weight × repetitions',
        suffix: ' kg',
        color: '#ffb86b'
    },
    {
        key: 'averageWeight',
        title: 'Average weight',
        description: 'Average weight per set',
        suffix: ' kg',
        color: '#ff8da1'
    }
]

export default function StatisticsCharts({ progression }) {
    return (
        <section className="statistics-charts">
            {charts.map(chart => {
                const latest = progression[progression.length - 1]

                return (
                    <article
                        className="statistics-section statistics-chart-card"
                        key={chart.key}
                    >
                        <div className="statistics-section-heading">
                            <div>
                                <h2>{chart.title}</h2>
                                <p>{chart.description}</p>
                            </div>

                            <span className="chart-latest">
                                {formatNumber(latest[chart.key])}
                                {chart.suffix}
                            </span>
                        </div>

                        <div className="progression-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progression}>
                                    <CartesianGrid
                                        stroke="#303030"
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: '#888', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{ fill: '#888', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={45}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            background: '#202020',
                                            border: '1px solid #383838',
                                            borderRadius: '9px',
                                            color: '#fff'
                                        }}
                                        formatter={value => [
                                            `${formatNumber(value)}${chart.suffix}`,
                                            chart.title
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey={chart.key}
                                        stroke={chart.color}
                                        strokeWidth={3}
                                        dot={{
                                            fill: chart.color,
                                            strokeWidth: 0,
                                            r: 4
                                        }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </article>
                )
            })}
        </section>
    )
}
