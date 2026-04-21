const MINUTES_PATTERN = /(min|mins|minute|minuto)/i
const SECONDS_PATTERN = /(s\b|sec|seg|segundo)/i
const NUMBER_PATTERN = /\d+(?:[.,]\d+)?/g

const parseNumber = (value: string) => Number(value.replace(',', '.'))

const MAX_REST = 600

export const parseRestDuration = (value?: string, fallbackSeconds = 90): number => {
  if (!value) return Math.min(fallbackSeconds, MAX_REST)

  const text = value.trim().toLowerCase()
  const matches = text.match(NUMBER_PATTERN)
  if (!matches || matches.length === 0) return Math.min(fallbackSeconds, MAX_REST)

  const primary = parseNumber(matches[0])
  if (!Number.isFinite(primary) || primary <= 0) return Math.min(fallbackSeconds, MAX_REST)

  const hasMinutes = MINUTES_PATTERN.test(text)
  const hasSeconds = SECONDS_PATTERN.test(text)

  if (hasMinutes) return Math.min(Math.round(primary * 60), MAX_REST)
  if (hasSeconds) return Math.min(Math.round(primary), MAX_REST)

  // No explicit unit: short values likely mean minutes, long values seconds.
  return primary <= 10
    ? Math.min(Math.round(primary * 60), MAX_REST)
    : Math.min(Math.round(primary), MAX_REST)
}

export const formatRestClock = (seconds: number): string => {
  const mins = Math.floor(Math.max(0, seconds) / 60)
  const secs = Math.max(0, seconds) % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
