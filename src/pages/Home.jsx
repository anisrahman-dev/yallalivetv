import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import MatchCard from '../components/MatchCard.jsx'
import RedirectModal from '../components/RedirectModal.jsx'
import IframeAd from '../components/IframeAd.jsx'
import GutterAds from '../components/GutterAds.jsx'
import { loadMatches } from '../lib/matches.js'
import { getSiteConfig } from '../lib/siteConfig.js'
import { ARTICLES } from '../lib/articles.js'

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

// Banner ad block — 728x90 on desktop, 320x50 on mobile. Reused top and mid-page.
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
    description: `Watch today's high-speed live stream of ${m.homeTeam.name} vs ${m.awayTeam.name} on mobile. Real-time Yalla Shoot links and scores.`,
    url: `${origin}/#match-${m.id}`
  }))
  if (navElements.length === 0) {
    navElements.push({
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'Live Football Schedule Today',
      description: "Watch free live streaming of today's most important matches on Yalla Live.",
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
        name: 'Yalla Live',
        publisher: { '@type': 'Organization', name: 'Yalla Live', logo: { '@type': 'ImageObject', url: `${origin}/logos/logo-unified.png` } }
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

export default function Home() {
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('important')
  const [openServers, setOpenServers] = useState(null)
  const [today, setToday] = useState('')

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

  const visible = useMemo(() => {
    if (tab === 'important') return matches.filter((m) => m.day === 'today' && m.isImportant)
    return matches.filter((m) => m.day === tab)
  }, [tab, matches])

  const emptyMessage = useMemo(() => {
    if (tab === 'tomorrow') return 'There is no match tomorrow.'
    if (tab === 'yesterday') return 'There is no match yesterday.'
    return 'There is no match today.'
  }, [tab])

  const handleOpen = (matchId, servers) => {
    const cfg = getSiteConfig()
    if (!cfg.countdownEnabled) {
      window.open(servers[0], '_blank')
      return
    }
    setOpenServers(servers)
  }

  const config = getSiteConfig()
  const countdownSeconds = Math.max(0, Number(config.countdownSeconds) || 10)

  return (
    <Layout withWcBar>
      <PageMeta
        title="Yalla Live | Watch Live Football Streaming"
        description="Watch live soccer/football match online. It covers EPL, la liga, ucl and more."
        keywords="Yalla Live, yalla shoot, Yalla Shoot live stream of today's matches, yalla live football, koora live, yalla shoot tv, yalla koora, live football, match schedule, live scores, yalla tv"
        ogTitle="Yalla Live | Watch Live Football Streaming"
        ogDescription="Watch live soccer/football match online. It covers EPL, la liga, ucl and more."
      />

      <GutterAds />

      <main className="pt-[176px] md:pt-[156px] pb-6 md:pb-16 max-w-[1000px] mx-auto min-h-screen px-4">
        <div className="mb-6">
          <h1 className="green-sub-bar shadow-sm block m-0">Yalla Live - Live Soccer TV HD Streaming</h1>
        </div>

        {config.adsEnabled && <HomeBannerAd className="mb-6" />}

        <section className="mb-8 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 md:p-7 shadow-sm" aria-labelledby="about-yalla-live">
          <h2 id="about-yalla-live" className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            Watch Live Football Streams Online — Free, HD, Mobile-Ready
          </h2>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
            <strong className="text-[#ee335f]">Yalla Live</strong> is a free live football streaming hub that brings today's most important matches into one fast, mobile-friendly page. Whether you follow the <strong>English Premier League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>, <strong>Bundesliga</strong>, or <strong>Ligue 1</strong>, you can find every fixture's kickoff time, live score, and a working stream link from a single dashboard. We aggregate verified servers so you can switch instantly if one slows down — no signup, no paywall, no clutter.
          </p>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
            Beyond the top European domestic leagues, Yalla Live also covers the <strong>UEFA Champions League</strong>, <strong>UEFA Europa League</strong>, <strong>FIFA World Cup 2026 qualifiers</strong>, <strong>Africa Cup of Nations</strong>, <strong>Copa America</strong>, the <strong>AFC Asian Cup</strong>, and major club friendlies — anything worth watching, indexed alongside the day's headline matches. Stream quality is optimized for phones and tablets in HD where available, and every match card surfaces the league, status, and local kickoff time before you even click.
          </p>
          <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
            The site is updated daily by our team so you always see today's, yesterday's, and tomorrow's fixtures up top. If you're tired of broken links and pop-up-heavy mirror sites, bookmark Yalla Live and check back before kickoff — it's built for fans who just want to watch the game.
          </p>
        </section>

        <a
          href="/yalla_live.apk"
          download
          className="group mb-8 flex items-center justify-center gap-3 rounded-2xl bg-[#22c55e] px-5 py-4 shadow-sm transition-all hover:bg-[#16a34a] hover:shadow-md"
          aria-label="Download our Android app"
        >
          <span className="material-symbols-outlined text-white text-3xl flex-shrink-0">android</span>
          <span className="text-base md:text-lg font-extrabold text-white tracking-tight">
            Download our App
          </span>
          <span className="material-symbols-outlined text-white text-xl transition-transform group-hover:translate-y-1">download</span>
        </a>

        <div className="main-wrapper">
          <div className="flex justify-center items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTab('important')}
              id="pill-important"
              className="league-pill tab-important text-xs font-bold uppercase px-4 md:px-6 py-2.5 rounded shadow-sm transition-all justify-center whitespace-normal md:whitespace-nowrap flex flex-col md:flex-row items-center gap-1 text-center"
              style={tab === 'important' ? { transform: 'scale(1.05)', opacity: 1, border: '2px solid #ffffff' } : { transform: 'scale(1)', opacity: 0.75, border: 'none' }}
            >
              <span>Today's most important matches</span>
              <span className="text-[#fac912]">{today}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4" id="matches-container">
            {visible.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400 font-medium">{emptyMessage}</div>
            ) : (
              visible.map((m) => <MatchCard key={m.id} match={m} onOpen={handleOpen} />)
            )}
          </div>

          {config.adsEnabled && <HomeBannerAd className="mt-8" />}

          <section className="mt-8 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 md:p-7 shadow-sm" aria-labelledby="below-matches-intro">
            <h2 id="below-matches-intro" className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              Today's Best Football Streams in One Place
            </h2>
            <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
              Every fixture on the list above goes live with a tested stream ready to open in one tap. <strong className="text-[#ee335f]">Yalla Live</strong> pulls together <strong>Premier League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>, <strong>Bundesliga</strong>, and <strong>Ligue 1</strong> action into a single schedule, so you don't need ten tabs open to track who's playing next. Each card tells you the league, kickoff time in your local timezone, and current status before you click — no guessing, no waiting on a slow mirror page.
            </p>
            <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
              We also cover <strong>UEFA Champions League</strong> and <strong>Europa League</strong> nights, <strong>FIFA World Cup 2026 qualifiers</strong>, <strong>Africa Cup of Nations</strong>, <strong>Copa America</strong>, the <strong>AFC Asian Cup</strong>, and the big international friendlies. Where multiple servers are available you can switch streams from inside the player popup, which keeps the action rolling even if a mirror slows down. Streams are mobile-optimised in HD wherever the broadcaster supports it.
            </p>
            <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
              The schedule refreshes daily — bookmark this page and check back shortly before kickoff. Yalla Live stays free, signup-free, and ad-light because we build it for fans, not for clicks.
            </p>
          </section>
        </div>

        <section className="mt-10" aria-labelledby="football-guides">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 id="football-guides" className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Football Guides &amp; World Cup Blog
            </h2>
            <Link to="/blog.html" className="text-xs font-bold uppercase tracking-wider text-[#ee335f] hover:underline flex-shrink-0 inline-flex items-center gap-1">
              View all
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARTICLES.map((a) => (
              <Link
                key={a.slug}
                to={a.slug}
                className="group flex flex-col bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-[#ee335f] dark:hover:border-[#ee335f] hover:shadow-md transition-all"
              >
                <span className="inline-block self-start text-[10px] font-extrabold uppercase tracking-wider text-[#ee335f] bg-[#ee335f]/10 rounded-full px-2.5 py-1 mb-3">
                  {a.category}
                </span>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug tracking-tight group-hover:text-[#ee335f] transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {a.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <section className="py-14 md:py-20 px-4 md:px-16 bg-[#f8fafc] dark:bg-[#0f172a] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-8 md:mb-10 tracking-tight">
            Yalla Live – Your Ultimate Football Streaming Hub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            <div className="space-y-5">
              {todayImportant.length > 0 && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-l-4 border-[#ee335f] rounded-r-xl my-4">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-[#ee335f] block mb-1">Featured Matches Today</span>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed m-0">
                    Tune in to watch high-profile clashes today, including{' '}
                    <strong>{todayImportant.map((m) => `${m.homeTeam.name} vs ${m.awayTeam.name}`).join(', ')}</strong>. Access every live connection directly through our match listing above.
                  </p>
                </div>
              )}
              <p>
                Welcome to <strong className="text-primary font-bold">Yalla Live</strong>, your premium home for football streaming. Whether you're searching for <strong>Yalla Shoot</strong> links, the latest <strong>Koora Live</strong> scores, or <strong>Yalla TV</strong> broadcasts, we aggregate every match in one lightning-fast interface.
              </p>
              <p>
                Our platform is engineered for mobile-first access — so you can watch <strong>Live Soccer TV HD Streaming</strong> without buffering or clutter. Enjoy <strong>Yalla Live football</strong> from the Premier League, Champions League, La Liga, and beyond.
              </p>
              <p>
                Get <strong>Yalla Shoot live stream of today's matches</strong> updated second by second. Every goal, card, and substitution reaches you before the crowd finishes cheering.
              </p>
            </div>
            <div className="space-y-5">
              <p>
                <strong>Yalla Koora</strong> fans will find our schedule view perfect for planning viewing sessions. We list broadcaster details — from beIN Sports to Sky Sports — alongside every fixture so you know exactly where to tune in.
              </p>
              <p>
                <strong>Yalla Shoot TV</strong> integrations ensure that international audiences, especially across the MENA region, have uninterrupted access to top-tier football. Combined with <strong>Koora Live</strong> data feeds, our scores are always accurate.
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6">Frequently Asked Questions</h3>
            <FaqItem q="What is Yalla Live?">
              Yalla Live is a popular live football streaming platform widely used across the Arab world and beyond. It provides free live streams of today's matches, real-time scores, and fixture schedules for leagues including the Premier League, Champions League, La Liga, Serie A, and more.
            </FaqItem>
            <FaqItem q="How do I watch Yalla Shoot live stream on mobile?">
              To watch <strong>Yalla Shoot live stream of today's matches on mobile</strong>, simply open Yalla Live in your mobile browser, find the live match card, and tap "Watch on Yalla Live." Our mobile-optimised layout ensures smooth streaming without the need to install any app.
            </FaqItem>
            <FaqItem q="What is the difference between Yalla Koora and Koora Live?">
              <strong>Yalla Koora</strong> (يلا كورة) and <strong>Koora Live</strong> (كورة لايف) are two of the most-searched Arabic football streaming terms. Both refer to platforms and aggregators that provide live football coverage. Our platform integrates data from both sources to give you comprehensive, real-time match information.
            </FaqItem>
            <FaqItem q="Is Yalla TV the same as Yalla Shoot TV?">
              <strong>Yalla TV</strong> and <strong>Yalla Shoot TV</strong> are related but distinct services. Yalla TV is a broader sports coverage channel, while Yalla Shoot TV specifically focuses on live football match streams and scores. Both are accessible through our unified interface.
            </FaqItem>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 md:px-16 bg-white dark:bg-[#0b1325] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100 mb-3 tracking-tight">Watch Football Live Online — Every League, Every Device</h2>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-6">
            Yalla Live is built for football fans who want a clean, fast way to find <strong>free live soccer streams</strong> without bouncing between mirror sites. Every fixture on this page links to a working stream you can open straight from your phone, tablet, laptop, or smart TV browser — no app installs, no accounts, no premium paywalls. Whether you're chasing a Saturday-morning derby, a midweek Champions League tie, or a late-night CONMEBOL qualifier, the schedule above is updated daily so you always know what's on, when it kicks off in your local time, and where to watch.
          </p>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-slate-100 mt-8 mb-3">Top leagues and tournaments we cover</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm md:text-base text-gray-600 dark:text-slate-400 leading-relaxed mb-6">
            <li><strong className="text-gray-800 dark:text-slate-200">Premier League</strong> — every Saturday and Sunday matchday, plus midweek fixtures and FA Cup rounds.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">La Liga</strong> — Real Madrid, Barcelona, Atlético, the Madrid and Catalan derbies, and full Copa del Rey coverage.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">Serie A</strong> — Inter, Milan, Juventus, Napoli, and Roma headline matches plus Coppa Italia knockouts.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">Bundesliga</strong> — Bayern Munich, Dortmund, Leverkusen, and Der Klassiker streamed live in HD.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">Ligue 1</strong> — PSG, Marseille, Monaco, Lyon — the full French top flight, week by week.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">UEFA Champions League</strong> — group stage through to the final, every Tuesday and Wednesday.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">UEFA Europa League</strong> — Thursday-night fixtures alongside the UEFA Conference League.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">FIFA World Cup 2026</strong> — qualifiers across all six confederations plus the main tournament in the USA, Canada, and Mexico.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">Africa Cup of Nations</strong> — full coverage of every group-stage and knockout match across host nations.</li>
            <li><strong className="text-gray-800 dark:text-slate-200">Copa America &amp; AFC Asian Cup</strong> — South American and Asian international finals indexed alongside the European calendar.</li>
          </ul>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-slate-100 mt-8 mb-3">Tips for the best live streaming experience</h3>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-3">
            For the smoothest playback, use a connection of at least <strong>5 Mbps</strong> (10 Mbps for HD). If a stream feels slow, switch to another server from the picker — every match links to multiple mirrors so you can hop instantly without losing the action. Streams are tested before kickoff and rotated as needed, which is why you'll rarely see dead links here compared to typical aggregator sites.
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-3">
            Yalla Live is fully optimised for mobile — the layout adapts to your screen, the cards are tap-friendly, and the modal countdown is designed not to interrupt your viewing. If your browser blocks the stream window, a manual "Watch Live Stream" button appears so you can open it directly. Want notifications when your team plays? Bookmark the schedule and check back about 15 minutes before kickoff for the latest server links.
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            Have a match you'd like us to cover? Reach out via the{' '}
            <Link to="/contact.html" className="text-[#ee335f] font-semibold hover:underline">contact page</Link>{' '}
            and we'll add it to the schedule. Yalla Live is built for fans, by fans — clean, fast, free, and always honest about what works.
          </p>
        </div>
      </section>

      <RedirectModal
        open={!!openServers}
        servers={openServers || []}
        countdownSeconds={countdownSeconds}
        onClose={() => setOpenServers(null)}
      />
    </Layout>
  )
}

function FaqItem({ q, children }) {
  return (
    <details className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1e293b] overflow-hidden group">
      <summary className="flex justify-between items-center px-5 py-4 cursor-pointer font-bold text-sm text-gray-800 dark:text-slate-200 list-none select-none">
        {q}
        <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180" style={{ fontSize: '20px' }}>expand_more</span>
      </summary>
      <p className="px-5 pb-4 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{children}</p>
    </details>
  )
}

