import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import LandingHome from './LandingHome.jsx'
import { LandingPrivacy, LandingTerms, LandingContact } from './LandingLegal.jsx'

function ScrollAndCanonical() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const link = document.getElementById('canonical-link')
    if (link) link.setAttribute('href', window.location.origin + pathname)
  }, [pathname])
  return null
}

// Lightweight app served on the .site landing domains: a single hero/match
// page plus the legal pages. No admin, TV, or article routes.
export default function LandingApp({ cfg }) {
  return (
    <>
      <ScrollAndCanonical />
      <Routes>
        <Route path="/" element={<LandingHome cfg={cfg} />} />
        <Route path="/index.html" element={<LandingHome cfg={cfg} />} />
        <Route path="/privacy.html" element={<LandingPrivacy cfg={cfg} />} />
        <Route path="/terms.html" element={<LandingTerms cfg={cfg} />} />
        <Route path="/contact.html" element={<LandingContact cfg={cfg} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
