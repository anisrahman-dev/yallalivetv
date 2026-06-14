import LandingLayout from './LandingLayout.jsx'
import PageMeta from '../components/PageMeta.jsx'

function Shell({ cfg, title, children }) {
  return (
    <LandingLayout cfg={cfg}>
      <PageMeta title={`${title} | ${cfg.brand}`} description={`${title} for ${cfg.brand}.`} />
      <article className="max-w-[800px] mx-auto px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-tight">{title}</h1>
        <div className="space-y-4 text-sm md:text-base text-slate-300 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:font-semibold" style={{ '--tw-prose': cfg.accent }}>
          {children}
        </div>
      </article>
    </LandingLayout>
  )
}

export function LandingPrivacy({ cfg }) {
  return (
    <Shell cfg={cfg} title="Privacy Policy">
      <p>This Privacy Policy explains how {cfg.brand} ("we", "us") handles information when you use this website.</p>
      <h2>Information We Collect</h2>
      <p>We do not require you to create an account or submit personal details to browse {cfg.brand}. We may collect non-identifying analytics data such as pages visited, browser type, and approximate region to understand traffic and improve the site.</p>
      <h2>Cookies & Advertising</h2>
      <p>Third-party advertising and analytics partners may set cookies to serve relevant ads and measure performance. You can disable cookies in your browser settings at any time.</p>
      <h2>Third-Party Links & Streams</h2>
      <p>{cfg.brand} aggregates and links to live match information and streams hosted by third parties. We do not host, upload, or control that content and are not responsible for the privacy practices of external sites you open from here.</p>
      <h2>Children’s Privacy</h2>
      <p>This site is not directed at children under 13 and we do not knowingly collect data from them.</p>
      <h2>Contact</h2>
      <p>Questions about this policy? Email us at <a href={`mailto:${cfg.email}`} style={{ color: cfg.accent }}>{cfg.email}</a>.</p>
    </Shell>
  )
}

export function LandingTerms({ cfg }) {
  return (
    <Shell cfg={cfg} title="Terms & Conditions">
      <p>By accessing {cfg.brand}, you agree to these Terms & Conditions. If you do not agree, please discontinue use of the site.</p>
      <h2>Use of the Site</h2>
      <p>{cfg.brand} provides football fixtures, scores, and links to third-party live streams for personal, non-commercial use. You agree not to misuse the site or attempt to disrupt its operation.</p>
      <h2>Third-Party Content</h2>
      <p>We do not host or store any video streams. All streams and media are provided by external third parties over which we have no control. Any copyright or content concerns should be directed to the actual host of the content.</p>
      <h2>No Warranty</h2>
      <p>The site is provided "as is" without warranties of any kind. Stream availability, accuracy of schedules, and uptime are not guaranteed.</p>
      <h2>Limitation of Liability</h2>
      <p>{cfg.brand} is not liable for any damages arising from the use of, or inability to use, this website or any linked third-party content.</p>
      <h2>Changes</h2>
      <p>We may update these Terms at any time. Continued use of the site constitutes acceptance of the updated Terms.</p>
    </Shell>
  )
}

export function LandingContact({ cfg }) {
  return (
    <Shell cfg={cfg} title="Contact Us">
      <p>We’d love to hear from you. Whether you want a match added to the schedule, have feedback, or need to report a broken link, reach out and we’ll get back to you.</p>
      <h2>Email</h2>
      <p><a href={`mailto:${cfg.email}`} style={{ color: cfg.accent }}>{cfg.email}</a></p>
      <h2>Copyright / DMCA</h2>
      <p>{cfg.brand} does not host any content. All streams are provided by third parties. If you believe content linked here infringes your rights, please contact the actual host. For any other concern, email us at the address above.</p>
    </Shell>
  )
}
