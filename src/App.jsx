import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import WorldCupFormatExplained from './pages/articles/WorldCupFormatExplained.jsx'
import WorldCup2026 from './pages/articles/WorldCup2026.jsx'
import FifaWorldCupHistory from './pages/articles/FifaWorldCupHistory.jsx'
import WorldCupTopScorers from './pages/articles/WorldCupTopScorers.jsx'
import HowToWatchFootballMena from './pages/articles/HowToWatchFootballMena.jsx'

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

        <Route path="/world-cup-format-explained.html" element={<WorldCupFormatExplained />} />
        <Route path="/world-cup-2026.html" element={<WorldCup2026 />} />
        <Route path="/fifa-world-cup-history.html" element={<FifaWorldCupHistory />} />
        <Route path="/world-cup-top-scorers-all-time.html" element={<WorldCupTopScorers />} />
        <Route path="/how-to-watch-football-mena.html" element={<HowToWatchFootballMena />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
