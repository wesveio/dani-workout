import { treinoDani } from './treinoDani'
import { treinoWesley } from './treinoWesley'
import type { Program } from './programTypes'
import type { UserId } from '@/types'

export type UserProfile = {
  id: UserId
  name: string
  shortName: string
  avatarInitial: string
  program: Program
  bio: string
}

export const users: Record<UserId, UserProfile> = {
  dani: {
    id: 'dani',
    name: 'Daniela Sotilo',
    shortName: 'Dani',
    avatarInitial: 'D',
    program: treinoDani,
    bio: 'Guia de 12 semanas · Seg/Qua/Sex',
  },
  wesley: {
    id: 'wesley',
    name: 'Wesley',
    shortName: 'Wesley',
    avatarInitial: 'W',
    program: treinoWesley,
    bio: 'Plano de 60 dias · Qui/Sex/Sáb',
  },
}

export const userList = Object.values(users)
export const defaultUserId: UserId = 'dani'

export const getUserProfile = (id: UserId) => users[id] ?? users[defaultUserId]
export const getProgramForUser = (id: UserId) => getUserProfile(id).program
