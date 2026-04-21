export const AVATAR_COLORS = [
  '#2DD4BF', // Emerald
  '#818CF8', // Violet
  '#FB7185', // Rose
  '#FCD34D', // Amber
  '#38BDF8', // Sky
  '#FB923C', // Orange
] as const

export const pickColor = (existingCount: number): string =>
  AVATAR_COLORS[existingCount % AVATAR_COLORS.length]
