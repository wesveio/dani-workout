import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useWorkoutStore } from './store/workoutStore'
import { Card, CardContent } from './components/ui/card'

const Dashboard = lazy(() => import('./routes/Dashboard'))
const WeekView = lazy(() => import('./routes/WeekView'))
const SessionDetail = lazy(() => import('./routes/SessionDetail'))
const ExerciseHistory = lazy(() => import('./routes/ExerciseHistory'))
const Progress = lazy(() => import('./routes/Progress'))
const Settings = lazy(() => import('./routes/Settings'))

function RouteFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Card className="w-[320px]">
        <CardContent className="p-6 text-center">
          <div className="text-sm font-semibold">Carregando tela…</div>
          <div className="mt-2 text-xs text-foreground/70">Preparando conteúdo</div>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  const init = useWorkoutStore((s) => s.init)
  const loading = useWorkoutStore((s) => s.loading)
  const error = useWorkoutStore((s) => s.error)

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Card className="w-[320px]">
          <CardContent className="p-6 text-center">
            <div className="text-sm font-semibold">Carregando seus dados…</div>
            <div className="mt-2 text-xs text-foreground/70">Cache offline (IndexedDB)</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Card className="w-[340px] border border-red-400/40 bg-surface">
          <CardContent className="p-6 text-center space-y-2">
            <div className="text-sm font-semibold text-red-200">Erro ao carregar</div>
            <div className="text-xs text-foreground/80">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/week" element={<WeekView />} />
          <Route path="/session/:sessionId/:weekNumber?" element={<SessionDetail />} />
          <Route path="/exercise/:exerciseId" element={<ExerciseHistory />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
