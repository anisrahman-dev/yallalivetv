import { useEffect } from 'react'

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'name' || k === 'property') el.setAttribute(k, v)
    })
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  return el
}

export default function PageMeta({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogType,
  ogUrl,
  twitterCard,
  twitterTitle,
  twitterDescription,
  googleVerification,
  robots
}) {
  useEffect(() => {
    if (title) document.title = title
    if (description) upsertMeta('meta[name="description"]', { name: 'description', content: description })
    if (keywords) upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })
    if (ogTitle) upsertMeta('meta[property="og:title"]', { property: 'og:title', content: ogTitle })
    if (ogDescription) upsertMeta('meta[property="og:description"]', { property: 'og:description', content: ogDescription })
    if (ogType) upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType })
    if (ogUrl) upsertMeta('meta[property="og:url"]', { property: 'og:url', content: ogUrl })
    if (twitterCard) upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: twitterCard })
    if (twitterTitle) upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: twitterTitle })
    if (twitterDescription) upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: twitterDescription })
    if (robots) upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    if (googleVerification) upsertMeta('meta[name="google-site-verification"]', { name: 'google-site-verification', content: googleVerification })
  }, [title, description, keywords, ogTitle, ogDescription, ogType, ogUrl, twitterCard, twitterTitle, twitterDescription, googleVerification, robots])
  return null
}
