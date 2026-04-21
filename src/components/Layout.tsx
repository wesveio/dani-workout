import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  BarChart2,
  LayoutTemplate,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveUserProfile } from '@/lib/user';
import { ProfileSwitcher } from './ProfileSwitcher';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/week', label: 'Treino', icon: CalendarDays },
  { to: '/progress', label: 'Historico', icon: BarChart2 },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/settings', label: 'Config', icon: SettingsIcon },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const profile = useActiveUserProfile();
  const isSession = location.pathname.startsWith('/session');

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header
        className={cn(
          'sticky top-0 z-20 border-b border-neutral/30 bg-background/80 backdrop-blur-md',
          isSession && 'py-2'
        )}
        aria-label='Cabecalho principal'
      >
        <div
          className={cn(
            'mx-auto flex max-w-5xl items-center justify-between px-4',
            isSession ? 'py-2' : 'py-3'
          )}
        >
          <div className='flex items-center gap-3'>
            {isSession ? (
              <div className='leading-tight'>
                <div className='text-xs uppercase tracking-[0.2em] text-muted'>
                  Sessao em andamento
                </div>
              </div>
            ) : (
              <h1 className='text-[28px] font-semibold leading-none text-foreground'>
                Dani
              </h1>
            )}
          </div>
          <ProfileSwitcher />
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
          className='fixed bottom-4 left-0 right-0 mx-auto flex justify-center px-4 md:hidden'
          aria-label='Navegacao inferior'
        >
          <div className='flex w-[calc(100%-32px)] max-w-[360px] justify-between rounded-full bg-surface/95 shadow-soft border border-neutral/50 px-2 py-2 backdrop-blur-md'>
            {navItems.map((item) => {
              const active =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'relative flex flex-1 min-h-[44px] flex-col items-center justify-center gap-1 rounded-full px-1 py-1.5 text-[11px] transition',
                    active
                      ? 'text-foreground'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  <Icon className='h-5 w-5' />
                  <span>{item.label}</span>
                  {active && (
                    <span className='absolute bottom-0.5 h-[3px] w-[3px] rounded-full bg-accent' />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
