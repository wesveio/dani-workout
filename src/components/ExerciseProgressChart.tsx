import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

export type ChartDatum = {
  date: string
  volume: number
  topWeight: number
  e1rm: number
}

type ExerciseProgressChartProps = {
  chartData: ChartDatum[]
  metric: 'volume' | 'topWeight' | 'e1rm'
}

const metricLabels: Record<string, string> = {
  volume: 'Volume',
  topWeight: 'Carga',
  e1rm: '1RM Est.',
}

const tooltipFormatter: Formatter<ValueType, NameType> = (value, name) => [
  value,
  metricLabels[name as string] ?? name,
]

export function ExerciseProgressChart({ chartData, metric }: ExerciseProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#FF8C00" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorTopWeight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF3D3D" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF3D3D" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorE1rm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF3D3D" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF3D3D" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #2A2A2A',
            background: '#1A1A1A',
          }}
          formatter={tooltipFormatter}
        />
        {metric === 'volume' && (
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#FF8C00"
            fillOpacity={1}
            fill="url(#colorVolume)"
            strokeWidth={3}
          />
        )}
        {metric === 'topWeight' && (
          <Area
            type="monotone"
            dataKey="topWeight"
            stroke="#FF3D3D"
            fillOpacity={1}
            fill="url(#colorTopWeight)"
            strokeWidth={3}
          />
        )}
        {metric === 'e1rm' && (
          <Area
            type="monotone"
            dataKey="e1rm"
            stroke="#FF3D3D"
            fillOpacity={1}
            fill="url(#colorE1rm)"
            strokeWidth={3}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
