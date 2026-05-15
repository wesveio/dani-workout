import { useRef, useState } from 'react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useWorkoutStore } from '@/store/workoutStore'
import { useActiveUserProfile } from '@/lib/user'
import { db } from '@/db/client'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ProfileRow } from '@/components/redesign'
import type { Profile } from '@/types'

export default function Settings() {
  const active = useActiveUserProfile()
  const settings = useWorkoutStore((s) => s.settings)
  const saveSettings = useWorkoutStore((s) => s.saveSettings)
  const exportData = useWorkoutStore((s) => s.exportData)
  const importData = useWorkoutStore((s) => s.importData)
  const reset = useWorkoutStore((s) => s.reset)
  const switchUser = useWorkoutStore((s) => s.switchUser)
  const createProfile = useWorkoutStore((s) => s.createProfile)

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [openReset, setOpenReset] = useState(false)
  const [openNewProfile, setOpenNewProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? []

  const onExport = async () => {
    const bundle = await exportData()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `training-export-${bundle.userId}-${dayjs().format('YYYYMMDD-HHmm')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exportado', description: `JSON do ${active?.shortName} pronto. Guarde com cuidado.` })
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
    toast({ title: 'Dados apagados', description: `Registros de ${active?.shortName} removidos. Configurações preservadas.` })
    setOpenReset(false)
  }

  const onAddProfile = async () => {
    const trimmed = newProfileName.trim()
    if (!trimmed) return
    await createProfile(trimmed)
    setNewProfileName('')
    setOpenNewProfile(false)
  }

  return (
    <div className='space-y-5 pb-24'>
      {/* Header */}
      <div>
        <div className='text-[10px] uppercase tracking-[0.2em] text-txt-faint'>Conta · ajustes</div>
        <h1 className='text-2xl font-bold'>Mais</h1>
      </div>

      {/* Perfis section */}
      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          Perfis
        </h2>
        {profiles.map((p: Profile) => (
          <ProfileRow
            key={p.id}
            name={p.name}
            active={p.id === active?.id}
            onSelect={() => switchUser(p.id)}
          />
        ))}
        <button
          type='button'
          onClick={() => setOpenNewProfile(true)}
          className='w-full rounded-card border-[1.5px] border-dashed border-txt-faint p-3 text-[12px] uppercase tracking-[0.15em] text-txt-faint'
        >
          + novo perfil
        </button>
      </section>

      {/* Programa section */}
      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          Programa
        </h2>
        <div className='rounded-card bg-bg-1 divide-y divide-line'>
          {/* Data de início */}
          <div className='flex items-center justify-between px-3.5 py-3'>
            <div>
              <div className='text-[13px]'>Data de início</div>
              <div className='text-[11px] text-txt-faint'>
                {dayjs(settings.programStart).format('D [de] MMM [de] YYYY')}
              </div>
            </div>
            <span className='text-[11px] text-txt-faint'>
              {dayjs(settings.programStart).format('YYYY-MM-DD')}
            </span>
          </div>

          {/* Recuperação +1 série */}
          <div className='flex items-center justify-between px-3.5 py-3'>
            <div>
              <div className='text-[13px]'>Recuperação +1 série</div>
              <div className='text-[11px] text-txt-faint'>Volume bônus quando estiver ótimo.</div>
            </div>
            <Switch
              aria-label='Alternar recuperação excelente'
              checked={settings.recoveryExcellent}
              onCheckedChange={(checked) => saveSettings({ recoveryExcellent: Boolean(checked) })}
            />
          </div>

          {/* Lembretes — placeholder */}
          <div className='flex items-center justify-between px-3.5 py-3'>
            <div>
              <div className='text-[13px]'>Lembretes</div>
              <div className='text-[11px] text-txt-faint'>Notificações de treino.</div>
            </div>
            <Switch aria-label='Lembretes' checked={false} disabled className='opacity-40' />
          </div>
        </div>
      </section>

      {/* Dados section */}
      <section>
        <h2 className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-faint'>
          Dados
        </h2>
        <div className='rounded-card bg-bg-1'>
          <button
            type='button'
            onClick={onExport}
            className='flex w-full items-center justify-between border-b border-line px-3.5 py-3 text-left text-[13px]'
          >
            <span>Exportar JSON</span>
            <span className='text-txt-faint'>↓</span>
          </button>
          <input
            ref={fileRef}
            type='file'
            accept='application/json'
            className='hidden'
            onChange={(e) => onImport(e.target.files?.[0])}
          />
          <button
            type='button'
            onClick={() => fileRef.current?.click()}
            className='flex w-full items-center justify-between border-b border-line px-3.5 py-3 text-left text-[13px]'
          >
            <span>Importar JSON</span>
            <span className='text-txt-faint'>↑</span>
          </button>
          <button
            type='button'
            onClick={() => setOpenReset(true)}
            className='flex w-full items-center justify-between px-3.5 py-3 text-left text-[13px] text-red-500'
          >
            <span>Resetar logs</span>
            <span>⌫</span>
          </button>
        </div>
      </section>

      {/* Templates link */}
      <Link
        to='/templates'
        className='block rounded-card bg-bg-1 px-3.5 py-3 text-[13px]'
      >
        <div className='flex items-center justify-between'>
          <span>Templates personalizados</span>
          <span className='text-txt-faint'>›</span>
        </div>
      </Link>

      {/* Version footer */}
      <div className='pt-2 text-center text-[9px] uppercase tracking-[0.18em] text-txt-faint'>
        Diário Dani · v2.0
      </div>

      {/* Reset confirmation dialog */}
      <Dialog open={openReset} onOpenChange={setOpenReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar registros deste usuário?</DialogTitle>
            <DialogDescription>
              Isso remove todos os treinos e exercícios armazenados offline para este perfil. Não é possível desfazer esta ação.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-4 flex justify-end gap-2'>
            <Button variant='secondary' onClick={() => setOpenReset(false)}>
              Cancelar
            </Button>
            <Button className='bg-red-500 text-white hover:bg-red-600' onClick={onReset}>
              Confirmar reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New profile dialog */}
      <Dialog open={openNewProfile} onOpenChange={(open) => { setOpenNewProfile(open); if (!open) setNewProfileName('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo perfil</DialogTitle>
            <DialogDescription>
              Digite o nome do novo perfil.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label>Nome</Label>
            <Input
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder='Nome do perfil'
              maxLength={50}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddProfile() }}
            />
          </div>
          <div className='mt-4 flex justify-end gap-2'>
            <Button variant='secondary' onClick={() => { setOpenNewProfile(false); setNewProfileName('') }}>
              Cancelar
            </Button>
            <Button disabled={!newProfileName.trim()} onClick={onAddProfile}>
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
