import AdUnit from './AdUnit.jsx'
import { getSiteConfig } from '../lib/siteConfig.js'

/**
 * Fixed skyscraper ads in the empty gutters either side of the centered
 * 1000px content column. Only shown on screens wide enough to hold a
 * 160px column without overlapping the content (>= 1400px). Hidden on
 * mobile/tablet, where the gutters don't exist.
 */
export default function GutterAds() {
  if (!getSiteConfig().adsEnabled) return null

  const column = (
    <>
      <AdUnit adKey="ec2e4b0a2aa3fcac5cb428225d0ad9a1" width={160} height={600} showLabel={false} />
      <AdUnit adKey="8ced268570265d4115e638aba1f41b14" width={160} height={300} showLabel={false} />
    </>
  )

  return (
    <>
      <div className="hidden min-[1400px]:flex flex-col gap-4 fixed top-[170px] left-[calc(50%-680px)] z-40">
        {column}
      </div>
      <div className="hidden min-[1400px]:flex flex-col gap-4 fixed top-[170px] right-[calc(50%-680px)] z-40">
        {column}
      </div>
    </>
  )
}
