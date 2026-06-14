import { useEffect, useMemo, useState } from 'react'
import LandingLayout from './LandingLayout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import MatchCard from '../components/MatchCard.jsx'
import RedirectModal from '../components/RedirectModal.jsx'
import { loadMatches } from '../lib/matches.js'
import { MAIN_ORIGIN } from '../lib/domains.js'

export default function LandingHome({ cfg }) {
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('today')
  const [openServers, setOpenServers] = useState(null)

  // Pull the SAME match feed the main .com site uses, cross-origin.
  useEffect(() => {
    loadMatches(MAIN_ORIGIN).then(setMatches).catch(() => setMatches([]))
  }, [])

  const visible = useMemo(() => {
    if (tab === 'today') return matches.filter((m) => m.day === 'today')
    return matches.filter((m) => m.day === tab)
  }, [tab, matches])

  const emptyMessage =
    tab === 'tomorrow' ? 'There is no match tomorrow.'
    : tab === 'yesterday' ? 'There is no match yesterday.'
    : 'There is no match today.'

  const handleOpen = (matchId, servers) => setOpenServers(servers)

  const TABS = [
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' }
  ]

  return (
    <LandingLayout cfg={cfg}>
      <PageMeta
        title={`${cfg.brand} | ${cfg.headline}`}
        description={cfg.subhead}
        keywords={`${cfg.brand}, live football, football streaming, live scores, match schedule`}
        ogTitle={`${cfg.brand} | ${cfg.headline}`}
        ogDescription={cfg.subhead}
      />

      {/* Hero */}
      <section
        className="px-4 py-16 md:py-24"
        style={{ background: `radial-gradient(1200px 400px at 50% -10%, ${cfg.accent}22, transparent)` }}
      >
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {cfg.headline}
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {cfg.subhead}
          </p>
          <a
            href="#matches"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl font-extrabold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: cfg.accent }}
          >
            <span className="material-symbols-outlined">sports_soccer</span>
            See Today’s Matches
          </a>
        </div>
      </section>

      {/* Matches */}
      <section id="matches" className="px-4 pb-16 max-w-[1000px] mx-auto scroll-mt-20">
        <div className="flex justify-center gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
              style={
                tab === t.key
                  ? { background: cfg.accent, color: '#fff' }
                  : { background: '#1e293b', color: '#cbd5e1' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {visible.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">{emptyMessage}</div>
          ) : (
            visible.map((m) => (
              <MatchCard key={m.id} match={m} onOpen={handleOpen} assetBase={MAIN_ORIGIN} />
            ))
          )}
        </div>
      </section>

      {/* About */}
      <section className="px-4 py-14 bg-[#0b1325] border-t border-slate-800">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 tracking-tight">
            About {cfg.brand}
          </h2>
          {cfg.about.map((p, i) => (
            <p key={i} className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
              {p}
            </p>
          ))}
        </div>
      </section>

      <RedirectModal
        open={!!openServers}
        servers={openServers || []}
        countdownSeconds={10}
        onClose={() => setOpenServers(null)}
      />
    </LandingLayout>
  )
}
