import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import './index.css'
import App from './App.tsx'
import { Toaster } from './components/ui/use-toast'

dayjs.locale('pt-br')

const orientation = screen.orientation as
  | (ScreenOrientation & { lock?: (o: 'portrait') => Promise<void> })
  | undefined
orientation?.lock?.('portrait').catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
)
