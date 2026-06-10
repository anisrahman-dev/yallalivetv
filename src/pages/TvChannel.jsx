import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import HlsPlayer from '../components/HlsPlayer.jsx'
import GutterAds from '../components/GutterAds.jsx'
import { loadTvChannels, blankChannel } from '../lib/tvChannels.js'

// One TV page = one HLS player fed by up to 3 admin-configured m3u8 servers.
export default function TvChannel({ number }) {
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

      <GutterAds />

      <main className="pt-[100px] md:pt-[96px] pb-10 md:pb-16 max-w-[1000px] mx-auto min-h-screen px-4">
        <div className="mb-5">
          <h1 className="green-sub-bar shadow-sm block m-0">{title} — Live Stream</h1>
        </div>

        <HlsPlayer servers={channel.servers} title={title} />
      </main>
    </Layout>
  )
}
