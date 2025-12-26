import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, CalendarDays, Dumbbell, Settings as SettingsIcon } from 'lucide-react'
import { treinoDani } from '@/data/treinoDani'
import { getCurrentWeekNumber } from '@/lib/date'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useWorkoutStore } from '@/store/workoutStore'

const navItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/week', label: 'Semana', icon: CalendarDays },
  { to: '/progress', label: 'Histórico', icon: Dumbbell },
  { to: '/settings', label: 'Configurações', icon: SettingsIcon },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const settings = useWorkoutStore((s) => s.settings)
  const weekNumber = getCurrentWeekNumber(settings.programStart, treinoDani.durationWeeks)
  const weekInfo = treinoDani.weeks.find((w) => w.number === weekNumber)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-neutral/20 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-foreground text-background grid place-items-center font-bold shadow-soft">
              D
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral">Dani POC</div>
              <div className="text-lg font-semibold leading-tight">Guia de treino de 12 semanas</div>
              <div className="text-xs text-neutral">Divisão Seg/Qua/Sex</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {weekInfo && (
              <Badge variant={weekInfo.deload ? 'muted' : 'default'}>
                Semana {weekNumber}: {weekInfo.deload ? 'Deload' : weekInfo.phase}
              </Badge>
            )}
            <Button variant="secondary" size="sm" onClick={() => navigate('/week')}>
              Ver semana
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pb-28">{children}</main>
      <nav className="fixed bottom-4 left-0 right-0 mx-auto flex max-w-md justify-center px-4 md:hidden">
        <div className="flex w-full justify-between rounded-full bg-card shadow-soft border border-neutral/30 px-2 py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition',
                  active ? 'bg-foreground text-background' : 'text-neutral hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
