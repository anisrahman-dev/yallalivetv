import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import WorldCup2026 from './pages/articles/WorldCup2026.jsx'
import ChampionsLeagueFinal2026 from './pages/articles/ChampionsLeagueFinal2026.jsx'
import HowToWatchPremierLeagueFree from './pages/articles/HowToWatchPremierLeagueFree.jsx'
import HowToWatchChampionsLeagueFree from './pages/articles/HowToWatchChampionsLeagueFree.jsx'
import HowToWatchFootballMobile from './pages/articles/HowToWatchFootballMobile.jsx'
import HowToWatchFootballMena from './pages/articles/HowToWatchFootballMena.jsx'
import BestFreeFootballStreamingSites from './pages/articles/BestFreeFootballStreamingSites.jsx'
import WatchLiveFootball from './pages/articles/WatchLiveFootball.jsx'
import FifaWorldCupHistory from './pages/articles/FifaWorldCupHistory.jsx'
import WorldCupFormatExplained from './pages/articles/WorldCupFormatExplained.jsx'
import WorldCupTopScorers from './pages/articles/WorldCupTopScorers.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function CanonicalUpdater() {
  const { pathname } = useLocation()
  useEffect(() => {
    const link = document.getElementById('canonical-link')
    if (link) link.setAttribute('href', window.location.origin + pathname)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <CanonicalUpdater />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/home.html" element={<Navigate to="/" replace />} />

        <Route path="/admin-anis.html" element={<Admin />} />

        <Route path="/contact.html" element={<Contact />} />
        <Route path="/privacy.html" element={<Privacy />} />
        <Route path="/terms.html" element={<Terms />} />

        <Route path="/world-cup-2026.html" element={<WorldCup2026 />} />
        <Route path="/champions-league-final-2026.html" element={<ChampionsLeagueFinal2026 />} />
        <Route path="/how-to-watch-premier-league-free.html" element={<HowToWatchPremierLeagueFree />} />
        <Route path="/how-to-watch-champions-league-free.html" element={<HowToWatchChampionsLeagueFree />} />
        <Route path="/how-to-watch-football-mobile.html" element={<HowToWatchFootballMobile />} />
        <Route path="/how-to-watch-football-mena.html" element={<HowToWatchFootballMena />} />
        <Route path="/best-free-football-streaming-sites.html" element={<BestFreeFootballStreamingSites />} />
        <Route path="/watch-live-football.html" element={<WatchLiveFootball />} />
        <Route path="/fifa-world-cup-history.html" element={<FifaWorldCupHistory />} />
        <Route path="/world-cup-format-explained.html" element={<WorldCupFormatExplained />} />
        <Route path="/world-cup-top-scorers-all-time.html" element={<WorldCupTopScorers />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
