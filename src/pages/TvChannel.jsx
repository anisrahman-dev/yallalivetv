import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import HlsPlayer from '../components/HlsPlayer.jsx'
import AdUnit from '../components/AdUnit.jsx'
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

      <main className="pt-[100px] md:pt-[96px] pb-10 md:pb-16 max-w-[1000px] mx-auto min-h-screen px-4">
        <div className="mb-5">
          <h1 className="green-sub-bar shadow-sm block m-0">{title} — Live Stream</h1>
        </div>

        <HlsPlayer servers={channel.servers} title={title} />

        <div className="mt-6 flex justify-center">
          <AdUnit adKey="318cbafdeb9f624f0bf9a42881b6c70a" width={468} height={60} className="hidden sm:flex" />
          <AdUnit adKey="b9358877b73e23101415bc0260a77523" width={300} height={250} className="flex sm:hidden" />
        </div>
      </main>
    </Layout>
  )
}
