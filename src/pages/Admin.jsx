import { useEffect, useState, useRef, useCallback } from 'react'
import PageMeta from '../components/PageMeta.jsx'
import {
  LOGOS, LEAGUES, TEAM_LOGOS, TIME_SLOTS,
  PASSWORD_HASH, DEFAULTS, STORAGE, DEFAULT_SITE_CONFIG
} from '../lib/adminConstants.js'
import {
  sha256, parseMatchesJs, serializeMatchesJs, serializeSiteConfig,
  fetchMatchesFromGitHub, fetchSiteConfigFromGitHub, publishFile, testConnection as testConn,
  MATCHES_PATH, SITE_CONFIG_PATH
} from '../lib/adminGithub.js'

function useToast() {
  const [toast, setToast] = useState({ msg: '', kind: 'ok', visible: false })
  const tRef = useRef(null)
  const show = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind, visible: true })
    clearTimeout(tRef.current)
    tRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }, [])
  return { toast, show }
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE.gh)
  const saved = raw ? JSON.parse(raw) : {}
  return { ...DEFAULTS, ...saved }
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE.auth) === '1')
  return (
    <>
      <PageMeta title="Admin – Yalla Live" robots="noindex, nofollow" />
      {!authed ? <AuthGate onSuccess={() => setAuthed(true)} /> : <AdminUI onLogout={() => { sessionStorage.removeItem(STORAGE.auth); setAuthed(false) }} />}
    </>
  )
}

function AuthGate({ onSuccess }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    const hash = await sha256(pw)
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(STORAGE.auth, '1')
      setErr(false)
      onSuccess()
    } else {
      setErr(true)
      setPw('')
    }
  }
  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a] text-slate-100 font-sora">
      <div className="w-full max-w-sm bg-[#1e293b] border border-slate-700/50 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <img src="/logos/logo-unified.png" alt="Yalla Live" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="text-xl font-extrabold text-center mb-1">Admin Console</h1>
        <p className="text-xs text-slate-400 text-center mb-6">Enter password to continue</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            placeholder="Password"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee335f]"
            required
          />
          <button type="submit" className="w-full bg-[#ee335f] hover:bg-[#ee335f]/90 active:scale-[0.98] text-white font-bold rounded-xl py-3 text-sm uppercase tracking-wider transition-all">
            Sign In
          </button>
          {err && <p className="text-[11px] text-red-400 text-center">Wrong password</p>}
        </form>
      </div>
    </section>
  )
}

function AdminUI({ onLogout }) {
  const { toast, show } = useToast()
  const [settings, setSettings] = useState(loadSettings)
  const [matches, setMatches] = useState([])
  const [siteConfig, setSiteConfig] = useState({ ...DEFAULT_SITE_CONFIG })
  const [dirty, setDirty] = useState(false)
  const [siteConfigDirty, setSiteConfigDirty] = useState(false)
  const [connStatus, setConnStatus] = useState({ text: '', cls: 'text-slate-500' })
  const [publishing, setPublishing] = useState(false)

  // beforeunload guard
  useEffect(() => {
    const beforeUnload = (e) => {
      if (dirty || siteConfigDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty, siteConfigDirty])

  // Persist matches draft to localStorage when dirty
  useEffect(() => {
    if (dirty) localStorage.setItem(STORAGE.draft, JSON.stringify(matches))
    else localStorage.removeItem(STORAGE.draft)
  }, [dirty, matches])

  // Boot
  useEffect(() => {
    let cancelled = false
    async function boot() {
      // Site config: try GitHub, fall back to local file
      try {
        const { config } = await fetchSiteConfigFromGitHub(settings)
        if (!cancelled) setSiteConfig(config)
      } catch (_) {
        try {
          const r = await fetch('/site-config.js', { cache: 'no-store' })
          if (r.ok) {
            const text = await r.text()
            const m = text.match(/window\.SITE_CONFIG\s*=\s*(\{[\s\S]*?\})\s*;?\s*$/m)
            if (m) {
              // eslint-disable-next-line no-new-func
              const parsed = new Function('return ' + m[1])()
              if (!cancelled) setSiteConfig({ ...DEFAULT_SITE_CONFIG, ...parsed })
            }
          }
        } catch (_) { /* keep default */ }
      }

      // Matches: prefer draft, else GitHub, else local
      const draft = localStorage.getItem(STORAGE.draft)
      if (draft) {
        try {
          const arr = JSON.parse(draft)
          if (!cancelled) {
            setMatches(arr)
            setDirty(true)
            show('Restored unsaved draft', 'warn')
            fetchMatchesFromGitHub(settings).catch(() => {})
          }
          return
        } catch (_) {
          localStorage.removeItem(STORAGE.draft)
        }
      }
      try {
        const { matches: arr } = await fetchMatchesFromGitHub(settings)
        if (!cancelled) setMatches(arr)
      } catch (e) {
        try {
          const res = await fetch('/matches.js', { cache: 'no-store' })
          const text = await res.text()
          if (!cancelled) {
            setMatches(parseMatchesJs(text))
            show('Loaded local matches.js (GitHub unreachable — add token to publish)', 'warn')
          }
        } catch (e2) {
          if (!cancelled) show('Could not load matches: ' + e2.message, 'err')
        }
      }
    }
    boot()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveSettings = () => {
    localStorage.setItem(STORAGE.gh, JSON.stringify(settings))
    show('Settings saved')
    return settings
  }

  const handleTestConnection = async () => {
    saveSettings()
    try {
      await testConn(settings)
      setConnStatus({ text: '✓ Connected', cls: 'text-emerald-400' })
      show('Connection OK')
    } catch (e) {
      setConnStatus({ text: '✗ ' + e.message, cls: 'text-red-400' })
      show('Connection failed: ' + e.message, 'err')
    }
  }

  const handleReload = async () => {
    if ((dirty || siteConfigDirty) && !confirm('Discard unsaved changes and reload from GitHub?')) return
    try {
      const [{ matches: m }, { config: sc }] = await Promise.all([
        fetchMatchesFromGitHub(settings),
        fetchSiteConfigFromGitHub(settings)
      ])
      setMatches(m)
      setSiteConfig(sc)
      setDirty(false)
      setSiteConfigDirty(false)
      show('Reloaded from GitHub')
    } catch (e) {
      show(e.message, 'err')
    }
  }

  const validateMatches = () => {
    const ids = new Set()
    for (const m of matches) {
      if (!m.id) { show('Every match needs an ID', 'err'); return false }
      if (ids.has(m.id)) { show(`Duplicate ID: ${m.id}`, 'err'); return false }
      ids.add(m.id)
      if (!m.homeTeam?.name || !m.awayTeam?.name) {
        show(`Match ${m.id}: both team names required`, 'err'); return false
      }
    }
    return true
  }

  const handlePublish = async () => {
    const cfg = saveSettings()
    if (!cfg.token) { show('Add a GitHub token first', 'warn'); return }
    if (dirty && !validateMatches()) return
    if (!dirty && !siteConfigDirty) { show('Nothing to publish', 'warn'); return }

    setPublishing(true)
    try {
      const published = []
      if (dirty) {
        await publishFile(
          cfg, MATCHES_PATH,
          serializeMatchesJs(matches),
          `chore(matches): admin update (${matches.length} matches)`
        )
        setDirty(false)
        published.push('matches')
      }
      if (siteConfigDirty) {
        await publishFile(
          cfg, SITE_CONFIG_PATH,
          serializeSiteConfig(siteConfig),
          `chore(config): site settings updated (ads:${siteConfig.adsEnabled ? 'on' : 'off'}, vignette:${siteConfig.vignetteEnabled ? 'on' : 'off'}, multi:${siteConfig.multiAdEnabled ? 'on' : 'off'}, popunder:${siteConfig.popUnderEnabled ? 'on' : 'off'}, countdown:${siteConfig.countdownEnabled ? siteConfig.countdownSeconds + 's' : 'off'})`
        )
        setSiteConfigDirty(false)
        published.push('site config')
      }
      show('Published: ' + published.join(' + '))
    } catch (e) {
      console.error(e)
      show('Publish failed: ' + e.message, 'err')
    } finally {
      setPublishing(false)
    }
  }

  const addMatch = () => {
    const nextId = matches.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1
    setMatches((arr) => [...arr, {
      id: nextId, league: '', time: '', status: '', day: 'today', isImportant: false,
      servers: ['https://t.me'],
      homeTeam: { name: '', logo: LOGOS[0] },
      awayTeam: { name: '', logo: LOGOS[1] }
    }])
    setDirty(true)
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50)
  }

  const updateMatch = (idx, patch) => {
    setMatches((arr) => arr.map((m, i) => i === idx ? { ...m, ...patch } : m))
    setDirty(true)
  }

  const updateTeam = (idx, side, patch) => {
    setMatches((arr) => arr.map((m, i) => {
      if (i !== idx) return m
      const next = { ...m, [side]: { ...m[side], ...patch } }
      // Auto-suggest logo when team name matches a known one
      if (patch.name !== undefined && TEAM_LOGOS[patch.name]) {
        next[side].logo = TEAM_LOGOS[patch.name]
      }
      return next
    }))
    setDirty(true)
  }

  const deleteMatch = (idx) => {
    if (!confirm('Delete this match?')) return
    setMatches((arr) => arr.filter((_, i) => i !== idx))
    setDirty(true)
  }

  const updateServers = (idx, servers) => {
    setMatches((arr) => arr.map((m, i) => i === idx ? { ...m, servers } : m))
    setDirty(true)
  }

  return (
    <div className="bg-[#0f172a] text-slate-100 min-h-screen font-sora">
      <header className="sticky top-0 z-40 bg-[#1e293b]/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-[1100px] mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logos/logo-unified.png" alt="" className="h-8 sm:h-9 w-auto flex-shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ee335f]">Admin</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {(dirty || siteConfigDirty) && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#fac912]" title="Unsaved changes">●<span className="hidden sm:inline ml-1">Unsaved</span></span>
            )}
            <button onClick={handleReload} className="text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 transition flex items-center gap-1.5" title="Reload from GitHub">
              <span className="material-symbols-outlined text-base">refresh</span>
              <span className="hidden md:inline">Reload</span>
            </button>
            <button onClick={handlePublish} disabled={publishing} className={`text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-xl bg-[#ee335f] hover:bg-[#ee335f]/90 transition flex items-center gap-1.5 ${publishing ? 'opacity-60' : ''}`}>
              <span className="material-symbols-outlined text-base">cloud_upload</span>
              <span className="hidden sm:inline">Publish</span>
            </button>
            <button onClick={onLogout} className="text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-2 rounded-xl bg-slate-700/40 hover:bg-slate-700 transition" title="Sign out">
              <span className="material-symbols-outlined text-base align-middle">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <details className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden">
          <summary className="cursor-pointer select-none px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">settings</span>
              GitHub Connection
            </span>
            <span className={`text-[10px] ${connStatus.cls}`}>{connStatus.text}</span>
          </summary>
          <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {['owner', 'repo', 'branch'].map((k) => (
              <div key={k}>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{k}</label>
                <input
                  type="text"
                  value={settings[k]}
                  onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Personal Access Token <span className="text-slate-500 normal-case font-normal">(needs <code>repo</code> or <code>contents:write</code> scope)</span>
              </label>
              <input
                type="password"
                value={settings.token}
                onChange={(e) => setSettings((s) => ({ ...s, token: e.target.value }))}
                autoComplete="off"
                placeholder="ghp_…"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              <button onClick={saveSettings} className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition flex-1 sm:flex-initial">Save Settings</button>
              <button onClick={handleTestConnection} className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition flex-1 sm:flex-initial">Test Connection</button>
              <p className="text-[10px] text-slate-500 sm:ml-auto w-full sm:w-auto text-center sm:text-right">Stored in your browser only.</p>
            </div>
          </div>
        </details>

        <SiteSettings
          config={siteConfig}
          onChange={(patch) => { setSiteConfig((c) => ({ ...c, ...patch })); setSiteConfigDirty(true) }}
        />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">Matches</h2>
          <button onClick={addMatch} className="text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-xl bg-[#fac912] text-slate-900 hover:bg-[#fac912]/90 transition flex items-center gap-1.5 flex-shrink-0">
            <span className="material-symbols-outlined text-base">add</span>
            <span className="hidden sm:inline">Add Match</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="space-y-3">
          {matches.map((m, idx) => (
            <MatchRow
              key={idx}
              match={m}
              index={idx}
              onUpdate={(patch) => updateMatch(idx, patch)}
              onUpdateTeam={(side, patch) => updateTeam(idx, side, patch)}
              onUpdateServers={(servers) => updateServers(idx, servers)}
              onDelete={() => deleteMatch(idx)}
            />
          ))}
        </div>

        <p className="text-[11px] text-slate-500 text-center py-4">
          Changes here are saved to your browser as you type. Click <strong className="text-slate-300">Publish</strong> to commit <code>matches.js</code> to GitHub — your hosting will redeploy automatically.
        </p>
      </main>

      <div className={`fixed bottom-6 right-6 z-50 toast ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <span className={`material-symbols-outlined ${toast.kind === 'ok' ? 'text-emerald-400' : toast.kind === 'warn' ? 'text-[#fac912]' : 'text-red-400'}`}>
            {toast.kind === 'ok' ? 'check_circle' : toast.kind === 'warn' ? 'warning' : 'error'}
          </span>
          <span>{toast.msg || ' '}</span>
        </div>
      </div>

      <datalist id="leagues-list">
        {Object.keys(LEAGUES).map((l) => <option key={l} value={l} />)}
      </datalist>
      <datalist id="times-list">
        {TIME_SLOTS.map((t) => <option key={t} value={t} />)}
      </datalist>
    </div>
  )
}

function SiteSettings({ config, onChange }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-4 sm:p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-300 mb-3 sm:mb-4">Site Settings</h2>
      <div className="divide-y divide-slate-700/50">
        <Toggle label="Sidebar & banner ads" hint="Gutter skyscrapers + bottom match-section banner."
          checked={!!config.adsEnabled} onChange={(v) => onChange({ adsEnabled: v })} />
        <Toggle label="Vignette" hint="Full-page interstitial ad (Monetag zone 11036330)."
          checked={!!config.vignetteEnabled} onChange={(v) => onChange({ vignetteEnabled: v })} />
        <Toggle label="Multi ad" hint="Auto-format multi-ad tag (zone 241500)."
          checked={!!config.multiAdEnabled} onChange={(v) => onChange({ multiAdEnabled: v })} />
        <Toggle label="Pop Under" hint="Background pop-under tag (zone 11036346)."
          checked={!!config.popUnderEnabled} onChange={(v) => onChange({ popUnderEnabled: v })} />
        <Toggle label="Countdown popup" hint="When off, clicking a match opens the stream directly (no popup, no ad slot)."
          checked={config.countdownEnabled !== false} onChange={(v) => onChange({ countdownEnabled: v })} />
        <div className="flex items-center justify-between gap-3 sm:gap-4 py-3 last:pb-0">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-100">Countdown duration</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Seconds the popup waits before opening the stream (ignored if countdown is off).</p>
          </div>
          <input
            type="number" min="0" max="60" step="1"
            value={Number.isFinite(config.countdownSeconds) ? config.countdownSeconds : 10}
            onChange={(e) => onChange({ countdownSeconds: Number(e.target.value) || 0 })}
            className="w-20 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center font-bold"
          />
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 py-3 first:pt-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-100">{label}</div>
        {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="w-12 h-7 bg-slate-700 rounded-full peer-checked:bg-[#ee335f] transition-colors peer-focus:ring-2 peer-focus:ring-[#ee335f]/40 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"></div>
      </label>
    </div>
  )
}

function MatchRow({ match, index, onUpdate, onUpdateTeam, onUpdateServers, onDelete }) {
  const m = match
  const teamsListId = `teams-${index}`
  const teamSuggestions = LEAGUES[m.league] || []

  const initialServers = (() => {
    const s = Array.isArray(m.servers) ? m.servers.slice() : []
    if (s.length === 0 && m.link) return [m.link]
    if (s.length === 0) return ['']
    return s
  })()

  const setServer = (i, val) => {
    const next = initialServers.slice()
    next[i] = val
    onUpdateServers(next.filter((s, j) => j !== next.length - 1 ? true : true))
  }
  const addServer = () => onUpdateServers([...initialServers, ''])
  const removeServer = (i) => {
    if (initialServers.length <= 1) { onUpdateServers(['']); return }
    onUpdateServers(initialServers.filter((_, j) => j !== i))
  }

  const homeLogos = uniqueLogos(m.homeTeam?.logo)
  const awayLogos = uniqueLogos(m.awayTeam?.logo)

  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Match {m.id || index + 1}</span>
        <button onClick={onDelete} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">delete</span>
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">ID</label>
          <input type="number" value={m.id ?? ''} onChange={(e) => onUpdate({ id: Number(e.target.value) || 0 })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">League</label>
          <input type="text" list="leagues-list" autoComplete="off" value={m.league ?? ''} onChange={(e) => onUpdate({ league: e.target.value })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Time</label>
          <input type="text" list="times-list" autoComplete="off" value={m.time ?? ''} onChange={(e) => onUpdate({ time: e.target.value })} placeholder="7:00 PM" className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Day</label>
          <select value={m.day ?? 'today'} onChange={(e) => onUpdate({ day: e.target.value })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm">
            <option value="yesterday">yesterday</option>
            <option value="today">today</option>
            <option value="tomorrow">tomorrow</option>
          </select>
        </div>
        <div className="md:col-span-8">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
          <input type="text" value={m.status ?? ''} onChange={(e) => onUpdate({ status: e.target.value })} placeholder="It hasn't started yet." className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-4 flex items-center gap-3 pt-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!m.isImportant} onChange={(e) => onUpdate({ isImportant: e.target.checked })} className="rounded border-slate-700 bg-slate-900/80 text-[#ee335f] focus:ring-[#ee335f]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Featured</span>
          </label>
        </div>
        <div className="md:col-span-12">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Stream Servers</label>
            <button type="button" onClick={addServer} className="text-[10px] font-bold uppercase tracking-wider text-[#fac912] hover:underline">+ Add Server</button>
          </div>
          <div className="space-y-2">
            {initialServers.map((url, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-16 flex-shrink-0 text-right pr-1">Server {i + 1}</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const next = initialServers.slice()
                    next[i] = e.target.value
                    onUpdateServers(next)
                  }}
                  placeholder="https://t.me"
                  className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => removeServer(i)} className="text-slate-500 hover:text-red-400 transition px-2 py-1 text-lg flex-shrink-0 leading-none">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Home Team Name</label>
          <input type="text" list={teamsListId} autoComplete="off" value={m.homeTeam?.name ?? ''} onChange={(e) => onUpdateTeam('homeTeam', { name: e.target.value })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Home Team Logo</label>
          <select value={m.homeTeam?.logo ?? ''} onChange={(e) => onUpdateTeam('homeTeam', { logo: e.target.value })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm">
            {homeLogos.map((path) => <option key={path} value={path}>{path.replace('logos/', '').replace('.svg', '')}</option>)}
          </select>
        </div>
        <div className="md:col-span-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Away Team Name</label>
          <input type="text" list={teamsListId} autoComplete="off" value={m.awayTeam?.name ?? ''} onChange={(e) => onUpdateTeam('awayTeam', { name: e.target.value })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Away Team Logo</label>
          <select value={m.awayTeam?.logo ?? ''} onChange={(e) => onUpdateTeam('awayTeam', { logo: e.target.value })} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm">
            {awayLogos.map((path) => <option key={path} value={path}>{path.replace('logos/', '').replace('.svg', '')}</option>)}
          </select>
        </div>
        <datalist id={teamsListId}>
          {teamSuggestions.map((t) => <option key={t} value={t} />)}
        </datalist>
      </div>
    </div>
  )
}

function uniqueLogos(current) {
  const seen = new Set()
  const all = [...LOGOS]
  if (current && !LOGOS.includes(current)) all.unshift(current)
  const out = []
  for (const p of all) {
    if (seen.has(p)) continue
    seen.add(p)
    out.push(p)
  }
  return out
}
