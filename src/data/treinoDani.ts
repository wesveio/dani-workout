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
  day: 'Segunda-feira' | 'Quarta-feira' | 'Sexta-feira'
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

const lowerA: SessionTemplate = {
  id: 'A',
  title: 'Treino A',
  subtitle: 'Inferiores — Glúteos/Quadríceps pesado',
  exercises: [
    {
      id: 'hack-squat',
      name: 'Hack Squat (ou Agachamento Livre)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=hack+squat+tutorial+portugu%C3%AAs',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [5, 7], targets: [{ sets: 5, repRange: [6, 10] }] },
        { weekRange: [9, 12], targets: [{ sets: 5, repRange: [6, 8] }] },
      ],
    },
    {
      id: 'hip-thrust',
      name: 'Hip Thrust (barra) — pausa 1s no topo',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2 (travar suave no topo)',
      videoUrl: 'https://www.youtube.com/results?search_query=hip+thrust+tutorial+gluteo',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [8, 12] }] },
      ],
      optionalVolumeBump: {
        weeks: [5, 6, 7, 9, 10, 11, 12],
        extraSets: 1,
        note: '+1 série se a recuperação estiver excelente',
      },
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Afundo Búlgaro',
      focus: 'compound',
      rest: '2–3 min entre pernas',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=afundo+b%C3%BAlgaro+como+fazer',
      prescriptions: [
        {
          weekRange: [1, 12],
          targets: [{ sets: 3, setRange: [3, 4], repRange: [8, 12] }],
        },
      ],
      notes: 'Cada perna; brace e controle a descida',
    },
    {
      id: 'leg-extension',
      name: 'Cadeira Extensora',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=cadeira+extensora+execu%C3%A7%C3%A3o+correta',
      prescriptions: [
        {
          weekRange: [1, 12],
          targets: [
            { sets: 3, repRange: [12, 15] },
            {
              sets: 1,
              repRange: [15, 25],
              label: 'Pump finalizador',
              notes: 'Tempo controlado',
            },
          ],
        },
      ],
    },
    {
      id: 'hip-abduction',
      name: 'Abdução de Quadril (máquina)',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=abducao+quadril+m%C3%A1quina+tutorial',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [15, 25] }] },
      ],
    },
    {
      id: 'standing-calf-raise',
      name: 'Gêmeos em Pé',
      focus: 'isolation',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=eleva%C3%A7%C3%A3o+panturrilha+em+p%C3%A9+tutorial',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [8, 12] }] },
      ],
      notes: '1s de pausa no topo; alongar embaixo',
    },
  ],
}

const upperB: SessionTemplate = {
  id: 'B',
  title: 'Treino B',
  subtitle: 'Superiores + Pump de glúteo',
  exercises: [
    {
      id: 'pulldown',
      name: 'Pulldown (barra ou triangulo)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=pulldown+costas+como+fazer',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'one-arm-row',
      name: 'Remada unilateral com halter',
      focus: 'compound',
      rest: '2–3 min entre lados',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=remada+unilateral+halter+execu%C3%A7%C3%A3o',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [8, 12] }] },
      ],
      notes: 'Cada lado; mantenha costelas baixas',
    },
    {
      id: 'shoulder-press',
      name: 'Desenvolvimento (máquina/halter)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=desenvolvimento+ombro+halter+tutorial',
      prescriptions: [
        {
          weekRange: [1, 12],
          targets: [{ sets: 3, setRange: [3, 4], repRange: [8, 12] }],
        },
      ],
    },
    {
      id: 'lateral-raise',
      name: 'Elevação lateral',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=eleva%C3%A7%C3%A3o+lateral+ombros+como+fazer',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [12, 20] }] },
      ],
    },
    {
      id: 'rope-pushdown',
      name: 'Tríceps na corda',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=tr%C3%ADceps+corda+execu%C3%A7%C3%A3o',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [10, 15] }] },
      ],
    },
    {
      id: 'alternating-curl',
      name: 'Rosca alternada com halter',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=rosca+alternada+tutorial',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [10, 15] }] },
      ],
    },
    {
      id: 'cable-kickback',
      name: 'Kickback no cabo',
      focus: 'pump',
      rest: '60s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=glute+kickback+cabo+como+fazer',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [12, 20] }] },
      ],
      notes: 'Cada perna; espremer bem',
    },
    {
      id: 'hip-abduction-b',
      name: 'Abdução de Quadril (pump)',
      focus: 'pump',
      rest: '60s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=abducao+quadril+alta+reps+gluteo',
      prescriptions: [
        {
          weekRange: [1, 12],
          targets: [{ sets: 2, setRange: [2, 3], repRange: [20, 30] }],
        },
      ],
    },
  ],
}

const lowerC: SessionTemplate = {
  id: 'C',
  title: 'Treino C',
  subtitle: 'Inferiores — Posterior/Glúteos + Quadríceps',
  exercises: [
    {
      id: 'rdl',
      name: 'Levantamento Romeno',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=levantamento+romeno+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [5, 7], targets: [{ sets: 5, repRange: [6, 10] }] },
        { weekRange: [9, 12], targets: [{ sets: 5, repRange: [6, 8] }] },
      ],
    },
    {
      id: 'lying-leg-curl',
      name: 'Mesa Flexora (deitado)',
      focus: 'isolation',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=mesa+flexora+deitado+execu%C3%A7%C3%A3o',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [10, 15] }] },
      ],
      optionalVolumeBump: {
        weeks: [5, 6, 7, 9, 10, 11, 12],
        extraSets: 1,
        note: '+1 série se a recuperação estiver excelente',
      },
    },
    {
      id: 'leg-press',
      name: 'Leg Press (pés altos/largos)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=leg+press+p%C3%A9s+altos+lateral',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [10, 15] }] },
      ],
    },
    {
      id: 'smith-lunge',
      name: 'Avanço no Smith (ou passadas)',
      focus: 'compound',
      rest: '2–3 min entre pernas',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=avan%C3%A7o+smith+machine+tutorial',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'glute-bridge-machine',
      name: 'Glute Bridge máquina / pull-through',
      focus: 'pump',
      rest: '90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=glute+bridge+m%C3%A1quina+tutorial',
      prescriptions: [
        {
          weekRange: [1, 12],
          targets: [{ sets: 2, setRange: [2, 3], repRange: [12, 20] }],
        },
      ],
    },
    {
      id: 'seated-calf-raise',
      name: 'Gêmeos Sentado',
      focus: 'isolation',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=eleva%C3%A7%C3%A3o+panturrilha+sentado+como+fazer',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, repRange: [12, 20] }] },
      ],
    },
  ],
}

const weeks: Week[] = Array.from({ length: 12 }).map((_, index) => {
  const number = index + 1
  const deload = number === 4 || number === 8
  return {
    number,
    deload,
    phase:
      number <= 3
        ? 'Base (8–12 repetições, RIR 1–2)'
        : number === 4
          ? 'Deload (60–70% do volume, RIR 3–4)'
          : number <= 7
            ? 'Hipertrofia (6–10 repetições, RIR 1–2)'
            : number === 8
              ? 'Deload (60–70% do volume, RIR 3–4)'
              : 'Intensificação (6–8 reps nos compostos)',
    emphasis:
      number <= 3
        ? 'Lapidar técnica, base estável e tempo controlado'
        : number === 4
          ? 'Reduzir séries/carga; manter técnica limpa'
          : number <= 7
            ? 'Subir carga com segurança; recuperar bem'
            : number === 8
              ? 'Mais um deload para absorver treino'
              : 'Mais pesado porém limpo, descansos maiores se preciso',
  }
})

export const treinoDani: Program = {
  name: 'Dani — 12 semanas de Glúteo & Força',
  durationWeeks: 12,
  schedule: [
    { day: 'Segunda-feira', sessionId: 'A' },
    { day: 'Quarta-feira', sessionId: 'B' },
    { day: 'Sexta-feira', sessionId: 'C' },
  ],
  sessions: [lowerA, upperB, lowerC],
  weeks,
  phases: [
    {
      label: 'Base',
      weeks: [1, 2, 3],
      description: '8–12 repetições, praticar posições, RIR 1–2, dominar o tempo.',
    },
    {
      label: 'Deload',
      weeks: [4],
      description: '60–70% do volume, cargas mais leves, RIR 3–4.',
    },
    {
      label: 'Hipertrofia',
      weeks: [5, 6, 7],
      description: '6–10 repetições nos compostos; suba carga se todas as séries baterem o topo.',
    },
    {
      label: 'Deload',
      weeks: [8],
      description: 'Segundo deload para garantir recuperação.',
    },
    {
      label: 'Intensificação',
      weeks: [9, 10, 11, 12],
      description: '6–8 repetições nos principais; isoladores controlados 12–30.',
    },
  ],
  warmup: {
    duration: '5–8 min',
    items: [
      '5 min cardio leve',
      'Mobilidade: quadril/tornozelo/torácica',
      'Ativação: abdução 15–20 reps',
      'Ativação: glute bridge 12–15 reps com 1s de pausa no topo',
    ],
  },
  deload: {
    weeks: [4, 8],
    guidance: 'Fique em ~60–70% das séries normais, cargas leves, e RIR 3–4.',
    reductionNote: 'Não alteramos automaticamente; ajuste na academia.',
  },
  rules: [
    'Progressão dupla: bater o topo da faixa de reps em todas as séries com boa forma antes de subir 2,5–5% de carga.',
    'RIR: compostos ~1–2; isoladores na última série podem ir a 0–1 RIR.',
    'Descanso: compostos 2–3 min; isoladores 60–90s; mais tempo se precisar para manter técnica.',
    'Duração alvo: 60–75 min.',
  ],
  volumeAdjustments: [
    'Se a recuperação estiver excelente: +1 série de Hip Thrust no Treino A nas semanas 5–7 e 9–12.',
    'Se a recuperação estiver excelente: +1 série de Mesa Flexora no Treino C nas semanas 5–7 e 9–12.',
  ],
}
