import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BodyMetric } from '@/types'

type Period = '1M' | '3M' | '6M' | '1A' | 'Tudo'

const PERIODS: Period[] = ['1M', '3M', '6M', '1A', 'Tudo']
const months: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1A': 12 }

export function WeightTrendChart({ entries }: { entries: BodyMetric[] }) {
  const [period, setPeriod] = useState<Period>('3M')

  const cutoff = period === 'Tudo' ? null : dayjs().subtract(months[period], 'month')
  const filtered = cutoff
    ? entries.filter((e) => dayjs(e.date).isAfter(cutoff))
    : entries

  const chartData = [...filtered]
    .filter((e) => e.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: dayjs(e.date).format('DD/MM'), weight: e.weight }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Peso (kg)</div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="h-7 gap-0 p-0.5">
            {PERIODS.map((p) => (
              <TabsTrigger key={p} value={p} className="min-w-0 px-2 py-0.5 text-xs">
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="h-[200px]">
        {chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-sm font-semibold text-txt-faint">Sem registros ainda</div>
            <div className="mt-1 text-xs text-txt-faint">
              Registre seu peso hoje para comecar a ver sua evolucao.
            </div>
          </div>
        ) : (
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
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF3D3D"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
