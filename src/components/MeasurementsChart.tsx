import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import dayjs from 'dayjs'
import type { BodyMetric } from '@/types'

const LINES = [
  { key: 'waist', label: 'Cintura', color: '#FF8C00' },
  { key: 'hips', label: 'Quadril', color: '#4EFF74' },
  { key: 'chest', label: 'Peitoral', color: '#4495FF' },
  { key: 'arms', label: 'Bracos', color: '#A78BFA' },
] as const

type LineKey = (typeof LINES)[number]['key']

export function MeasurementsChart({ entries }: { entries: BodyMetric[] }) {
  const [hidden, setHidden] = useState<string[]>([])

  const toggleLine = (key: string) =>
    setHidden((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const withMeasurements = entries.filter(
    (e) => e.waist != null || e.hips != null || e.chest != null || e.arms != null
  )

  const chartData = [...withMeasurements]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: dayjs(e.date).format('DD/MM'),
      waist: e.waist,
      hips: e.hips,
      chest: e.chest,
      arms: e.arms,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center text-center">
        <div className="text-xs text-txt-faint">Adicione medidas para ver o grafico aqui.</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">Medidas (cm)</div>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 14 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 14 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #2A2A2A',
                background: '#1A1A1A',
              }}
            />
            <Legend
              onClick={(e) => toggleLine(e.dataKey as string)}
              wrapperStyle={{ cursor: 'pointer' }}
            />
            {LINES.map(({ key, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                hide={hidden.includes(key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
