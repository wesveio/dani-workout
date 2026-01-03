import type { Program, SessionTemplate, Week } from './programTypes'

const imageBase = '/thumbs'
const defaultImageSlug = ''
const imageSlugById: Record<string, string> = {
  'hack-squat': 'hack-squat',
  'hip-thrust': 'hip-thrust',
  'bulgarian-split-squat': 'bulgarian-split-squat',
  'leg-extension': 'leg-extensions',
  'hip-abduction': 'hip-abduction',
  'hip-adduction': 'hip-adduction',
  'standing-calf-raise': 'standing-calf-raise',
  'core-rkc-plank': 'front-plank',
  'core-dead-bug': 'dead-bug',
  'core-pallof': 'pallof',
  'one-arm-row': 'single-arm-dumbbell-row',
  'shoulder-press': 'dumbbell-shoulder-press',
  'lateral-raise': 'lateral-raise',
  'rope-pushdown': 'cable-tricep-pushdowns',
  'alternating-curl': 'hammer-curls',
  'cable-kickback': 'cable-kickback',
  'hip-abduction-b': 'band-hip-abduction',
  'core-cable-crunch': 'cable-crunch',
  'core-side-plank': 'side-plank',
  'core-farmers-carry': 'farmers-walk',
  'pulldown': 'cable-lat-pulldown',
  'rdl': 'romanian-deadlift',
  'lying-leg-curl': 'lying-leg-curl',
  'leg-press': 'seated-leg-press',
  'smith-lunge': 'smith-split-squat',
  'glute-bridge-machine': 'smith-hip-thrust',
  'seated-calf-raise': 'seated-machine-calf-raises',
  'core-hanging-knee-raise': 'hanging-knee-raise',
  'core-reverse-crunch': 'reverse-crunch',
  'core-back-extension': 'back-extension',
}

const withImages = (sessions: SessionTemplate[]): SessionTemplate[] =>
  sessions.map((session) => ({
    ...session,
    exercises: session.exercises.map((exercise) => {
      const slug = imageSlugById[exercise.id] ?? defaultImageSlug
      return {
        ...exercise,
        imageUrl: `${imageBase}/${slug}.png`,
      }
    }),
  }))

const lowerA: SessionTemplate = {
  id: 'A',
  title: 'Treino A',
  subtitle: 'Inferiores — Glúteos/Quadríceps pesado',
  exercises: [
    {
      id: 'hack-squat',
      name: 'Agachamento hack (ou agachamento livre)',
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
      name: 'Elevação Pélvica com barra — pausa 1s no topo',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2 (travar suave no topo)',
      videoUrl: 'https://www.youtube.com/results?search_query=eleva%C3%A7%C3%A3o+p%C3%A9lvica+com+barra+tutorial',
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
      id: 'hip-adduction',
      name: 'Adução de Quadril (máquina)',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=aducao+quadril+m%C3%A1quina+tutorial',
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
    {
      id: 'core-rkc-plank',
      name: 'Prancha RKC',
      focus: 'isolation',
      rest: '60–75s',
      rir: 'Manter tensão',
      videoUrl: 'https://www.youtube.com/results?search_query=prancha+rkc+como+fazer',
      prescriptions: [
        {
          weekRange: [1, 12],
          targets: [
            {
              sets: 3,
              repRange: [20, 35],
              label: 'Segundos',
              notes: '3 séries fixas de 20–35s',
            },
          ],
        },
      ],
      notes: '3 séries fixas de 20–35s; tensão máxima sem cair a lombar.',
    },
    {
      id: 'core-dead-bug',
      name: 'Inseto Morto (controlado)',
      focus: 'isolation',
      rest: '60s',
      rir: 'Controle total',
      videoUrl: 'https://www.youtube.com/results?search_query=dead+bug+exercicio+core+tutorial',
      prescriptions: [{ weekRange: [1, 12], targets: [{ sets: 3, repRange: [8, 12] }] }],
      notes: 'Por lado; coluna neutra e respiração.',
    },
    {
      id: 'core-pallof',
      name: 'Prensa anti-rotação no cabo',
      focus: 'isolation',
      rest: '60–75s',
      rir: 'Estável, sem girar',
      videoUrl: 'https://www.youtube.com/results?search_query=pallof+press+anti+rotacao+core',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, setRange: [2, 3], repRange: [10, 14] }] },
      ],
      notes: 'Anti-rotação; brace ativo.',
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
      name: 'Puxada alta — barra ou triângulo',
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
      notes: 'Cada lado; Deprima o ombro e mantenha costelas baixas',
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
      name: 'Kickback de glúteo no cabo',
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
    {
      id: 'core-cable-crunch',
      name: 'Abdominal na polia',
      focus: 'isolation',
      rest: '60s',
      rir: 'Controle, sem puxar com braço',
      videoUrl: 'https://www.youtube.com/results?search_query=abdominal+polia+cable+crunch+tutorial',
      prescriptions: [{ weekRange: [1, 12], targets: [{ sets: 4, repRange: [10, 15] }] }],
    },
    {
      id: 'core-side-plank',
      name: 'Prancha lateral',
      focus: 'isolation',
      rest: '60–75s',
      rir: 'Manter alinhamento',
      videoUrl: 'https://www.youtube.com/results?search_query=prancha+lateral+core+como+fazer',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [20, 40], label: 'Segundos por lado' }] },
      ],
    },
    {
      id: 'core-farmers-carry',
      name: 'Caminhada do fazendeiro com halter',
      focus: 'compound',
      rest: '60–90s',
      rir: 'Postura neutra',
      videoUrl: 'https://www.youtube.com/results?search_query=farmers+walk+caminhada+fazendeiro+halter',
      prescriptions: [{ weekRange: [1, 12], targets: [{ sets: 4, repRange: [20, 40], label: 'Metros' }] }],
      notes: 'Tronco reto; sem inclinar.',
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
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, repRange: [10, 15] }] },
      ],
      videoUrl: 'https://www.youtube.com/results?search_query=leg+press+p%C3%A9s+altos+lateral',
    },
    {
      id: 'smith-lunge',
      name: 'Avanço na máquina Smith (ou passadas)',
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
      name: 'Elevação Pélvica máquina',
      focus: 'pump',
      rest: '90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=eleva%C3%A7%C3%A3o+p%C3%A9lvica+m%C3%A1quina+tutorial',
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
    {
      id: 'core-hanging-knee-raise',
      name: 'Elevação de joelhos na barra (ou cadeira do capitão)',
      focus: 'isolation',
      rest: '60–75s',
      rir: 'Controle sem balançar',
      videoUrl: 'https://www.youtube.com/results?search_query=elevacao+joelhos+barra+abdominal+tutorial',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 4, setRange: [3, 4], repRange: [8, 12] }] },
      ],
    },
    {
      id: 'core-reverse-crunch',
      name: 'Abdominal Reverso no banco',
      focus: 'isolation',
      rest: '60s',
      rir: 'Controlado, sem impulso',
      videoUrl: 'https://www.youtube.com/results?search_query=abdominal+reverso+no+banco+tutorial',
      prescriptions: [{ weekRange: [1, 12], targets: [{ sets: 3, repRange: [10, 15] }] }],
    },
    {
      id: 'core-back-extension',
      name: 'Extensão lombar 45° (isométrico no topo)',
      focus: 'isolation',
      rest: '60–75s',
      rir: '1s de pausa no topo',
      videoUrl: 'https://www.youtube.com/results?search_query=extensao+lombar+45+gluteo+tutorial',
      prescriptions: [
        { weekRange: [1, 12], targets: [{ sets: 3, setRange: [2, 3], repRange: [10, 12] }] },
      ],
      notes: 'Foco em glúteo/lombar sem exagero.',
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
  name: 'Dani — 12 semanas de Glúteo, Força e Core',
  durationWeeks: 12,
  schedule: [
    { day: 'Segunda-feira', sessionId: 'A' },
    { day: 'Quarta-feira', sessionId: 'B' },
    { day: 'Sexta-feira', sessionId: 'C' },
  ],
  sessions: withImages([lowerA, upperB, lowerC]),
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
    duration: '8–10 min',
    items: [
      '5 min leve (bike/esteira)',
      'Mobilidade rápida: quadril/tornozelo/torácica + 10 agachamentos corpo livre',
      'Ativação (2x): abdução 15–20 reps',
      'Ativação (2x): elevação pélvica 12–15 reps com 1s de pausa no topo',
    ],
  },
  deload: {
    weeks: [4, 8],
    guidance: 'Fique em ~60–70% das séries normais, cargas leves, e RIR 3–4.',
    reductionNote: 'Core no deload: metade das séries, tudo fácil.',
  },
  rules: [
    'Progressão dupla: bater o topo da faixa de reps em todas as séries com boa forma antes de subir 2,5–5% de carga.',
    'RIR: compostos ~1–2; isoladores na última série podem ir a 0–1 RIR.',
    'Descanso: compostos 2–3 min; isoladores 60–90s; mais tempo se precisar para manter técnica.',
    'Duração alvo: 60–75 min.',
    'Core: qualidade > quantidade; pare se perder alinhamento. Descanso 45–75s; progrida tempo/reps devagar.',
  ],
  volumeAdjustments: [
    'Se a recuperação estiver excelente: +1 série de Elevação de Quadril no Treino A nas semanas 5–7 e 9–12.',
    'Se a recuperação estiver excelente: +1 série de Mesa Flexora no Treino C nas semanas 5–7 e 9–12.',
    'Core no deload: metade das séries, manter fácil.',
  ],
}
