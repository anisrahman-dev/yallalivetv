import { useEffect } from 'react'
import { getSiteConfig } from '../lib/siteConfig.js'

/**
 * Site-wide background ad network tags (effectiveCPMnetwork + nap5k).
 * Previously hardcoded in index.html; now injected once on app load only
 * when `networkTagsEnabled` is on in site config, so they're controllable
 * from the admin panel. Renders nothing.
 */
export default function NetworkAds() {
  useEffect(() => {
    // Never inject network ad tags on internal/ad-free pages.
    const p = window.location.pathname
    if (p.startsWith('/admin-anis') || p.startsWith('/matches-board-anis')) return
    if (!getSiteConfig().networkTagsEnabled) return

    if (!document.getElementById('net-ad-effectivecpm')) {
      const s1 = document.createElement('script')
      s1.id = 'net-ad-effectivecpm'
      s1.src = 'https://pl29500313.effectivecpmnetwork.com/f4/2b/bc/f42bbc1d4d7b16e9e24cbe63e40f6a95.js'
      document.body.appendChild(s1)
    }

    if (!document.getElementById('net-ad-nap5k')) {
      const s2 = document.createElement('script')
      s2.id = 'net-ad-nap5k'
      s2.dataset.zone = '11129537'
      s2.src = 'https://nap5k.com/tag.min.js'
      document.body.appendChild(s2)
    }
  }, [])

  return null
}
