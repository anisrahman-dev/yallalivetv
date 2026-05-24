// Firebase Analytics with GDPR / UK-GDPR / CCPA consent gating.
//
// Visitors from EU + EEA + UK + Switzerland + US see a consent banner before
// any Firebase SDK code is loaded or any cookies are set. All other visitors
// have analytics loaded immediately. Decision is persisted in localStorage.

const CONSENT_KEY = 'yalla.consent';

const COUNTRIES_REQUIRING_CONSENT = new Set([
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA
  'IS', 'LI', 'NO',
  // UK
  'GB',
  // Switzerland (FADP — GDPR-equivalent)
  'CH',
  // US (CCPA / state privacy laws — over-applies to all US, but country-level
  // geolocation can't reliably distinguish California from other states)
  'US'
]);

const firebaseConfig = {
  apiKey: 'AIzaSyBESvZatDMFpY36TwoJZ-n5HIYjFfvtztA',
  authDomain: 'yallalivefootball.firebaseapp.com',
  projectId: 'yallalivefootball',
  storageBucket: 'yallalivefootball.firebasestorage.app',
  messagingSenderId: '84123991975',
  appId: '1:84123991975:web:9146b55b2749f7680e0082',
  measurementId: 'G-C43EHN4M3M'
};

async function loadFirebaseAnalytics() {
  const [{ initializeApp }, { getAnalytics }] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js')
  ]);
  getAnalytics(initializeApp(firebaseConfig));
}

function injectConsentStyles() {
  if (document.getElementById('consent-banner-styles')) return;
  const style = document.createElement('style');
  style.id = 'consent-banner-styles';
  style.textContent = `
    #consent-banner {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
      background: rgba(15, 23, 42, 0.97);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      font-family: 'Sora', system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: consent-slide-up .25s ease-out;
    }
    @keyframes consent-slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    #consent-banner .consent-inner {
      max-width: 1100px; margin: 0 auto;
      padding: 14px 16px;
      display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
    }
    #consent-banner p {
      margin: 0; flex: 1; min-width: 240px;
      font-size: 13px; line-height: 1.5; color: #cbd5e1;
    }
    #consent-banner a { color: #fac912; text-decoration: underline; }
    #consent-banner .consent-actions {
      display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;
    }
    #consent-banner button {
      font: inherit; font-weight: 700; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.08em;
      padding: 9px 18px; border-radius: 10px; border: 0;
      cursor: pointer; transition: opacity .15s, transform .1s;
    }
    #consent-banner button:active { transform: scale(0.97); }
    #consent-banner #consent-decline {
      background: rgba(148, 163, 184, 0.16); color: #cbd5e1;
    }
    #consent-banner #consent-decline:hover { background: rgba(148, 163, 184, 0.26); }
    #consent-banner #consent-accept {
      background: #ee335f; color: white;
    }
    #consent-banner #consent-accept:hover { background: #d1224d; }
    @media (max-width: 480px) {
      #consent-banner .consent-actions { width: 100%; margin-left: 0; }
      #consent-banner button { flex: 1; }
    }
  `;
  document.head.appendChild(style);
}

function showConsentBanner() {
  injectConsentStyles();
  const banner = document.createElement('div');
  banner.id = 'consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="consent-inner">
      <p>We use analytics cookies to understand how visitors use Yalla Live. No marketing, no third-party sharing. <a href="privacy.html">Learn more</a>.</p>
      <div class="consent-actions">
        <button id="consent-decline" type="button">Decline</button>
        <button id="consent-accept" type="button">Accept</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('consent-accept').addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.remove();
    loadFirebaseAnalytics();
  });
  document.getElementById('consent-decline').addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    banner.remove();
  });
}

async function visitorNeedsConsent() {
  try {
    const r = await fetch('https://api.country.is/', { cache: 'no-store' });
    if (!r.ok) throw new Error('geo lookup failed');
    const { country } = await r.json();
    return COUNTRIES_REQUIRING_CONSENT.has(country);
  } catch (_) {
    // Fail-closed: if we can't determine location, assume consent is needed.
    // Costs an extra banner impression for some non-EU users, but avoids
    // silently tracking an EU visitor on a flaky network.
    return true;
  }
}

(async function init() {
  const decision = localStorage.getItem(CONSENT_KEY);
  if (decision === 'accepted') return loadFirebaseAnalytics();
  if (decision === 'declined') return;

  if (await visitorNeedsConsent()) {
    showConsentBanner();
  } else {
    loadFirebaseAnalytics();
  }
})();
