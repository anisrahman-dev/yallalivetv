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

  const column = (
    <>
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
    </>
  )

  return (
    <>
      <div className="hidden min-[1400px]:flex flex-col gap-4 absolute top-[170px] left-[calc(50%_-_680px)] z-40">
        {column}
      </div>
      <div className="hidden min-[1400px]:flex flex-col gap-4 absolute top-[170px] right-[calc(50%_-_680px)] z-40">
        {column}
      </div>
    </>
  )
}
