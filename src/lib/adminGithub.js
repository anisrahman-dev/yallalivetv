import { DEFAULT_SITE_CONFIG } from './adminConstants.js'

export async function sha256(text) {
  const buf = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function ghHeaders(cfg) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  if (cfg.token) headers.Authorization = 'Bearer ' + cfg.token
  return headers
}

// matches.js / site-config.js live in the Vite public/ directory of the React
// app, so the GitHub paths are public/matches.js and public/site-config.js.
export const MATCHES_PATH = 'public/matches.js'
export const SITE_CONFIG_PATH = 'public/site-config.js'

export function ghContentsUrl(cfg, path = MATCHES_PATH) {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`
}

export function parseMatchesJs(text) {
  const m = text.match(/const\s+MATCHES_DATA\s*=\s*(\[[\s\S]*?\]);?\s*$/m)
  if (!m) throw new Error('Could not parse matches.js — unexpected format')
  // eslint-disable-next-line no-new-func
  const arr = new Function('return ' + m[1])()
  if (!Array.isArray(arr)) throw new Error('matches.js did not produce an array')
  return arr
}

export function serializeMatchesJs(arr) {
  const lines = ['const MATCHES_DATA = [']
  arr.forEach((m, i) => {
    lines.push('  {')
    lines.push(`    id: ${Number(m.id) || 0},`)
    lines.push(`    league: ${JSON.stringify(m.league || '')},`)
    lines.push(`    time: ${JSON.stringify(m.time || '')},`)
    lines.push(`    status: ${JSON.stringify(m.status || '')},`)
    lines.push(`    day: ${JSON.stringify(m.day || 'today')},`)
    lines.push(`    isImportant: ${!!m.isImportant},`)
    const servers = (Array.isArray(m.servers) ? m.servers : (m.link ? [m.link] : []))
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean)
    lines.push(`    servers: ${JSON.stringify(servers)},`)
    lines.push('    homeTeam: {')
    lines.push(`      name: ${JSON.stringify(m.homeTeam?.name || '')},`)
    lines.push(`      logo: ${JSON.stringify(m.homeTeam?.logo || '')}`)
    lines.push('    },')
    lines.push('    awayTeam: {')
    lines.push(`      name: ${JSON.stringify(m.awayTeam?.name || '')},`)
    lines.push(`      logo: ${JSON.stringify(m.awayTeam?.logo || '')}`)
    lines.push('    }')
    lines.push('  }' + (i === arr.length - 1 ? '' : ','))
  })
  lines.push('];')
  lines.push('')
  return lines.join('\n')
}

export function parseSiteConfig(text) {
  const m = text.match(/window\.SITE_CONFIG\s*=\s*(\{[\s\S]*?\})\s*;?\s*$/m)
  if (!m) return { ...DEFAULT_SITE_CONFIG }
  // eslint-disable-next-line no-new-func
  const parsed = new Function('return ' + m[1])()
  return { ...DEFAULT_SITE_CONFIG, ...parsed }
}

export function serializeSiteConfig(cfg) {
  return `window.SITE_CONFIG = ${JSON.stringify(cfg, null, 2)};\n`
}

export async function fetchMatchesFromGitHub(cfg) {
  if (!cfg.owner || !cfg.repo) throw new Error('Owner/repo required')
  const url = `${ghContentsUrl(cfg)}?ref=${encodeURIComponent(cfg.branch)}`
  const res = await fetch(url, { headers: ghHeaders(cfg) })
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status} ${res.statusText}`)
  const data = await res.json()
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
  return { matches: parseMatchesJs(content), sha: data.sha }
}

export async function fetchSiteConfigFromGitHub(cfg) {
  if (!cfg.owner || !cfg.repo) throw new Error('Owner/repo required')
  const url = `${ghContentsUrl(cfg, SITE_CONFIG_PATH)}?ref=${encodeURIComponent(cfg.branch)}`
  const res = await fetch(url, { headers: ghHeaders(cfg), cache: 'no-store' })
  if (res.status === 404) return { config: { ...DEFAULT_SITE_CONFIG }, sha: null }
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`)
  const data = await res.json()
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
  return { config: parseSiteConfig(content), sha: data.sha }
}

export async function publishFile(cfg, path, content, message) {
  const headUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`
  const headRes = await fetch(headUrl, { headers: ghHeaders(cfg), cache: 'no-store' })
  let sha = null
  if (headRes.ok) sha = (await headRes.json()).sha
  else if (headRes.status !== 404) throw new Error(`Could not read current ${path}: ${headRes.status}`)
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: cfg.branch
  }
  if (sha) body.sha = sha
  const writeUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`
  const res = await fetch(writeUrl, {
    method: 'PUT',
    headers: { ...ghHeaders(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  return data.content.sha
}

export async function testConnection(cfg) {
  if (!cfg.owner || !cfg.repo) throw new Error('Owner and repo are required')
  const url = `${ghContentsUrl(cfg)}?ref=${encodeURIComponent(cfg.branch)}`
  let res
  try {
    res = await fetch(url, { headers: ghHeaders(cfg), cache: 'no-store' })
  } catch (e) {
    throw new Error(`Network error reaching GitHub (${e.message})`)
  }
  if (res.ok) return true
  if (res.status === 401) throw new Error('401 — invalid or expired token (clear it for a public repo, or paste a fresh one)')
  if (res.status === 403) throw new Error('403 — rate limited or token missing the repo/contents scope')
  if (res.status === 404) throw new Error(`404 — ${MATCHES_PATH} not found on ${cfg.owner}/${cfg.repo}@${cfg.branch}`)
  throw new Error(`${res.status} ${res.statusText}`)
}
