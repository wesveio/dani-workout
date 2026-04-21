import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/client'
import { useWorkoutStore } from '@/store/workoutStore'
import type { Profile } from '@/types'
import { treinoDani } from '@/data/treinoDani'
import { treinoWesley } from '@/data/treinoWesley'
import type { Program } from '@/data/programTypes'

export const useActiveUserProfile = (): Profile | undefined => {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  return useLiveQuery(() => db.profiles.get(activeUserId), [activeUserId])
}

export const useActiveProgram = (): Program | null => {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  if (activeUserId === 'dani') return treinoDani
  if (activeUserId === 'wesley') return treinoWesley
  return null
}
