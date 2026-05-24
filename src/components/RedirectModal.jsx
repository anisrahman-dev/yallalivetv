import { useEffect, useRef, useState } from 'react'

export default function RedirectModal({ open, servers, countdownSeconds, onClose }) {
  const [count, setCount] = useState(countdownSeconds)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [manualUrl, setManualUrl] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [title, setTitle] = useState('Preparing your Live Football Stream...')
  const [desc, setDesc] = useState('Please wait while we establish a secure high-speed connection.')
  const scalerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setCount(countdownSeconds)
    setSelectedIdx(0)
    setShowManual(false)
    setManualUrl('')
    setTitle('Preparing your Live Football Stream...')
    setDesc('Please wait while we establish a secure high-speed connection.')
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open, countdownSeconds])

  useEffect(() => {
    if (!open || showManual) return
    if (count <= 0) {
      const targetUrl = servers[selectedIdx] || servers[0]
      const newWindow = window.open(targetUrl, '_blank')
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setShowManual(true)
        setManualUrl(targetUrl)
        setTitle('Your Stream is Ready!')
        setDesc('Your secure high-speed connection is ready. Click below to open the stream.')
      } else {
        onClose()
      }
      return
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [open, count, servers, selectedIdx, showManual, onClose])

  useEffect(() => {
    const scaleAd = () => {
      const scaler = scalerRef.current
      if (!scaler) return
      const parentWidth = scaler.parentElement.clientWidth
      if (parentWidth < 728) {
        const scale = parentWidth / 728
        scaler.style.transform = `scale(${scale})`
      } else {
        scaler.style.transform = 'scale(1)'
      }
    }
    scaleAd()
    window.addEventListener('resize', scaleAd)
    return () => window.removeEventListener('resize', scaleAd)
  }, [open])

  // Inject the ad script when the modal opens (mirrors ad.js include in HTML)
  useEffect(() => {
    if (!open) return
    const container = document.getElementById('ad-container')
    if (!container) return
    container.innerHTML = ''
    const s = document.createElement('script')
    s.src = '/ad.js'
    s.async = true
    container.appendChild(s)
  }, [open])

  const modalStyle = open
    ? { left: 0, top: 0, width: '100%', height: '100%', overflow: 'auto', pointerEvents: 'auto', opacity: 1, position: 'fixed', zIndex: 100 }
    : { left: '-9999px', top: '-9999px', width: '728px', height: '90px', overflow: 'hidden', pointerEvents: 'none', opacity: 1, position: 'fixed', zIndex: 100 }

  return (
    <div
      id="redirect-modal"
      className="flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
      style={modalStyle}
    >
      <div
        id="redirect-card"
        className={`relative w-full max-w-[800px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center gap-6 overflow-hidden transform bouncy-pop ${open ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#ee335f]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#fac912]/10 blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-3 z-10">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">{desc}</p>
        </div>

        {servers.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 z-10">
            {servers.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${i === selectedIdx ? 'bg-[#ee335f] text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
              >
                Server {i + 1}
              </button>
            ))}
          </div>
        )}

        {!showManual && (
          <div className="relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full border-4 border-gray-200 dark:border-slate-800 z-10 shadow-inner">
            <div className="absolute inset-0 rounded-full border-4 border-t-[#ee335f] border-r-[#fac912] animate-spin"></div>
            <span className="text-sm md:text-lg font-black text-[#ee335f] dark:text-[#fac912] transition-all duration-300 transform scale-110">{count}</span>
          </div>
        )}

        {showManual && (
          <div className="z-10 w-full max-w-[280px]">
            <a
              href={manualUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-[#ee335f] hover:bg-[#d1224d] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 select-none animate-pulse"
            >
              <span className="material-symbols-outlined">play_circle</span>
              Watch Live Stream
            </a>
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-2 z-10 mt-2">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">Advertisement</span>
          <div className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center bg-gray-50 dark:bg-slate-950/40 border border-gray-200/50 dark:border-slate-800/30 rounded-xl overflow-hidden shadow-inner p-1">
            <div
              ref={scalerRef}
              id="ad-scaler"
              className="origin-center transition-transform duration-300"
              style={{ width: '728px', minWidth: '728px', height: '90px', minHeight: '90px' }}
            >
              <div id="ad-container" className="w-full h-full flex justify-center items-center"></div>
            </div>
          </div>
        </div>

        <div className="text-center z-10">
          <p className="text-[10px] text-gray-400 dark:text-slate-500">Stream will open automatically. Do not close this page.</p>
        </div>
      </div>
    </div>
  )
}
