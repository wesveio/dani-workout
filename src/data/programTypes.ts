export type SetTarget = {
  sets: number
  repRange: [number, number]
  setRange?: [number, number]
  weeks?: number[]
  label?: string
  notes?: string
}

export type Prescription = {
  weekRange: [number, number]
  targets: SetTarget[]
}

export type DeloadRule = {
  weeks: number[]
  guidance: string
  reductionNote: string
}

export type Warmup = {
  duration: string
  items: string[]
}

export type Exercise = {
  id: string
  name: string
  focus: 'compound' | 'isolation' | 'pump'
  rest: string
  rir: string
  prescriptions: Prescription[]
  videoUrl?: string
  imageUrl?: string
  optionalVolumeBump?: {
    weeks: number[]
    extraSets: number
    note: string
  }
  notes?: string
}

export type SessionTemplate = {
  id: 'A' | 'B' | 'C'
  title: string
  subtitle: string
  exercises: Exercise[]
}

export type Week = {
  number: number
  phase: string
  emphasis: string
  deload: boolean
}

export type Phase = {
  label: string
  weeks: number[]
  description: string
}

export type ScheduleDay = {
  day:
    | 'Segunda-feira'
    | 'Terça-feira'
    | 'Quarta-feira'
    | 'Quinta-feira'
    | 'Sexta-feira'
    | 'Sábado'
    | 'Domingo'
  sessionId: SessionTemplate['id']
}

export type Program = {
  name: string
  durationWeeks: number
  schedule: ScheduleDay[]
  sessions: SessionTemplate[]
  weeks: Week[]
  phases: Phase[]
  warmup: Warmup
  deload: DeloadRule
  rules: string[]
  volumeAdjustments: string[]
}
