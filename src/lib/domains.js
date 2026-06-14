// Per-domain landing config. The main app (.com) is the single source of
// truth for match data; the .site domains below are lightweight landing
// pages that fetch the SAME match feed from .com at runtime, so editing
// matches on the main site updates all of them automatically.

// Where the .site domains pull match data + team logos from.
export const MAIN_ORIGIN = 'https://www.yallalivefootball.com'

// One entry per landing domain. Shared template, different text + colors.
const LANDINGS = {
  'yallalivefootball.site': {
    brand: 'Yalla Live Football',
    accent: '#ee335f',
    accent2: '#fac912',
    headline: 'Live Football Streams — Free & HD',
    subhead:
      "Today's biggest matches in one fast page. Premier League, La Liga, Champions League and more — kickoff times, scores and working stream links.",
    about: [
      'Yalla Live Football is a free, mobile-first hub for watching today’s top fixtures online. We pull together the day’s most important matches so you can find a working stream in one tap — no signup, no paywall.',
      'From the English Premier League and La Liga to the UEFA Champions League and World Cup 2026 qualifiers, every match card shows the league, local kickoff time and live status before you click.'
    ],
    email: 'contact@yallalivefootball.site'
  },
  'yallalivestream.site': {
    brand: 'Yalla Live Stream',
    accent: '#3b82f6',
    accent2: '#22d3ee',
    headline: 'Stream Live Football Anywhere',
    subhead:
      'Your fast guide to today’s live football streams. Tested servers, local kickoff times, and a clean layout built for phones and tablets.',
    about: [
      'Yalla Live Stream is a lightweight streaming guide for football fans. We list the day’s fixtures with verified stream links so you can switch servers instantly if one slows down.',
      'Coverage spans the top European leagues, the Champions League and Europa League, plus major international tournaments — all optimised for smooth mobile playback in HD where available.'
    ],
    email: 'contact@yallalivestream.site'
  },
  'yallalivetv.site': {
    brand: 'Yalla Live TV',
    accent: '#22c55e',
    accent2: '#a3e635',
    headline: 'Watch Football Live on Any Screen',
    subhead:
      'Live football TV for every device. Today’s schedule, real-time scores and one-tap streams for phone, tablet, laptop and smart-TV browsers.',
    about: [
      'Yalla Live TV brings today’s football matches to whatever screen you’re on. The schedule refreshes daily so you always see what’s live, when it starts in your timezone, and where to watch.',
      'We cover the Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and the major cup competitions — indexed alongside the headline matches of the day.'
    ],
    email: 'contact@yallalivetv.site'
  }
}

function normalizeHost(host) {
  return String(host || '').replace(/^www\./, '').toLowerCase()
}

// Returns the landing config for the current host, or null on the main app.
// Supports ?landing=<domain> for local previewing during development.
export function getLandingConfig(host) {
  if (typeof window === 'undefined') return null
  let key = normalizeHost(host || window.location.hostname)
  const override = new URLSearchParams(window.location.search).get('landing')
  if (override) key = normalizeHost(override)
  return LANDINGS[key] || null
}

export function isLandingHost(host) {
  return !!getLandingConfig(host)
}
