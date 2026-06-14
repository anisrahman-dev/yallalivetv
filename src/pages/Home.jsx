import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import MatchCard from '../components/MatchCard.jsx'
import IframeAd from '../components/IframeAd.jsx'
import GutterAds from '../components/GutterAds.jsx'
import { loadMatches, FOOT_ORIGIN } from '../lib/matches.js'
import { getSiteConfig } from '../lib/siteConfig.js'

// 728x90 leaderboard (Adsterra) — desktop
const AD_LEADERBOARD = `
<script type="text/javascript">
  atOptions = { 'key':'26eba25e14e03d0c9c83a51f38af81c2','format':'iframe','height':90,'width':728,'params':{} };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/26eba25e14e03d0c9c83a51f38af81c2/invoke.js"></script>`

// 320x50 banner (Adsterra) — mobile
const AD_MOBILE_BANNER = `
<script type="text/javascript">
  atOptions = { 'key':'1ff571e3b1f77fc6868d3228d5540a76','format':'iframe','height':50,'width':320,'params':{} };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/1ff571e3b1f77fc6868d3228d5540a76/invoke.js"></script>`

function HomeBannerAd({ className = '' }) {
  return (
    <>
      <div className={`hidden sm:flex justify-center ${className}`}>
        <IframeAd html={AD_LEADERBOARD} width={728} height={90} />
      </div>
      <div className={`flex sm:hidden justify-center ${className}`}>
        <IframeAd html={AD_MOBILE_BANNER} width={320} height={50} />
      </div>
    </>
  )
}

function injectSiteNavigationSchema(todayMatches) {
  const origin = window.location.origin
  const navElements = todayMatches.slice(0, 4).map((m, idx) => ({
    '@type': 'SiteNavigationElement',
    position: idx + 1,
    name: `${m.homeTeam.name} vs ${m.awayTeam.name} Live`,
    description: `Watch today's live stream of ${m.homeTeam.name} vs ${m.awayTeam.name} on Yalla Live TV.`,
    url: `${origin}/#match-${m.id}`
  }))
  if (navElements.length === 0) {
    navElements.push({
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'Live Football Schedule Today',
      description: "Watch today's most important matches live on Yalla Live TV.",
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
        name: 'Yalla Live TV',
        publisher: { '@type': 'Organization', name: 'Yalla Live TV', logo: { '@type': 'ImageObject', url: `${origin}/logos/logo-unified.png` } }
      },
      { '@type': 'ItemList', '@id': `${origin}/#navigation`, name: "Today's Live Football Match Sitelinks", itemListElement: navElements }
    ]
  }
  const id = 'yalla-sitenav-schema'
  document.getElementById(id)?.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.text = JSON.stringify(schema)
  document.head.appendChild(script)
}

const TABS = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' }
]

export default function Home() {
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('today')
  const [today, setToday] = useState('')

  // Match data lives on the main Yalla Live Football site; we read it from there.
  useEffect(() => {
    loadMatches().then(setMatches).catch(() => setMatches([]))
  }, [])

  useEffect(() => {
    const opts = { month: 'short', day: 'numeric', year: 'numeric' }
    setToday('- ' + new Date().toLocaleDateString('en-US', opts))
  }, [])

  const todayImportant = useMemo(
    () => matches.filter((m) => m.day === 'today' && m.isImportant),
    [matches]
  )

  useEffect(() => {
    if (matches.length === 0) return
    injectSiteNavigationSchema(todayImportant)
  }, [matches, todayImportant])

  const visible = useMemo(() => matches.filter((m) => m.day === tab), [tab, matches])

  const emptyMessage = useMemo(() => {
    if (tab === 'tomorrow') return 'There is no match tomorrow.'
    if (tab === 'yesterday') return 'There is no match yesterday.'
    return 'There is no match today.'
  }, [tab])

  // "Send to foot": clicking any match opens the main Yalla Live Football site
  // to watch the stream there.
  const handleOpen = () => {
    window.open(FOOT_ORIGIN + '/', '_blank', 'noopener')
  }

  const config = getSiteConfig()

  return (
    <Layout withWcBar>
      <PageMeta
        title="Yalla Live TV | Watch Football Live on Any Screen"
        description="Yalla Live TV — watch live football on any screen. Today's matches, kickoff times and live scores for the Premier League, La Liga, Champions League and more."
        keywords="Yalla Live TV, yalla tv, live football tv, watch football live, live soccer tv, yalla shoot tv, koora live tv, football live streaming, live scores, match schedule"
        ogTitle="Yalla Live TV | Watch Football Live on Any Screen"
        ogDescription="Live football TV for every device. Today's schedule, real-time scores and one-tap streams."
      />

      <GutterAds />

      <main className="pt-[176px] md:pt-[156px] pb-6 md:pb-16 max-w-[1000px] mx-auto min-h-screen px-4">
        <div className="mb-6">
          <h1 className="green-sub-bar shadow-sm block m-0">Yalla Live TV - Watch Football Live on Any Screen</h1>
        </div>

        {config.adsEnabled && <HomeBannerAd className="mb-6" />}

        <section className="mb-8 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 md:p-7 shadow-sm" aria-labelledby="about-yalla-live-tv">
          <h2 id="about-yalla-live-tv" className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            Live Football TV — Every League, Every Device
          </h2>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
            <strong className="text-primary">Yalla Live TV</strong> brings today’s football matches to whatever screen you’re on — phone, tablet, laptop or smart-TV browser. Follow the <strong>English Premier League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>, <strong>Bundesliga</strong> and <strong>Ligue 1</strong> with kickoff times, live scores and one-tap access to the stream.
          </p>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
            The schedule refreshes daily, so you always see today’s, yesterday’s and tomorrow’s fixtures up top — including the <strong>UEFA Champions League</strong>, <strong>Europa League</strong> and <strong>FIFA World Cup 2026</strong> qualifiers. Tap any match to watch it live.
          </p>
        </section>

        <div className="main-wrapper">
          <div className="flex justify-center items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="league-pill text-xs font-bold uppercase px-4 md:px-6 py-2.5 rounded shadow-sm transition-all flex items-center gap-1 text-center"
                style={tab === t.key ? { transform: 'scale(1.05)', opacity: 1, border: '2px solid #ffffff' } : { transform: 'scale(1)', opacity: 0.75, border: 'none' }}
              >
                <span>{t.label}</span>
                {t.key === 'today' && <span className="text-accent">{today}</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4" id="matches-container">
            {visible.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400 font-medium">{emptyMessage}</div>
            ) : (
              visible.map((m) => <MatchCard key={m.id} match={m} onOpen={handleOpen} />)
            )}
          </div>

          {config.adsEnabled && <HomeBannerAd className="mt-8" />}
        </div>

        <section className="mt-10 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 md:p-7 shadow-sm" aria-labelledby="below-matches-tv">
          <h2 id="below-matches-tv" className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            How to Watch Football Live on Yalla Live TV
          </h2>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
            Pick a match from the schedule above and tap it — the live stream opens straight away. <strong className="text-primary">Yalla Live TV</strong> pulls together the day’s top fixtures into one clean list, so you don’t need ten tabs open to track who’s playing next. Each card shows the league, your local kickoff time and current status before you click.
          </p>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
            For the smoothest playback use a connection of at least <strong>5 Mbps</strong> (10 Mbps for HD). The layout is fully mobile-optimised, the cards are tap-friendly, and the schedule is updated daily — bookmark the page and check back shortly before kickoff.
          </p>
        </section>
      </main>
    </Layout>
  )
}
