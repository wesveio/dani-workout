export function isIOSSafari(): boolean {
  const ua = window.navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  return isIOS && isSafari
}

export function isStandalone(): boolean {
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

const DISMISS_KEY = 'ios-banner-dismissed-until'

export function shouldShowBanner(): boolean {
  if (!isIOSSafari() || isStandalone()) return false
  const until = localStorage.getItem(DISMISS_KEY)
  if (!until) return true
  return Date.now() > Number(until)
}

export function dismissBanner(): void {
  const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000
  localStorage.setItem(DISMISS_KEY, String(sevenDays))
}
