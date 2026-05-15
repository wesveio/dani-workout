import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, BarChart2, Scale, MoreHorizontal } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Hoje', icon: Home, match: (p: string) => p === '/' },
  { to: '/week', label: 'Semana', icon: CalendarDays, match: (p: string) => p.startsWith('/week') },
  {
    to: '/progress',
    label: 'Histórico',
    icon: BarChart2,
    match: (p: string) => p.startsWith('/progress') || p.startsWith('/exercise'),
  },
  { to: '/corpo', label: 'Corpo', icon: Scale, match: (p: string) => p.startsWith('/corpo') },
  {
    to: '/settings',
    label: 'Mais',
    icon: MoreHorizontal,
    match: (p: string) => p.startsWith('/settings') || p.startsWith('/templates'),
  },
];

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label='Navegação principal'
      className='fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[480px] border-t border-line bg-bg/90 backdrop-blur-md'
    >
      <ul className='flex px-2 pb-5 pt-2'>
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={to} className='flex-1'>
              <NavLink
                to={to}
                aria-current={active ? 'page' : undefined}
                className='flex flex-col items-center gap-0.5 py-1 text-[10px]'
              >
                <Icon className='h-5 w-5' aria-hidden />
                <span>{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
