export const epley = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0
  return Math.round(weight * (1 + reps / 30))
}
