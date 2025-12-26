import { useRef, useState } from 'react'
import dayjs from 'dayjs'
import { Download, RefreshCw, ShieldCheck, Upload } from 'lucide-react'
import { useWorkoutStore } from '@/store/workoutStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function Settings() {
  const settings = useWorkoutStore((s) => s.settings)
  const saveSettings = useWorkoutStore((s) => s.saveSettings)
  const exportData = useWorkoutStore((s) => s.exportData)
  const importData = useWorkoutStore((s) => s.importData)
  const reset = useWorkoutStore((s) => s.reset)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [openReset, setOpenReset] = useState(false)

  const onExport = async () => {
    const bundle = await exportData()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dani-training-export-${dayjs().format('YYYYMMDD-HHmm')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exportado', description: 'JSON pronto. Guarde com cuidado.' })
  }

  const onImport = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    try {
      const parsed = JSON.parse(text)
      await importData(parsed)
      toast({ title: 'Importado', description: 'Dados restaurados.' })
    } catch (err) {
      console.error(err)
      toast({ title: 'Falha ao importar', description: 'Arquivo inválido. Verifique o formato.' })
    }
  }

  const onReset = async () => {
    await reset()
    toast({ title: 'Dados apagados', description: 'Recomece do zero. Configurações preservadas.' })
    setOpenReset(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted">Configurações</div>
        <h1 className="text-2xl font-bold">Dados & recuperação</h1>
        <p className="text-sm text-foreground/80">Foco no offline. Importação/exportação em JSON.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opções de volume</CardTitle>
          <CardDescription>Ligue o +1 série opcional quando estiver recuperada.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between rounded-xl border border-neutral/50 bg-surface px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Recuperação está excelente</div>
            <div className="text-xs text-foreground/70">
              Adiciona +1 série de Hip Thrust (A) e Mesa Flexora (C) nas semanas 5–7 e 9–12.
            </div>
          </div>
          <Switch
            aria-label="Alternar recuperação excelente"
            checked={settings.recoveryExcellent}
            onCheckedChange={(checked) => saveSettings({ recoveryExcellent: Boolean(checked) })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Início do programa</CardTitle>
          <CardDescription>Ajuste a data inicial para alinhar os números das semanas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Início (segunda recomendada)</Label>
          <Input
            type="date"
            aria-label="Data de início do programa"
            value={dayjs(settings.programStart).format('YYYY-MM-DD')}
            onChange={(e) => {
              const iso = dayjs(e.target.value).toISOString()
              saveSettings({ programStart: iso })
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Exportar JSON</CardTitle>
            <CardDescription>Baixe os registros para backup.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Importar JSON</CardTitle>
            <CardDescription>Valida com Zod antes de salvar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => onImport(e.target.files?.[0])}
            />
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              className="w-full"
              aria-label="Importar JSON"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resetar dados</CardTitle>
            <CardDescription>Apaga todos os registros. Configurações ficam.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={openReset} onOpenChange={setOpenReset}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resetar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apagar todos os registros?</DialogTitle>
                  <DialogDescription>
                    Isso remove todos os treinos e exercícios armazenados offline. Não é possível desfazer
                    esta ação.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setOpenReset(false)}>
                    Cancelar
                  </Button>
                  <Button variant="default" onClick={onReset}>
                    Confirmar reset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-neutral/50 bg-surface px-4 py-3 text-sm text-foreground/80">
        <ShieldCheck className="h-5 w-5 text-accent" />
        Dados ficam localmente no IndexedDB via Dexie. Sem necessidade de rede.
      </div>
    </div>
  )
}
