import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import MatchCard from '../components/MatchCard.jsx'
import RedirectModal from '../components/RedirectModal.jsx'
import { loadMatches } from '../lib/matches.js'
import { getSiteConfig } from '../lib/siteConfig.js'
import { enableAdFree } from '../lib/adFree.js'
import { TV_CHANNEL_COUNT } from '../lib/tvChannels.js'

// Internal-only board: shows just "Today's most important matches".
// Not linked anywhere, not indexed, and intentionally ad-free.
export default function MatchesBoard() {
  const [matches, setMatches] = useState([])
  const [openServers, setOpenServers] = useState(null)
  const [today, setToday] = useState('')

  // Visiting the internal board turns on ad-free mode for the rest of the tab,
  // so TV pages opened from here show no ads.
  useEffect(() => { enableAdFree() }, [])

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
    <Layout>
      <PageMeta
        title="Matches Board"
        description="Internal matches board."
        robots="noindex, nofollow"
      />

      <main className="pt-[100px] md:pt-[96px] pb-6 md:pb-16 max-w-[1000px] mx-auto min-h-screen px-4">
        {/* Ad-free TV channel links (?board=1 keeps the next page ad-free too) */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {Array.from({ length: TV_CHANNEL_COUNT }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              to={`/tv-${n}.html?board=1`}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-[#ee335f] hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-base">live_tv</span>
              TV {n}
            </Link>
          ))}
        </div>

        <div className="main-wrapper">
          <div className="flex justify-center items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div
              className="league-pill tab-important text-xs font-bold uppercase px-4 md:px-6 py-2.5 rounded shadow-sm justify-center whitespace-normal md:whitespace-nowrap flex flex-col md:flex-row items-center gap-1 text-center"
              style={{ border: '2px solid #ffffff' }}
            >
              <span>Today's most important matches</span>
              <span className="text-[#fac912]">{today}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4" id="matches-container">
            {todayImportant.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400 font-medium">There is no match today.</div>
            ) : (
              todayImportant.map((m) => <MatchCard key={m.id} match={m} onOpen={handleOpen} />)
            )}
          </div>
        </div>
      </main>

      <RedirectModal
        open={!!openServers}
        servers={openServers || []}
        countdownSeconds={countdownSeconds}
        onClose={() => setOpenServers(null)}
      />
    </Layout>
  )
}
