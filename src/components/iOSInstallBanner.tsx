import { useState, useEffect } from 'react'
import { Share2 } from 'lucide-react'
import { shouldShowBanner, dismissBanner } from '@/lib/iosInstall'
import { Button } from '@/components/ui/button'

export function iOSInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check on mount only, not every render (Pitfall 2)
    const timer = setTimeout(() => {
      setVisible(shouldShowBanner())
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-[72px] left-0 right-0 mx-auto flex max-w-[360px] items-center gap-3 rounded-xl bg-bg-1 border border-line/50 px-4 py-3 shadow-soft"
      style={{ borderLeft: '2px solid #FF8C00', transition: 'transform 0.2s ease, opacity 0.2s ease' }}
      role="banner"
    >
      <Share2 className="h-5 w-5 shrink-0 text-txt-faint" />
      <span className="flex-1 text-sm">Adicione ao inicio para acesso rapido</span>
      <Button
        variant="ghost"
        size="sm"
        className="text-txt-faint shrink-0"
        onClick={() => {
          dismissBanner()
          setVisible(false)
        }}
      >
        Dispensar
      </Button>
    </div>
  )
}
