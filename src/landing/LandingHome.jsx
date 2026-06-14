import { useEffect, useMemo, useState } from 'react'
import LandingLayout from './LandingLayout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import MatchCard from '../components/MatchCard.jsx'
import RedirectModal from '../components/RedirectModal.jsx'
import LandingGutterAds from './LandingGutterAds.jsx'
import { loadMatches } from '../lib/matches.js'
import { MAIN_ORIGIN } from '../lib/domains.js'

// Mirrors the main site's structured data (WebSite + ItemList navigation),
// branded for this landing domain. Helps Google build sitelinks from today's
// matches and recognise each .site as its own distinct site.
function injectLandingSchema(cfg, todayMatches) {
  const origin = window.location.origin
  const navElements = todayMatches.slice(0, 4).map((m, idx) => ({
    '@type': 'SiteNavigationElement',
    position: idx + 1,
    name: `${m.homeTeam.name} vs ${m.awayTeam.name} Live`,
    description: `Watch today's live stream of ${m.homeTeam.name} vs ${m.awayTeam.name} on ${cfg.brand}. Real-time links and scores.`,
    url: `${origin}/#match-${m.id}`
  }))
  if (navElements.length === 0) {
    navElements.push({
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'Live Football Schedule Today',
      description: `Watch free live streaming of today's most important matches on ${cfg.brand}.`,
      url: `${origin}/`
    })
  }
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: cfg.brand,
        description: cfg.subhead,
        publisher: { '@type': 'Organization', name: cfg.brand, url: origin }
      },
      {
        '@type': 'ItemList',
        '@id': `${origin}/#navigation`,
        name: "Today's Live Football Match Sitelinks",
        itemListElement: navElements
      }
    ]
  }
  const id = 'landing-seo-schema'
  document.getElementById(id)?.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.text = JSON.stringify(schema)
  document.head.appendChild(script)
}

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

  const todayImportant = useMemo(
    () => matches.filter((m) => m.day === 'today' && m.isImportant),
    [matches]
  )

  useEffect(() => {
    if (matches.length === 0) return
    injectLandingSchema(cfg, todayImportant)
  }, [cfg, matches, todayImportant])

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
        keywords={cfg.keywords || `${cfg.brand}, live football, football streaming, live scores, match schedule`}
        robots="index, follow"
        ogTitle={`${cfg.brand} | ${cfg.headline}`}
        ogDescription={cfg.subhead}
        ogType="website"
        ogUrl={typeof window !== 'undefined' ? window.location.origin + '/' : undefined}
        twitterCard="summary_large_image"
        twitterTitle={`${cfg.brand} | ${cfg.headline}`}
        twitterDescription={cfg.subhead}
      />

      {/* Content wrapper — relative anchor for the gutter ads. min-height on
          ultra-wide screens guarantees the wrapper is taller than the ad stack
          so the footer (rendered outside it) never overlaps the skyscrapers. */}
      <div className="relative min-[1740px]:min-h-[1290px]">
      <LandingGutterAds adKey={cfg.skyscraperAdKey} />

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
      </div>

      <RedirectModal
        open={!!openServers}
        servers={openServers || []}
        countdownSeconds={10}
        onClose={() => setOpenServers(null)}
      />
    </LandingLayout>
  )
}
