import { describe, it, expect } from 'vitest'
import { exerciseCatalog, catalogByMuscleGroup } from './exerciseCatalog'

const validMuscleGroups = ['Pernas', 'Gluteos', 'Peito', 'Costas', 'Ombros', 'Bracos', 'Core', 'Panturrilha']

describe('exerciseCatalog', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(exerciseCatalog)).toBe(true)
    expect(exerciseCatalog.length).toBeGreaterThan(0)
  })

  it('every entry has id, name, muscleGroup (non-empty string), focus, defaultRest (number > 0)', () => {
    for (const ex of exerciseCatalog) {
      expect(typeof ex.id).toBe('string')
      expect(ex.id.length).toBeGreaterThan(0)
      expect(typeof ex.name).toBe('string')
      expect(ex.name.length).toBeGreaterThan(0)
      expect(typeof ex.muscleGroup).toBe('string')
      expect(ex.muscleGroup.length).toBeGreaterThan(0)
      expect(['compound', 'isolation', 'pump']).toContain(ex.focus)
      expect(typeof ex.defaultRest).toBe('number')
      expect(ex.defaultRest).toBeGreaterThan(0)
    }
  })

  it('no duplicate IDs in exerciseCatalog', () => {
    const ids = exerciseCatalog.map((ex) => ex.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('every muscleGroup label is one of the valid Portuguese labels', () => {
    for (const ex of exerciseCatalog) {
      expect(validMuscleGroups).toContain(ex.muscleGroup)
    }
  })
})

describe('catalogByMuscleGroup', () => {
  it('covers all exerciseCatalog entries (sum of group lengths === catalog length)', () => {
    const total = catalogByMuscleGroup.reduce((sum, group) => sum + group.exercises.length, 0)
    expect(total).toBe(exerciseCatalog.length)
  })
})
