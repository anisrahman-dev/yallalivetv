// Internal "ad-free mode".
//
// Entered by appending ?board=1 to a link (the internal matches board links to
// the TV pages this way) or by visiting the internal board itself. Once on,
// it's remembered for the rest of the browser tab via sessionStorage, so
// switching channels or reloading keeps ads off without re-passing the flag.
export function enableAdFree() {
  try { sessionStorage.setItem('adFree', '1') } catch { /* ignore */ }
}

export function isAdFree() {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).has('board')) {
      sessionStorage.setItem('adFree', '1')
      return true
    }
    return sessionStorage.getItem('adFree') === '1'
  } catch {
    return false
  }
}
