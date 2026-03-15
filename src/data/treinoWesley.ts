import type { DeloadRule, Phase, Program, ScheduleDay, SessionTemplate, Warmup, Week } from './programTypes'

const imageBase = '/thumbs'
const defaultImageSlug = ''
const imageSlugById: Record<string, string> = {
  'flat-bench-press-wes': 'benchpress',
  'seated-row-heavy': 'barbell-row',
  'overhead-press': 'dumbbell-shoulder-press',
  'weighted-pullup': 'pull-ups',
  'incline-press': 'incline-dumbbell-press',
  'face-pull-wes': 'reverse-flys',
  'triceps-pushdown': 'cable-tricep-pushdowns',
  'barbell-curl': 'barbell-curls',

  'back-squat': 'hack-squat',
  'romanian-deadlift': 'romanian-deadlift',
  'leg-press': 'seated-leg-press',
  'leg-curl': 'lying-leg-curl',
  'standing-calf-raise-wes': 'standing-calf-raise',
  'core-side-plank-wes': 'front-plank',
  'core-ab-wheel': 'ab-wheel-rollout',

  'trap-bar-deadlift': 'deadlift',
  'bulgarian-split-squat-wes': 'barbell-lunges',
  'machine-chest-press': 'incline-dumbbell-press',
  'chest-supported-row': 'incline-dumbell-row',
  'neutral-pull': 'cable-lat-pulldown',
  'db-shoulder-press-wes': 'dumbbell-shoulder-press',
  'lateral-raise': 'lateral-raise',
  'arm-superset-wes': 'hammer-curls',
  'leg-extension-wes': 'leg-extensions',
  'leg-curl-pump': 'lying-leg-curl',
  'seated-calf-raise': 'seated-machine-calf-raises',
  'core-hanging-knee-raise-wes': 'hanging-knee-raise',
}

const withImages = (sessions: SessionTemplate[]): SessionTemplate[] =>
  sessions.map((session) => ({
    ...session,
    exercises: session.exercises.map((exercise) => {
      const slug = imageSlugById[exercise.id] ?? defaultImageSlug
      return {
        ...exercise,
        imageUrl: `${imageBase}/${slug}.webp`,
      }
    }),
  }))

const upperA: SessionTemplate = {
  id: 'A',
  title: 'Superior A',
  subtitle: 'Força + base (peito, costas e ombros)',
  exercises: [
    {
      id: 'flat-bench-press-wes',
      name: 'Supino reto com barra',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=supino+reto+barra+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [4, 6] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [4, 6], notes: 'Deload: -40–50% volume' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [4, 6] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [4, 6], notes: 'Taper: manter carga' }] },
      ],
    },
    {
      id: 'seated-row-heavy',
      name: 'Remada curvada com barra',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=remada+curvada+barra+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [5, 7] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [5, 7], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [5, 7] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [5, 7] }] },
      ],
    },
    {
      id: 'overhead-press',
      name: 'Desenvolvimento militar (em pé ou sentado)',
      focus: 'compound',
      rest: '2 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=desenvolvimento+militar+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [5, 7] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [5, 7], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [5, 7] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [5, 7] }] },
      ],
    },
    {
      id: 'weighted-pullup',
      name: 'Barra fixa pronada (ou puxada alta)',
      focus: 'compound',
      rest: '90–120s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=barra+fixa+pronada+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [6, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 8], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [6, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [6, 8] }] },
      ],
    },
    {
      id: 'incline-press',
      name: 'Supino inclinado com halteres',
      focus: 'compound',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=supino+inclinado+halteres+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 10] }] },
      ],
    },
    {
      id: 'face-pull-wes',
      name: 'Face pull',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 0–2',
      videoUrl: 'https://www.youtube.com/results?search_query=face+pull+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [12, 15] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [12, 15], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [12, 15] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [12, 15] }] },
      ],
    },
    {
      id: 'triceps-pushdown',
      name: 'Tríceps corda',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=triceps+corda+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 2, setRange: [2, 3], repRange: [10, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 1, repRange: [10, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 2, setRange: [2, 3], repRange: [10, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 12] }] },
      ],
      notes: 'Pode alternar com paralelas.',
    },
    {
      id: 'barbell-curl',
      name: 'Rosca direta',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=rosca+direta+barra+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 2, setRange: [2, 3], repRange: [10, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 1, repRange: [10, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 2, setRange: [2, 3], repRange: [10, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 12] }] },
      ],
      notes: 'Superset opcional com tríceps para ganhar tempo.',
    },
  ],
}

const lowerB: SessionTemplate = {
  id: 'B',
  title: 'Inferior A',
  subtitle: 'Força + base (quadríceps, posterior e core)',
  exercises: [
    {
      id: 'back-squat',
      name: 'Agachamento livre',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=agachamento+livre+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [4, 6] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [4, 6], notes: 'Deload: -40–50% volume' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [3, 5] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [4, 6], notes: 'Taper: manter carga' }] },
      ],
      notes: 'Se precisar, use Hack squat para manter qualidade técnica.',
    },
    {
      id: 'romanian-deadlift',
      name: 'Levantamento terra romeno (RDL)',
      focus: 'compound',
      rest: '2 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=terra+romeno+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [6, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 8], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [6, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [6, 8] }] },
      ],
    },
    {
      id: 'leg-press',
      name: 'Leg press',
      focus: 'compound',
      rest: '90–120s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=leg+press+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 10] }] },
      ],
    },
    {
      id: 'leg-curl',
      name: 'Mesa flexora',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 0–2',
      videoUrl: 'https://www.youtube.com/results?search_query=mesa+flexora+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [10, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [10, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [10, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 12] }] },
      ],
    },
    {
      id: 'standing-calf-raise-wes',
      name: 'Panturrilha em pé',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=panturrilha+em+pe+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [8, 12] }] },
      ],
      notes: '1s de pausa no topo e alongamento embaixo.',
    },
    {
      id: 'core-side-plank-wes',
      name: 'Prancha abdominal',
      focus: 'isolation',
      rest: '60s',
      rir: 'Tensão contínua',
      videoUrl: 'https://www.youtube.com/results?search_query=prancha+abdominal+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [30, 45], label: 'Segundos' }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [20, 35], label: 'Segundos', notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [30, 45], label: 'Segundos' }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [30, 40], label: 'Segundos' }] },
      ],
    },
    {
      id: 'core-ab-wheel',
      name: 'Ab wheel (ou crunch na polia)',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=ab+wheel+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12] }] },
      ],
    },
  ],
}

const fullBodyC: SessionTemplate = {
  id: 'C',
  title: 'Mix B Hipertrofia',
  subtitle: 'Upper B + blocos de Lower B (volume ajustado)',
  exercises: [
    {
      id: 'trap-bar-deadlift',
      name: 'Levantamento terra (trap bar ou tradicional técnico)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=trap+bar+deadlift+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [3, 5] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [3, 5], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [3, 5] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [3, 5] }] },
      ],
    },
    {
      id: 'bulgarian-split-squat-wes',
      name: 'Afundo búlgaro',
      focus: 'compound',
      rest: '90–120s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=afundo+bulgaro+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 10] }] },
      ],
      notes: 'Por perna.',
    },
    {
      id: 'machine-chest-press',
      name: 'Supino inclinado (barra ou halteres)',
      focus: 'compound',
      rest: '90–120s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=supino+inclinado+barra+halteres+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [6, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 8], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [6, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [6, 8] }] },
      ],
    },
    {
      id: 'chest-supported-row',
      name: 'Remada unilateral com halter',
      focus: 'compound',
      rest: '90–120s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=remada+unilateral+halter+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 10] }] },
      ],
      notes: 'Por lado.',
    },
    {
      id: 'neutral-pull',
      name: 'Puxada na frente neutra',
      focus: 'compound',
      rest: '90–120s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=puxada+neutra+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 10] }] },
      ],
    },
    {
      id: 'db-shoulder-press-wes',
      name: 'Desenvolvimento com halteres',
      focus: 'compound',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=desenvolvimento+halteres+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 10] }] },
      ],
    },
    {
      id: 'lateral-raise',
      name: 'Elevação lateral',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=elevacao+lateral+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [12, 20] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [12, 20], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [12, 20] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [12, 20] }] },
      ],
    },
    {
      id: 'arm-superset-wes',
      name: 'Superset braços (rosca martelo + tríceps francês)',
      focus: 'pump',
      rest: '60–90s',
      rir: 'RIR 0–2',
      videoUrl: 'https://www.youtube.com/results?search_query=rosca+martelo+triceps+frances+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [10, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [10, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [10, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 12] }] },
      ],
      notes: 'Alternar um exercício de bíceps e um de tríceps no mesmo bloco.',
    },
    {
      id: 'leg-extension-wes',
      name: 'Cadeira extensora',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=cadeira+extensora+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 2, setRange: [2, 3], repRange: [12, 15] }] },
        { weekRange: [4, 4], targets: [{ sets: 1, repRange: [12, 15], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [12, 15] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [12, 15] }] },
      ],
    },
    {
      id: 'leg-curl-pump',
      name: 'Mesa flexora (pump)',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=mesa+flexora+pump+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 2, setRange: [2, 3], repRange: [10, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 1, repRange: [10, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [10, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 12] }] },
      ],
    },
    {
      id: 'seated-calf-raise',
      name: 'Panturrilha sentada',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=panturrilha+sentada+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, setRange: [3, 4], repRange: [12, 15] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [12, 15], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [12, 15] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [12, 15] }] },
      ],
    },
    {
      id: 'core-hanging-knee-raise-wes',
      name: 'Abdominal infra / elevação de pernas',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=hanging+knee+raise+execucao',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [10, 15] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [10, 15], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [10, 15] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 15] }] },
      ],
    },
  ],
}

const warmup: Warmup = {
  duration: '8–10 min',
  items: [
    '5 min leve (bike/esteira)',
    'Mobilidade da articulação principal do dia (2–3 min)',
    '3–5 séries de aquecimento progressivo no primeiro exercício, sem falhar',
  ],
}

const deloadRule: DeloadRule = {
  weeks: [4, 8],
  guidance: 'Semana 4: -40–50% séries, RIR 3–4. Semana 8: taper com -30–40% volume mantendo carga.',
  reductionNote: 'Em deload/taper: reduza volume, mantenha técnica e termine a sessão com reserva.',
}

const schedule: ScheduleDay[] = [
  { day: 'Quinta-feira', sessionId: 'A' },
  { day: 'Sexta-feira', sessionId: 'B' },
  { day: 'Sábado', sessionId: 'C' },
]

const weeks: Week[] = [
  { number: 1, phase: 'Construção', emphasis: 'Base técnica + progressão controlada', deload: false },
  { number: 2, phase: 'Construção', emphasis: 'Consolidar repetições com execução limpa', deload: false },
  { number: 3, phase: 'Construção', emphasis: 'Bater topo de faixas sem falhar', deload: false },
  { number: 4, phase: 'Deload', emphasis: 'Cortar 40–50% do volume, RIR 3–4', deload: true },
  { number: 5, phase: 'Intensificação', emphasis: 'Mais carga nos compostos', deload: false },
  { number: 6, phase: 'Intensificação', emphasis: 'Manter técnica sob carga alta', deload: false },
  { number: 7, phase: 'Intensificação', emphasis: 'Consolidar força + manter acessórios', deload: false },
  { number: 8, phase: 'Taper', emphasis: 'Volume -30–40% mantendo carga', deload: true },
]

const phases: Phase[] = [
  {
    label: 'Construção (Sem 1–3)',
    weeks: [1, 2, 3],
    description: 'Força + base de hipertrofia com progressão dupla e técnica consistente.',
  },
  {
    label: 'Deload (Sem 4)',
    weeks: [4],
    description: 'Redução forte de volume para recuperar e manter desempenho no cutting.',
  },
  {
    label: 'Intensificação (Sem 5–7)',
    weeks: [5, 6, 7],
    description: 'Elevar carga dos compostos e preservar volume útil nos acessórios.',
  },
  {
    label: 'Taper (Sem 8)',
    weeks: [8],
    description: 'Diminuir fadiga mantendo estímulo neural para fechar o ciclo forte.',
  },
]

export const treinoWesley: Program = {
  name: 'Treino Wesley — 8 semanas (A/B/C)',
  durationWeeks: 8,
  schedule,
  sessions: withImages([upperA, lowerB, fullBodyC]),
  weeks,
  phases,
  warmup,
  deload: deloadRule,
  rules: [
    'Compostos: RIR 1–2. Acessórios: RIR 0–2 (falha real no máximo em 1–2 exercícios por sessão).',
    'Progressão dupla: só aumente carga quando bater o topo da faixa em todas as séries com técnica.',
    'Descanso: 2–3 min em compostos, 60–120s em acessórios conforme prescrição.',
    'Sessões de 70–90 min com registro de carga e repetições em todos os exercícios.',
    'Cardio: 2–3 sessões de 20–30 min moderado, priorizando dias sem perna pesada.',
  ],
  volumeAdjustments: [
    'Semana 4 é deload obrigatório: corte 40–50% das séries e use RIR 3–4.',
    'Semana 8 é taper: mantenha cargas, reduza 30–40% do volume e priorize sono/recuperação.',
    'Se a força cair por 2 semanas seguidas, retire 1–2 séries de acessórios e revise recuperação.',
    'Se recuperação estiver excelente, adicione +1 série em 1–2 acessórios (não em compostos).',
    'Se sessão C passar de 90 min, remova 1 bloco pump (braços ou isoladores de perna) no dia.',
  ],
}
