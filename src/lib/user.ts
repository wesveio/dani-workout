import { useMemo } from 'react'
import { getUserProfile } from '@/data/users'
import { useWorkoutStore } from '@/store/workoutStore'

export const useActiveUserProfile = () => {
  const activeUserId = useWorkoutStore((s) => s.activeUserId)
  return useMemo(() => getUserProfile(activeUserId), [activeUserId])
}

export const useActiveProgram = () => {
  const profile = useActiveUserProfile()
  return profile.program
}
