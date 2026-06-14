import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import MatchesBoard from './pages/MatchesBoard.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Blog from './pages/Blog.jsx'
import TvChannel from './pages/TvChannel.jsx'
import WorldCupFormatExplained from './pages/articles/WorldCupFormatExplained.jsx'
import WorldCup2026 from './pages/articles/WorldCup2026.jsx'
import FifaWorldCupHistory from './pages/articles/FifaWorldCupHistory.jsx'
import WorldCupTopScorers from './pages/articles/WorldCupTopScorers.jsx'
import HowToWatchFootballMena from './pages/articles/HowToWatchFootballMena.jsx'
import HowToWatchPremierLeagueFree from './pages/articles/HowToWatchPremierLeagueFree.jsx'
import NetworkAds from './components/NetworkAds.jsx'
import LandingApp from './landing/LandingApp.jsx'
import { getLandingConfig } from './lib/domains.js'

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
  // On the .site landing domains, serve the lightweight landing app instead
  // of the full streaming site. Match data is fetched from the main .com.
  const landingCfg = getLandingConfig()
  if (landingCfg) return <LandingApp cfg={landingCfg} />

  return (
    <>
      <ScrollToTop />
      <CanonicalUpdater />
      <NetworkAds />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/home.html" element={<Navigate to="/" replace />} />

        <Route path="/admin-anis.html" element={<Admin />} />
        <Route path="/matches-board-anis.html" element={<MatchesBoard />} />

        <Route path="/contact.html" element={<Contact />} />
        <Route path="/privacy.html" element={<Privacy />} />
        <Route path="/terms.html" element={<Terms />} />

        <Route path="/blog.html" element={<Blog />} />

        <Route path="/tv.html" element={<Navigate to="/" replace />} />
        <Route path="/tv-1.html" element={<TvChannel number={1} />} />
        <Route path="/tv-2.html" element={<TvChannel number={2} />} />
        <Route path="/tv-3.html" element={<TvChannel number={3} />} />
        <Route path="/tv-4.html" element={<TvChannel number={4} />} />
        <Route path="/tv-5.html" element={<TvChannel number={5} />} />

        {/* Ad-free variants embedded in the mobile app */}
        <Route path="/tv-1-app.html" element={<TvChannel number={1} appMode />} />
        <Route path="/tv-2-app.html" element={<TvChannel number={2} appMode />} />
        <Route path="/tv-3-app.html" element={<TvChannel number={3} appMode />} />
        <Route path="/tv-4-app.html" element={<TvChannel number={4} appMode />} />
        <Route path="/tv-5-app.html" element={<TvChannel number={5} appMode />} />

        <Route path="/world-cup-format-explained.html" element={<WorldCupFormatExplained />} />
        <Route path="/world-cup-2026.html" element={<WorldCup2026 />} />
        <Route path="/fifa-world-cup-history.html" element={<FifaWorldCupHistory />} />
        <Route path="/world-cup-top-scorers-all-time.html" element={<WorldCupTopScorers />} />
        <Route path="/how-to-watch-football-mena.html" element={<HowToWatchFootballMena />} />
        <Route path="/how-to-watch-premier-league-free.html" element={<HowToWatchPremierLeagueFree />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
