import { useEffect, useRef, useState } from 'react'

const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js'

// Load hls.js once, lazily, and share the same promise across every player.
function loadHlsScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.Hls) return Promise.resolve(window.Hls)
  if (window.__hlsPromise) return window.__hlsPromise
  window.__hlsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = HLS_CDN
    s.async = true
    s.onload = () => resolve(window.Hls)
    s.onerror = () => { window.__hlsPromise = null; reject(new Error('Failed to load player engine')) }
    document.head.appendChild(s)
  })
  return window.__hlsPromise
}

// Self-contained HLS (.m3u8) player with a built-in server switcher.
// `servers` is an array of stream URLs (blank entries are ignored).
export default function HlsPlayer({ servers = [], title = '' }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const available = servers
    .map((url, i) => ({ url: (url || '').trim(), label: `Server ${i + 1}` }))
    .filter((s) => s.url)

  // active = index into `available` (the playable list)
  const [active, setActive] = useState(0)
  const [status, setStatus] = useState('idle') // idle | loading | playing | error
  const current = available[active]

  // Clamp the active index if the playable list shrinks.
  useEffect(() => {
    if (active > available.length - 1) setActive(0)
  }, [available.length, active])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !current) { setStatus('idle'); return }

    let cancelled = false
    setStatus('loading')

    // Tear down any previous hls.js instance before re-attaching.
    const cleanup = () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
    cleanup()

    const nativeHls = video.canPlayType('application/vnd.apple.mpegurl')

    if (nativeHls) {
      // Safari / iOS play HLS natively.
      video.src = current.url
      const onLoaded = () => { if (!cancelled) { setStatus('playing'); video.play().catch(() => {}) } }
      const onError = () => { if (!cancelled) setStatus('error') }
      video.addEventListener('loadedmetadata', onLoaded)
      video.addEventListener('error', onError)
      return () => {
        cancelled = true
        video.removeEventListener('loadedmetadata', onLoaded)
        video.removeEventListener('error', onError)
        video.removeAttribute('src')
        video.load()
      }
    }

    loadHlsScript()
      .then((Hls) => {
        if (cancelled) return
        if (!Hls || !Hls.isSupported()) { setStatus('error'); return }
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
        hlsRef.current = hls
        hls.loadSource(current.url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return
          setStatus('playing')
          video.play().catch(() => {})
        })
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (cancelled || !data.fatal) return
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad()
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError()
          } else {
            setStatus('error')
            cleanup()
          }
        })
      })
      .catch(() => { if (!cancelled) setStatus('error') })

    return () => { cancelled = true; cleanup() }
  }, [current?.url])

  const noServers = available.length === 0

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm">
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay
          muted
          poster=""
          className="absolute inset-0 w-full h-full"
        />

        {noServers && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 bg-black/80">
            <span className="material-symbols-outlined text-4xl text-slate-500">live_tv</span>
            <p className="text-sm font-bold text-slate-300">No stream available yet</p>
            <p className="text-xs text-slate-500">Add a server link from the admin panel to start the broadcast.</p>
          </div>
        )}

        {!noServers && status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 pointer-events-none">
            <span className="material-symbols-outlined text-4xl text-[#ee335f] animate-spin">progress_activity</span>
            <p className="text-xs font-bold text-slate-300">Connecting to {current?.label}…</p>
          </div>
        )}

        {!noServers && status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 bg-black/85">
            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
            <p className="text-sm font-bold text-slate-200">This server isn't responding</p>
            <p className="text-xs text-slate-500">Try another server below.</p>
          </div>
        )}
      </div>

      {!noServers && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base text-[#ee335f]">dns</span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Choose a server{title ? ` — ${title}` : ''}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {available.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                  i === active
                    ? 'bg-[#ee335f] text-white shadow-md scale-[1.02]'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">play_circle</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
