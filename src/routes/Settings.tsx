import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { Check, Download, RefreshCw, ShieldCheck, Upload } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useWorkoutStore } from '@/store/workoutStore'
import { useActiveUserProfile } from '@/lib/user'
import { db } from '@/db/client'
import { AVATAR_COLORS } from '@/lib/profile-constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Profile } from '@/types'

export default function Settings() {
  const profile = useActiveUserProfile()
  const settings = useWorkoutStore((s) => s.settings)
  const saveSettings = useWorkoutStore((s) => s.saveSettings)
  const exportData = useWorkoutStore((s) => s.exportData)
  const importData = useWorkoutStore((s) => s.importData)
  const reset = useWorkoutStore((s) => s.reset)
  const updateProfile = useWorkoutStore((s) => s.updateProfile)
  const deleteProfile = useWorkoutStore((s) => s.deleteProfile)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [openReset, setOpenReset] = useState(false)
  const profileCount = useLiveQuery(() => db.profiles.count(), []) ?? 1
  const [editName, setEditName] = useState(profile?.name ?? '')
  const [editColor, setEditColor] = useState(profile?.avatarColor ?? AVATAR_COLORS[0])
  const [openDelete, setOpenDelete] = useState(false)
  const [confirmName, setConfirmName] = useState('')

  useEffect(() => {
    if (profile) {
      setEditName(profile.name)
      setEditColor(profile.avatarColor)
    }
  }, [profile?.id])

  const hasChanges =
    editName.trim() !== (profile?.name ?? '') ||
    editColor !== (profile?.avatarColor ?? '')

  const handleUpdate = async () => {
    if (!profile) return
    const trimmed = editName.trim()
    if (!trimmed || trimmed.length > 50) return
    const patch: Partial<Pick<Profile, 'name' | 'avatarColor'>> = {}
    if (trimmed !== profile.name) patch.name = trimmed
    if (editColor !== profile.avatarColor) patch.avatarColor = editColor
    if (Object.keys(patch).length === 0) return
    await updateProfile(profile.id, patch)
    toast({ title: 'Perfil atualizado', description: 'Alterações salvas.' })
  }

  const handleDelete = async () => {
    if (!profile) return
    await deleteProfile(profile.id)
    toast({ title: 'Perfil excluído', description: `${profile.name} foi removido.` })
    setOpenDelete(false)
    setConfirmName('')
  }

  const onExport = async () => {
    const bundle = await exportData()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `training-export-${bundle.userId}-${dayjs().format('YYYYMMDD-HHmm')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exportado', description: `JSON do ${profile?.shortName} pronto. Guarde com cuidado.` })
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
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onReset = async () => {
    await reset()
    toast({ title: 'Dados apagados', description: `Registros de ${profile?.shortName} removidos. Configurações preservadas.` })
    setOpenReset(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted">Configurações</div>
        <h1 className="text-2xl font-bold">Dados & recuperação</h1>
        <p className="text-sm text-foreground/80">Foco no offline. Importação/exportação em JSON para {profile?.shortName ?? ''}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Edite nome e cor do avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nome do perfil"
              maxLength={50}
            />
          </div>

          {/* Avatar color picker - row of 6 dots */}
          <div className="space-y-2">
            <Label>Cor do avatar</Label>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-8 w-8 rounded-full grid place-items-center ring-offset-background transition-all"
                  style={{
                    backgroundColor: color,
                    ...(editColor === color ? { outline: '2px solid white', outlineOffset: '2px' } : {}),
                  }}
                  onClick={() => setEditColor(color)}
                  aria-label={`Selecionar cor ${color}`}
                >
                  {editColor === color && <Check className="h-4 w-4 text-[#161616]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button
            onClick={handleUpdate}
            disabled={!hasChanges || !editName.trim()}
          >
            Salvar perfil
          </Button>

          {/* Delete section */}
          <div className="pt-4 border-t border-neutral/50">
            <Dialog open={openDelete} onOpenChange={(open) => { setOpenDelete(open); if (!open) setConfirmName('') }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-[#FF4444] border-[#FF4444]"
                  disabled={profileCount <= 1}
                  title={profileCount <= 1 ? 'Você precisa de pelo menos um perfil.' : undefined}
                >
                  Excluir perfil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir {profile?.name}?</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. Todos os dados de treino deste perfil serão apagados permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label>Digite {profile?.name} para confirmar</Label>
                  <Input
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={profile?.name}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => { setOpenDelete(false); setConfirmName('') }}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-[#FF4444] text-[#161616] hover:bg-[#FF4444]/90"
                    disabled={confirmName.trim() !== profile?.name}
                    onClick={handleDelete}
                  >
                    Excluir perfil
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opções de volume</CardTitle>
          <CardDescription>Ative o +1 série opcional se sua recuperação estiver ótima.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between rounded-xl border border-neutral/50 bg-surface px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Recuperação está excelente</div>
            <div className="text-xs text-foreground/70">
              Só afeta exercícios que têm volume bônus no plano ativo.
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
              const parsed = dayjs(e.target.value)
              if (!parsed.isValid()) {
                toast({ title: 'Data inválida', description: 'Escolha uma data válida para recalcular as semanas.' })
                return
              }
              saveSettings({ programStart: parsed.toISOString() })
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
            <CardDescription>Apaga registros do usuário atual. Configurações ficam.</CardDescription>
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
                  <DialogTitle>Apagar registros deste usuário?</DialogTitle>
                  <DialogDescription>
                    Isso remove todos os treinos e exercícios armazenados offline para este perfil. Não é possível desfazer
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
