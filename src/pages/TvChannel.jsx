import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import HlsPlayer from '../components/HlsPlayer.jsx'
import GutterAds from '../components/GutterAds.jsx'
import IframeAd from '../components/IframeAd.jsx'
import { loadTvChannels, blankChannel } from '../lib/tvChannels.js'
import { getSiteConfig } from '../lib/siteConfig.js'

// 728x90 leaderboard (Adsterra) — desktop
const AD_LEADERBOARD = `
<script type="text/javascript">
  atOptions = { 'key':'26eba25e14e03d0c9c83a51f38af81c2','format':'iframe','height':90,'width':728,'params':{} };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/26eba25e14e03d0c9c83a51f38af81c2/invoke.js"></script>`

// 320x50 banner (Adsterra) — mobile
const AD_MOBILE_BANNER = `
<script type="text/javascript">
  atOptions = { 'key':'1ff571e3b1f77fc6868d3228d5540a76','format':'iframe','height':50,'width':320,'params':{} };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/1ff571e3b1f77fc6868d3228d5540a76/invoke.js"></script>`

// Native banner (effectiveCPMnetwork) — all screens
const AD_NATIVE = `
<script async="async" data-cfasync="false" src="https://pl29500312.effectivecpmnetwork.com/53ad722048fcb45c6570dc61ee07464f/invoke.js"></script>
<div id="container-53ad722048fcb45c6570dc61ee07464f"></div>`

// One TV page = one HLS player fed by up to 3 admin-configured m3u8 servers.
// appMode = the mobile-app variant (/tv-N-app.html): always ad-free.
export default function TvChannel({ number, appMode = false }) {
  const [channel, setChannel] = useState(() => blankChannel(number))

  useEffect(() => {
    let cancelled = false
    loadTvChannels()
      .then((list) => {
        if (cancelled) return
        const found = list.find((c) => Number(c.id) === Number(number))
        if (found) setChannel(found)
      })
      .catch(() => { /* keep blank fallback */ })
    return () => { cancelled = true }
  }, [number])

  const title = channel.title || `TV ${number}`
  const cfg = getSiteConfig()
  // App pages (/tv-N-app.html) are always ad-free; web pages keep their ads.
  const adFree = appMode
  const showBannerAds = cfg.tvBannerAdsEnabled && !adFree
  const showNativeAd = cfg.tvNativeAdEnabled && !adFree

  return (
    <Layout>
      <PageMeta
        title={`${title} — Live TV | Yalla Live`}
        description={`Watch ${title} live stream in HD on Yalla Live. Switch between multiple servers for the smoothest football broadcast.`}
        keywords={`${title}, yalla live tv, live football tv, m3u8 stream, yalla shoot tv, live soccer tv`}
        ogTitle={`${title} — Live TV | Yalla Live`}
        ogDescription={`Watch ${title} live stream in HD on Yalla Live.`}
        robots="noindex, nofollow"
      />

      {!adFree && <GutterAds />}

      <main className="pt-[100px] md:pt-[96px] pb-10 md:pb-16 max-w-[1000px] mx-auto min-h-screen px-4">
        <div className="mb-5">
          <h1 className="green-sub-bar shadow-sm block m-0">{title} — Live Stream</h1>
        </div>

        {showBannerAds && (
          <>
            {/* Top banner — 728x90 leaderboard (desktop) */}
            <div className="hidden sm:flex justify-center mb-5">
              <IframeAd html={AD_LEADERBOARD} width={728} height={90} />
            </div>
            {/* Top banner — 320x50 (mobile) */}
            <div className="flex sm:hidden justify-center mb-5">
              <IframeAd html={AD_MOBILE_BANNER} width={320} height={50} />
            </div>
          </>
        )}

        <HlsPlayer servers={channel.servers} title={title} />

        {showBannerAds && (
          <>
            {/* 728x90 leaderboard — desktop only (too wide for phones) */}
            <div className="hidden sm:flex justify-center mt-6">
              <IframeAd html={AD_LEADERBOARD} width={728} height={90} />
            </div>
            {/* 320x50 banner — mobile only */}
            <div className="flex sm:hidden justify-center mt-6">
              <IframeAd html={AD_MOBILE_BANNER} width={320} height={50} />
            </div>
          </>
        )}

        {/* Native banner — all screens */}
        {showNativeAd && (
          <div className="flex justify-center mt-6">
            <IframeAd html={AD_NATIVE} width={728} height={300} responsive />
          </div>
        )}
      </main>
    </Layout>
  )
}
