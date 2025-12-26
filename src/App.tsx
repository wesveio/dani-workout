import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import WeekView from './routes/WeekView'
import SessionDetail from './routes/SessionDetail'
import ExerciseHistory from './routes/ExerciseHistory'
import Progress from './routes/Progress'
import Settings from './routes/Settings'
import { Layout } from './components/Layout'
import { useWorkoutStore } from './store/workoutStore'
import { Card, CardContent } from './components/ui/card'

function App() {
  const init = useWorkoutStore((s) => s.init)
  const loading = useWorkoutStore((s) => s.loading)

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

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/week" element={<WeekView />} />
        <Route path="/session/:sessionId/:weekNumber?" element={<SessionDetail />} />
        <Route path="/exercise/:exerciseId" element={<ExerciseHistory />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
