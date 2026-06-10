// Loader + (de)serializer for the runtime tv-channels.js file in /public.
// Same pattern as matches.js / site-config.js: a window.TV_CHANNELS array the
// admin panel edits and publishes to GitHub, served as a static script.

export const TV_CHANNEL_COUNT = 5

// A blank channel for slot `n` (1-based). Always 3 server slots.
export function blankChannel(n) {
  return { id: n, title: `TV ${n}`, servers: ['', '', ''] }
}

// Normalize any parsed array into exactly TV_CHANNEL_COUNT well-formed channels,
// each with exactly 3 server strings.
export function normalizeChannels(arr) {
  const list = Array.isArray(arr) ? arr : []
  return Array.from({ length: TV_CHANNEL_COUNT }, (_, i) => {
    const n = i + 1
    const src = list.find((c) => Number(c?.id) === n) || list[i] || {}
    const servers = Array.isArray(src.servers) ? src.servers.slice(0, 3) : []
    while (servers.length < 3) servers.push('')
    return {
      id: n,
      title: (src.title && String(src.title).trim()) || `TV ${n}`,
      servers: servers.map((s) => (typeof s === 'string' ? s.trim() : ''))
    }
  })
}

export function parseTvChannels(text) {
  // NOTE: greedy [\s\S]* (not *?) so we capture through the final ']' of the
  // outer array. tv-channels.js writes `servers: [...]` as the last field with
  // no trailing comma, so a non-greedy match would stop at channel 1's array.
  const m = text.match(/window\.TV_CHANNELS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/m)
  if (!m) throw new Error('Could not parse tv-channels.js — unexpected format')
  // eslint-disable-next-line no-new-func
  const arr = new Function('return ' + m[1])()
  return normalizeChannels(arr)
}

export function serializeTvChannels(arr) {
  const channels = normalizeChannels(arr)
  const lines = ['window.TV_CHANNELS = [']
  channels.forEach((c, i) => {
    const servers = c.servers.map((s) => JSON.stringify(typeof s === 'string' ? s.trim() : ''))
    lines.push('  {')
    lines.push(`    id: ${c.id},`)
    lines.push(`    title: ${JSON.stringify(c.title || `TV ${c.id}`)},`)
    lines.push(`    servers: [${servers.join(', ')}]`)
    lines.push('  }' + (i === channels.length - 1 ? '' : ','))
  })
  lines.push('];')
  lines.push('')
  return lines.join('\n')
}

// Fetch the live tv-channels.js served from /public.
export async function loadTvChannels() {
  const res = await fetch('/tv-channels.js', { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch tv-channels.js: ${res.status}`)
  const text = await res.text()
  return parseTvChannels(text)
}
