import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function setUA(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  })
}

function setStandalone(value: boolean | undefined) {
  Object.defineProperty(window.navigator, 'standalone', {
    value,
    configurable: true,
  })
}

describe('isIOSSafari', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('returns true when UA contains iPhone + Safari and not CriOS', async () => {
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
    const { isIOSSafari } = await import('./iosInstall')
    expect(isIOSSafari()).toBe(true)
  })

  it('returns false for Chrome on iOS (UA contains CriOS)', async () => {
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1')
    const { isIOSSafari } = await import('./iosInstall')
    expect(isIOSSafari()).toBe(false)
  })

  it('returns false for desktop Safari UA', async () => {
    setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15')
    const { isIOSSafari } = await import('./iosInstall')
    expect(isIOSSafari()).toBe(false)
  })
})

describe('isStandalone', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('returns true when navigator.standalone is true', async () => {
    setStandalone(true)
    const { isStandalone } = await import('./iosInstall')
    expect(isStandalone()).toBe(true)
  })

  it('returns false when navigator.standalone is undefined', async () => {
    setStandalone(undefined)
    const { isStandalone } = await import('./iosInstall')
    expect(isStandalone()).toBe(false)
  })
})

describe('shouldShowBanner', () => {
  const DISMISS_KEY = 'ios-banner-dismissed-until'

  beforeEach(() => {
    localStorage.clear()
    // Default: iOS Safari, non-standalone
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
    setStandalone(false)
  })

  afterEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('returns false when not iOS Safari', async () => {
    setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15')
    const { shouldShowBanner } = await import('./iosInstall')
    expect(shouldShowBanner()).toBe(false)
  })

  it('returns false when standalone is true', async () => {
    setStandalone(true)
    const { shouldShowBanner } = await import('./iosInstall')
    expect(shouldShowBanner()).toBe(false)
  })

  it('returns true on iOS Safari non-standalone with no dismiss flag', async () => {
    const { shouldShowBanner } = await import('./iosInstall')
    expect(shouldShowBanner()).toBe(true)
  })

  it('returns false when dismiss timestamp is in the future', async () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 1_000_000))
    const { shouldShowBanner } = await import('./iosInstall')
    expect(shouldShowBanner()).toBe(false)
  })

  it('returns true when dismiss timestamp is in the past', async () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1_000_000))
    const { shouldShowBanner } = await import('./iosInstall')
    expect(shouldShowBanner()).toBe(true)
  })
})

describe('dismissBanner', () => {
  const DISMISS_KEY = 'ios-banner-dismissed-until'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('sets localStorage key to ~7 days from now', async () => {
    const before = Date.now()
    const { dismissBanner } = await import('./iosInstall')
    dismissBanner()
    const after = Date.now()

    const stored = Number(localStorage.getItem(DISMISS_KEY))
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

    expect(stored).toBeGreaterThanOrEqual(before + sevenDaysMs)
    expect(stored).toBeLessThanOrEqual(after + sevenDaysMs)
  })
})
