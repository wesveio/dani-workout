import type { DeloadRule, Phase, Program, ScheduleDay, SessionTemplate, Warmup, Week } from './programTypes'

const imageBase = '/thumbs'
const defaultImageSlug = 'deadlift'
const imageSlugById: Record<string, string> = {
  'weighted-pullup': 'pull-ups',
  'seated-row-heavy': 'seated-machine-row',
  'overhead-press': 'dumbbell-shoulder-press',
  'lateral-raise': 'lateral-raise',
  'barbell-curl': 'barbell-curls',
  'triceps-pushdown': 'cable-tricep-pushdowns',
  'core-cable-crunch-wes': 'cable-crunch',
  'farmers-carry': 'deadlift',
  'core-pallof-wes': 'standing-abdominal-twist',
  'back-squat': 'hack-squat',
  'romanian-deadlift': 'romanian-deadlift',
  'leg-press': 'seated-leg-press',
  'leg-curl': 'lying-leg-curl',
  'standing-calf-raise-wes': 'standing-calf-raise',
  'core-ab-wheel': 'ab-wheel-rollout',
  'core-side-plank-wes': 'side-bends',
  'core-dead-bug-wes': 'abdominal-crunch',
  'trap-bar-deadlift': 'deadlift',
  'bulgarian-split-squat-wes': 'barbell-lunges',
  'chest-supported-row': 'incline-dumbell-row',
  'machine-chest-press': 'chest-press',
  'neutral-pull': 'cable-lat-pulldown',
  'leg-extension-wes': 'leg-extensions',
  'leg-curl-pump': 'lying-leg-curl',
  'seated-calf-raise': 'seated-machine-calf-raises',
  'core-hanging-knee-raise-wes': 'hanging-knee-raise',
  'core-reverse-crunch-wes': 'reverse-crunches',
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

const upperA: SessionTemplate = {
  id: 'A',
  title: 'Upper Strength',
  subtitle: 'Superior pesado — foco em força',
  exercises: [
    {
      id: 'incline-press',
      name: 'Supino inclinado (barra ou halter)',
      focus: 'compound',
      rest: '2–4 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=supino+inclinado+barra+tutorial+portugues',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [4, 6] }] },
        {
          weekRange: [4, 4],
          targets: [
            {
              sets: 2,
              repRange: [4, 6],
              notes: 'Deload: -40–50% séries, RIR 3–4',
            },
          ],
        },
        { weekRange: [5, 7], targets: [{ sets: 5, repRange: [3, 6] }] },
        {
          weekRange: [8, 8],
          targets: [
            {
              sets: 3,
              repRange: [4, 6],
              notes: 'Taper: manter carga e cortar volume (~30%)',
            },
          ],
        },
      ],
    },
    {
      id: 'weighted-pullup',
      name: 'Barra fixa com peso (ou Pulldown pesado)',
      focus: 'compound',
      rest: '2–4 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=barra+fixa+com+peso+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [4, 6] }] },
        {
          weekRange: [4, 4],
          targets: [{ sets: 2, repRange: [4, 6], notes: 'Deload leve' }],
        },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [4, 6] }] },
        {
          weekRange: [8, 8],
          targets: [{ sets: 3, repRange: [4, 6], notes: 'Taper: segure carga' }],
        },
      ],
      notes: 'Use Pulldown pesado se a barra fixa travar.',
    },
    {
      id: 'seated-row-heavy',
      name: 'Remada baixa pesada',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=remada+baixa+sentado+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [6, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 8], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [6, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [6, 8], notes: 'Taper' }] },
      ],
    },
    {
      id: 'overhead-press',
      name: 'Desenvolvimento (OHP / máquina)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=overhead+press+barra+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [6, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 8], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [6, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [6, 8], notes: 'Taper' }] },
      ],
    },
    {
      id: 'lateral-raise',
      name: 'Elevação lateral',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=eleva%C3%A7%C3%A3o+lateral+halteres+execu%C3%A7%C3%A3o',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [12, 20] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [12, 20], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [12, 20] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [12, 20], notes: 'Taper' }] },
      ],
      notes: 'Controle total, sem trapézio roubando.',
    },
    {
      id: 'barbell-curl',
      name: 'Rosca (barra ou halter)',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=rosca+barra+tutorial+portugues',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12], notes: 'Taper' }] },
      ],
      notes: 'Superset com tríceps.',
    },
    {
      id: 'triceps-pushdown',
      name: 'Tríceps (corda ou paralelas)',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=triceps+corda+polia+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12], notes: 'Taper' }] },
      ],
      notes: 'Superset com bíceps.',
    },
    {
      id: 'core-cable-crunch-wes',
      name: 'Core — Cable crunch',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=cable+crunch+no+pulley+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [10, 15] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [10, 15], notes: 'Deload: metade do volume' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [10, 15] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [10, 15] }] },
      ],
    },
    {
      id: 'farmers-carry',
      name: 'Core — Farmer’s carry pesado',
      focus: 'compound',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=farmers+walk+como+fazer',
      prescriptions: [
        {
          weekRange: [1, 3],
          targets: [{ sets: 4, repRange: [20, 40], label: 'Metros' }],
        },
        {
          weekRange: [4, 4],
          targets: [{ sets: 2, repRange: [20, 40], label: 'Metros', notes: 'Deload leve' }],
        },
        {
          weekRange: [5, 7],
          targets: [{ sets: 4, repRange: [20, 40], label: 'Metros' }],
        },
        {
          weekRange: [8, 8],
          targets: [{ sets: 3, repRange: [20, 40], label: 'Metros' }],
        },
      ],
      notes: 'Postura alta e pegada firme.',
    },
    {
      id: 'core-pallof-wes',
      name: 'Core — Pallof press',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=pallof+press+anti+rotacao+core',
      prescriptions: [
        {
          weekRange: [1, 3],
          targets: [{ sets: 3, repRange: [10, 12] }],
        },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [10, 12], notes: 'Deload' }] },
        {
          weekRange: [5, 7],
          targets: [{ sets: 3, repRange: [10, 12] }],
        },
        {
          weekRange: [8, 8],
          targets: [{ sets: 2, repRange: [10, 12] }],
        },
      ],
      notes: 'Controle anti-rotação, por lado.',
    },
  ],
}

const lowerB: SessionTemplate = {
  id: 'B',
  title: 'Lower Strength',
  subtitle: 'Pernas pesado — força e base',
  exercises: [
    {
      id: 'back-squat',
      name: 'Agachamento livre ou Hack squat',
      focus: 'compound',
      rest: '2–4 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=agachamento+livre+ou+hack+squat+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 5, repRange: [4, 6] }] },
        { weekRange: [4, 4], targets: [{ sets: 3, repRange: [4, 6], notes: 'Deload: -40–50% séries' }] },
        { weekRange: [5, 7], targets: [{ sets: 6, repRange: [3, 5] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [4, 6], notes: 'Taper: manter carga' }] },
      ],
      notes: 'Escolha a variação com melhor técnica hoje.',
    },
    {
      id: 'romanian-deadlift',
      name: 'Terra romeno (RDL)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=romanian+deadlift+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [6, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 8], notes: 'Deload leve' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [6, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [6, 8] }] },
      ],
    },
    {
      id: 'leg-press',
      name: 'Leg press',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=leg+press+45+graus+execu%C3%A7%C3%A3o',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'leg-curl',
      name: 'Mesa flexora',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=mesa+flexora+exercicio+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'standing-calf-raise-wes',
      name: 'Panturrilha em pé (pesado)',
      focus: 'isolation',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=panturrilha+em+p%C3%A9+smith+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 5, repRange: [6, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 3, repRange: [6, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 5, repRange: [6, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [6, 10] }] },
      ],
      notes: '1s de pausa no topo, alongar embaixo.',
    },
    {
      id: 'core-ab-wheel',
      name: 'Core — Ab wheel',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=ab+wheel+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [6, 10] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [6, 10] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [6, 10] }] },
      ],
    },
    {
      id: 'core-side-plank-wes',
      name: 'Core — Side plank',
      focus: 'isolation',
      rest: '60s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=prancha+lateral+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [25, 45], label: 'Segundos' }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [20, 35], label: 'Segundos', notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [25, 45], label: 'Segundos' }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [25, 45], label: 'Segundos' }] },
      ],
    },
    {
      id: 'core-dead-bug-wes',
      name: 'Core — Dead bug lento',
      focus: 'isolation',
      rest: '60s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=dead+bug+exercicio+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [6, 10], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12] }] },
      ],
      notes: 'Controle total; alternando por lado.',
    },
  ],
}

const fullBodyC: SessionTemplate = {
  id: 'C',
  title: 'Full Body Hypertrophy',
  subtitle: 'Volume + pontos fracos',
  exercises: [
    {
      id: 'trap-bar-deadlift',
      name: 'Trap bar deadlift (ou terra técnico leve)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 2',
      videoUrl: 'https://www.youtube.com/results?search_query=trap+bar+deadlift+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [5, 8] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [5, 8], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [5, 8] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [5, 8] }] },
      ],
      notes: 'Foque em potência, sem falhar.',
    },
    {
      id: 'bulgarian-split-squat-wes',
      name: 'Bulgarian split squat',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=afundo+bulgaro+como+fazer',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12] }] },
      ],
      notes: 'Cada perna.',
    },
    {
      id: 'chest-supported-row',
      name: 'Remada apoiada (chest-supported)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=chest+supported+row+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'machine-chest-press',
      name: 'Supino máquina/halter (controle total)',
      focus: 'compound',
      rest: '2–3 min',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=supino+m%C3%A1quina+peito+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'neutral-pull',
      name: 'Puxada neutra / Pullover na polia',
      focus: 'isolation',
      rest: '90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=puxada+neutra+pulley+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, repRange: [10, 15] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [10, 15], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, repRange: [10, 15] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [10, 15] }] },
      ],
    },
    {
      id: 'leg-extension-wes',
      name: 'Extensora (pump)',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=cadeira+extensora+execu%C3%A7%C3%A3o+correta',
      prescriptions: [
        {
          weekRange: [1, 3],
          targets: [{ sets: 2, setRange: [2, 3], repRange: [12, 20] }],
        },
        {
          weekRange: [4, 4],
          targets: [{ sets: 1, setRange: [1, 2], repRange: [12, 20], notes: 'Deload' }],
        },
        {
          weekRange: [5, 7],
          targets: [{ sets: 2, setRange: [2, 3], repRange: [12, 20] }],
        },
        {
          weekRange: [8, 8],
          targets: [{ sets: 2, repRange: [12, 20], notes: 'Taper: curto e eficiente' }],
        },
      ],
    },
    {
      id: 'leg-curl-pump',
      name: 'Flexora (pump)',
      focus: 'pump',
      rest: '60–90s',
      rir: 'Última série RIR 0–1',
      videoUrl: 'https://www.youtube.com/results?search_query=flexora+deitada+tutorial',
      prescriptions: [
        {
          weekRange: [1, 3],
          targets: [{ sets: 2, setRange: [2, 3], repRange: [12, 20] }],
        },
        {
          weekRange: [4, 4],
          targets: [{ sets: 1, setRange: [1, 2], repRange: [12, 20], notes: 'Deload' }],
        },
        {
          weekRange: [5, 7],
          targets: [{ sets: 2, setRange: [2, 3], repRange: [12, 20] }],
        },
        {
          weekRange: [8, 8],
          targets: [{ sets: 2, repRange: [12, 20] }],
        },
      ],
    },
    {
      id: 'seated-calf-raise',
      name: 'Panturrilha sentada',
      focus: 'isolation',
      rest: '90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=panturrilha+sentada+m%C3%A1quina+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 4, repRange: [12, 20] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [12, 20], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 4, repRange: [12, 20] }] },
        { weekRange: [8, 8], targets: [{ sets: 3, repRange: [12, 20] }] },
      ],
    },
    {
      id: 'core-hanging-knee-raise-wes',
      name: 'Core — Hanging knee raise',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=hanging+knee+raise+tutorial',
      prescriptions: [
        { weekRange: [1, 3], targets: [{ sets: 3, setRange: [3, 4], repRange: [8, 12] }] },
        { weekRange: [4, 4], targets: [{ sets: 2, repRange: [8, 12], notes: 'Deload' }] },
        { weekRange: [5, 7], targets: [{ sets: 3, setRange: [3, 4], repRange: [8, 12] }] },
        { weekRange: [8, 8], targets: [{ sets: 2, repRange: [8, 12] }] },
      ],
    },
    {
      id: 'core-reverse-crunch-wes',
      name: 'Core — Reverse crunch no banco',
      focus: 'isolation',
      rest: '60–90s',
      rir: 'RIR 1–2',
      videoUrl: 'https://www.youtube.com/results?search_query=reverse+crunch+no+banco+tutorial',
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
    'Mobilidade rápida: tornozelo/quadril/torácica (2–3 min)',
    'Ramp-up do 1º exercício (2–4 séries subindo carga, sem falhar)',
  ],
}

const deloadRule: DeloadRule = {
  weeks: [4, 8],
  guidance: 'Semana 4: -40–50% séries, RIR 3–4. Semana 8: taper com -30–40% volume mantendo carga.',
  reductionNote: 'Em deload/taper: corte volume, mantenha técnica e saia com energia.',
}

const schedule: ScheduleDay[] = [
  { day: 'Quinta-feira', sessionId: 'A' },
  { day: 'Sexta-feira', sessionId: 'B' },
  { day: 'Sábado', sessionId: 'C' },
]

const weeks: Week[] = [
  { number: 1, phase: 'Construção', emphasis: 'Base técnica e força', deload: false },
  { number: 2, phase: 'Construção', emphasis: 'Progressão controlada', deload: false },
  { number: 3, phase: 'Construção', emphasis: 'Consolidar cargas', deload: false },
  { number: 4, phase: 'Deload', emphasis: 'Reduzir 40–50% séries, RIR 3–4', deload: true },
  { number: 5, phase: 'Intensificação', emphasis: 'Mais pesado nos compostos', deload: false },
  { number: 6, phase: 'Intensificação', emphasis: 'Manter volume e técnica', deload: false },
  { number: 7, phase: 'Intensificação', emphasis: 'Força alta + acessórios estáveis', deload: false },
  { number: 8, phase: 'Taper', emphasis: 'Volume -30–40%, manter cargas', deload: true },
]

const phases: Phase[] = [
  {
    label: 'Construção (Sem 1–3)',
    weeks: [1, 2, 3],
    description: 'Força + base de volume; priorize técnica e progressão pequena semanal.',
  },
  {
    label: 'Deload (Sem 4)',
    weeks: [4],
    description: 'Reduzir séries em 40–50%, RIR 3–4, core pela metade.',
  },
  {
    label: 'Intensificação (Sem 5–7)',
    weeks: [5, 6, 7],
    description: 'Pesado nos compostos, acessórios mantendo volume para preservar músculo em cutting.',
  },
  {
    label: 'Taper (Sem 8)',
    weeks: [8],
    description: 'Segurar cargas e cortar volume ~30–40% para chegar recuperado e seco.',
  },
]

export const treinoWesley: Program = {
  name: 'Treino Wesley — 60 dias',
  durationWeeks: 8,
  schedule,
  sessions: withImages([upperA, lowerB, fullBodyC]),
  weeks,
  phases,
  warmup,
  deload: deloadRule,
  rules: [
    'Compostos: RIR 1–2; Isoladores: última série pode ir a RIR 0–1.',
    'Progressão dupla: só suba carga ao bater o topo de reps em todas as séries com técnica.',
    'Descanso: 2–4 min em compostos; 60–90s em isoladores.',
    'Sessões 70–90 min; registre carga e reps de tudo.',
  ],
  volumeAdjustments: [
    'Semana 4 é deload obrigatório: corte 40–50% das séries e use RIR 3–4.',
    'Semana 8 é um taper: mantenha cargas, reduza 30–40% do volume e priorize sono/recuperação.',
    'Se força cair por 2 semanas, reduza 1–2 séries dos acessórios ou ajuste recuperação/dieta.',
    'Se estiver recuperando muito bem, adicione +1 série em 1–2 acessórios (não nos compostos).',
  ],
}
