import { Link } from 'react-router-dom'

// Shared shell for every .site landing domain. Brand name + accent colors
// come from the per-domain config so all three look distinct from one
// shared template.
export default function LandingLayout({ cfg, children }) {
  const navLink = 'text-sm font-semibold text-slate-300 hover:text-white transition-colors'
  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 font-sora">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 hover:no-underline">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: cfg.accent }}
            />
            <span className="text-lg font-extrabold tracking-tight text-white">{cfg.brand}</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link to="/" className={navLink}>Home</Link>
            <Link to="/contact.html" className={navLink}>Contact</Link>
            <Link to="/privacy.html" className={navLink}>Privacy</Link>
            <Link to="/terms.html" className={navLink}>Terms</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-800 bg-[#0b1325]">
        <div className="max-w-[1000px] mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© {cfg.brand}. All rights reserved.</span>
          <nav className="flex items-center gap-4">
            <Link to="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms.html" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact.html" className="hover:text-white transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
