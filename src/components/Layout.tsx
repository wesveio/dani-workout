import { useLocation } from 'react-router-dom';
import { BottomTabBar } from './redesign/BottomTabBar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isSession = pathname.startsWith('/session');

  return (
    <div className='min-h-screen bg-bg text-txt'>
      <div className='mx-auto flex min-h-screen max-w-[480px] flex-col'>
        <main
          className={isSession ? 'flex-1 px-4 pb-40 pt-4' : 'flex-1 px-4 pb-24 pt-4'}
          role='main'
        >
          {children}
        </main>
        {!isSession && <BottomTabBar />}
      </div>
    </div>
  );
}
