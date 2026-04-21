import { useState } from 'react'
import { Check } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/client'
import { useWorkoutStore } from '@/store/workoutStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateProfileDialog } from './CreateProfileDialog'

export function ProfileSwitcher() {
  const [createOpen, setCreateOpen] = useState(false)
  const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? []
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  const switchUser = useWorkoutStore((s) => s.switchUser)
  const error = useWorkoutStore((s) => s.error)

  const activeProfile = profiles.find((p) => p.id === activeUserId)
  const isSessionActive =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/session')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-11 w-11 rounded-2xl grid place-items-center font-bold"
            style={{
              backgroundColor: activeProfile?.avatarColor ?? '#666',
              color: '#161616',
            }}
            aria-label="Trocar perfil"
          >
            {activeProfile?.avatarInitial ?? '?'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {profiles.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => switchUser(p.id)}
              disabled={isSessionActive && p.id !== activeUserId}
            >
              <span
                className="h-3 w-3 rounded-full mr-2 shrink-0"
                style={{ backgroundColor: p.avatarColor }}
              />
              {p.shortName}
              {p.id === activeUserId && (
                <Check className="ml-auto h-4 w-4 text-[#4EFF74]" />
              )}
            </DropdownMenuItem>
          ))}
          {isSessionActive && error && (
            <p className="px-2 py-1 text-xs text-[#FF4444]">
              Finalize ou descarte o treino antes de trocar de perfil
            </p>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="text-[#4EFF74]"
          >
            + Novo perfil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProfileDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
