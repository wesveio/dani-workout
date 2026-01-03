import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  Dumbbell,
  Settings as SettingsIcon,
} from 'lucide-react';
import { userList } from '@/data/users';
import { getCurrentWeekNumber } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useActiveProgram, useActiveUserProfile } from '@/lib/user';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useWorkoutStore } from '@/store/workoutStore';

const navItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/week', label: 'Semana', icon: CalendarDays },
  { to: '/progress', label: 'Histórico', icon: Dumbbell },
  { to: '/settings', label: 'Config', icon: SettingsIcon },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useActiveUserProfile();
  const program = useActiveProgram();
  const settings = useWorkoutStore((s) => s.settings);
  const activeUserId = useWorkoutStore((s) => s.activeUserId);
  const switchUser = useWorkoutStore((s) => s.switchUser);
  const loading = useWorkoutStore((s) => s.loading);
  const weekNumber = getCurrentWeekNumber(
    settings.programStart,
    program.durationWeeks
  );
  const weekInfo = program.weeks.find((w) => w.number === weekNumber);
  const isSession = location.pathname.startsWith('/session');
  const scheduleLabel = program.schedule.map((day) => day.day.slice(0, 3)).join(' / ');

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header
        className={cn(
          'sticky top-0 z-20 border-b border-neutral/30 bg-background/80 backdrop-blur',
          isSession && 'py-2'
        )}
        aria-label='Cabeçalho principal'
      >
        <div
          className={cn(
            'mx-auto flex max-w-5xl items-center justify-between px-4',
            isSession ? 'py-2' : 'py-4'
          )}
        >
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='h-11 w-11 rounded-2xl bg-foreground text-background grid place-items-center font-bold shadow-soft shadow-accent/40 cursor-pointer'>
                {profile.avatarInitial}
              </div>
              <select
                className='absolute inset-0 h-full w-full opacity-0 cursor-pointer'
                value={activeUserId}
                onChange={(e) => {
                  const next = e.target.value as typeof activeUserId;
                  if (next !== activeUserId) {
                    switchUser(next);
                  }
                }}
                disabled={loading}
                aria-label='Selecionar usuário'
              >
                {userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.shortName}
                  </option>
                ))}
              </select>
              <span className='sr-only'>Trocar usuário</span>
            </div>
            {isSession ? (
              <div className='leading-tight'>
                <div className='text-xs uppercase tracking-[0.2em] text-foreground/70'>
                  Sessão em andamento
                </div>
                {weekInfo && (
                  <div className='text-sm font-semibold text-foreground'>
                    Semana {weekNumber} · {weekInfo.phase}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className='text-xs uppercase tracking-[0.2em] text-foreground/70'>
                  {profile.name}
                </div>
                <div className='text-lg font-semibold leading-tight text-foreground'>
                  {program.name}
                </div>
                <div className='text-xs text-foreground/70'>
                  {scheduleLabel}
                </div>
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden items-center gap-2 md:flex'>
              {!isSession && weekInfo && (
                <Badge variant={weekInfo.deload ? 'muted' : 'default'}>
                  Semana {weekNumber}:{' '}
                  {weekInfo.deload ? 'Deload' : weekInfo.phase}
                </Badge>
              )}
              {!isSession && (
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => navigate('/week')}
                >
                  Ver semana
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main
        className={cn(
          'mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pb-28',
          isSession && 'pb-10'
        )}
        role='main'
      >
        {children}
      </main>
      {!isSession && (
        <nav
          className='fixed bottom-4 left-0 right-0 mx-auto flex max-w-md justify-center px-4 md:hidden'
          aria-label='Navegação inferior'
        >
          <div className='flex w-full justify-between rounded-full bg-surface shadow-soft border border-neutral/50 px-2 py-2.5'>
            {navItems.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-1 min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition',
                    active
                      ? 'bg-accent text-background shadow-soft'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  <Icon className='h-5 w-5' />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
