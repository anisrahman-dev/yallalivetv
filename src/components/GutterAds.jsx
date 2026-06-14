import AdUnit from './AdUnit.jsx'
import { getSiteConfig } from '../lib/siteConfig.js'

/**
 * Skyscraper ads in the empty gutters either side of the centered 1000px
 * content column. Positioned absolutely so they scroll with the page (the
 * <body> is position:relative, so they anchor to it). Only shown on screens
 * wide enough to hold a 160px column without overlapping the content
 * (>= 1400px). Hidden on mobile/tablet, where the gutters don't exist.
 */
export default function GutterAds() {
  if (!getSiteConfig().adsEnabled) return null

  const grid = (
    <div className="grid grid-cols-2 gap-4">
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
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
