import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/client'
import { useWorkoutStore } from '@/store/workoutStore'
import { pickColor } from '@/lib/profile-constants'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CreateProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProfileDialog({ open, onOpenChange }: CreateProfileDialogProps) {
  const [name, setName] = useState('')
  const createProfile = useWorkoutStore((s) => s.createProfile)
  const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? []

  const avatarInitial = name.trim().charAt(0).toUpperCase() || '?'
  const avatarColor = pickColor(profiles.length)

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 50) return
    await createProfile(trimmed)
    setName('')
    onOpenChange(false)
    toast({ title: 'Perfil criado', description: `${trimmed} adicionado.` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo perfil</DialogTitle>
          <DialogDescription>Escolha um nome para comecar.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div
            className="h-11 w-11 rounded-2xl grid place-items-center font-bold"
            style={{ backgroundColor: avatarColor, color: '#161616' }}
          >
            {avatarInitial}
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do perfil"
            maxLength={50}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Nao criar
          </Button>
          <Button
            disabled={name.trim().length === 0}
            className="bg-[#4EFF74] text-[#161616] hover:bg-[#4EFF74]/90"
            onClick={handleCreate}
          >
            Criar perfil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
