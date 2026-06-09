import { useEffect } from 'react'
import { getSiteConfig } from '../lib/siteConfig.js'

/**
 * Monetag full-page vignette interstitial (zone 11036330).
 * Injects the loader script once, only when vignette ads are enabled
 * in site config. Renders nothing itself.
 */
export default function VignetteAd() {
  useEffect(() => {
    if (!getSiteConfig().vignetteEnabled) return
    if (document.getElementById('monetag-vignette')) return
    const s = document.createElement('script')
    s.id = 'monetag-vignette'
    s.dataset.zone = '11036330'
    s.src = 'https://n6wxm.com/vignette.min.js'
    ;(document.body || document.documentElement).appendChild(s)
  }, [])

  return null
}
