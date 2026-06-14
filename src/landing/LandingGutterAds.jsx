import IframeAd from '../components/IframeAd.jsx'

// 160x600 skyscraper snippet for a given Adsterra key.
function skyscraperHtml(adKey) {
  return (
    `<script type="text/javascript">atOptions={'key':'${adKey}','format':'iframe','height':600,'width':160,'params':{}};</script>` +
    `<script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>`
  )
}

/**
 * Skyscraper ads in the gutters either side of the centered 1000px content
 * column — mirrors the main site's GutterAds (2x2 grid per side). Only renders
 * on screens wide enough to hold a 160px column (>= 1740px) and only when the
 * domain config supplies an ad key (currently yallalivetv.site only).
 */
export default function LandingGutterAds({ adKey }) {
  if (!adKey) return null

  const grid = (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <IframeAd key={i} html={skyscraperHtml(adKey)} width={160} height={600} />
      ))}
    </div>
  )

  return (
    <>
      <div className="hidden min-[1740px]:block absolute top-[170px] left-[calc(50%_-_840px)] z-40">
        {grid}
      </div>
      <div className="hidden min-[1740px]:block absolute top-[170px] right-[calc(50%_-_840px)] z-40">
        {grid}
      </div>
    </>
  )
}
