const MINUTES_PATTERN = /(min|mins|minute|minuto)/i
const SECONDS_PATTERN = /(s\b|sec|seg|segundo)/i
const NUMBER_PATTERN = /\d+(?:[.,]\d+)?/g

const parseNumber = (value: string) => Number(value.replace(',', '.'))

export const parseRestDuration = (value?: string, fallbackSeconds = 90): number => {
  if (!value) return fallbackSeconds

  const text = value.trim().toLowerCase()
  const matches = text.match(NUMBER_PATTERN)
  if (!matches || matches.length === 0) return fallbackSeconds

  const primary = parseNumber(matches[0])
  if (!Number.isFinite(primary) || primary <= 0) return fallbackSeconds

  const hasMinutes = MINUTES_PATTERN.test(text)
  const hasSeconds = SECONDS_PATTERN.test(text)

  if (hasMinutes) return Math.round(primary * 60)
  if (hasSeconds) return Math.round(primary)

  // No explicit unit: short values likely mean minutes, long values seconds.
  return primary <= 10 ? Math.round(primary * 60) : Math.round(primary)
}

export const formatRestClock = (seconds: number): string => {
  const mins = Math.floor(Math.max(0, seconds) / 60)
  const secs = Math.max(0, seconds) % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
