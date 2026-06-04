import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { ARTICLES } from '../lib/articles.js'

export default function Blog() {
  return (
    <Layout>
      <PageMeta
        title="Football Guides & World Cup Blog | Yalla Live"
        description="Read the Yalla Live blog — guides to the FIFA World Cup 2026, tournament history, all-time top scorers, the World Cup format explained, and how to watch football across MENA."
        keywords="Yalla Live blog, football guides, World Cup 2026, World Cup history, World Cup format, how to watch football MENA, beIN Sports"
        ogTitle="Football Guides & World Cup Blog | Yalla Live"
        ogDescription="Guides to the FIFA World Cup 2026, tournament history, top scorers, and how to watch football live."
      />

      <main className="pt-[110px] pb-16 max-w-[900px] mx-auto min-h-screen px-4">
        <div className="bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-gray-400 dark:text-slate-500">Blog</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Football Guides &amp; World Cup Blog
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
            In-depth guides and explainers from the <strong className="text-[#ee335f]">Yalla Live</strong> team — everything you
            need to follow the FIFA World Cup 2026 and watch football live, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to={a.slug}
              className="group flex flex-col bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-[#ee335f] dark:hover:border-[#ee335f] hover:shadow-md transition-all"
            >
              <span className="inline-block self-start text-[10px] font-extrabold uppercase tracking-wider text-[#ee335f] bg-[#ee335f]/10 rounded-full px-2.5 py-1 mb-3">
                {a.category}
              </span>
              <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug tracking-tight group-hover:text-[#ee335f] transition-colors">
                {a.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed flex-1">
                {a.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#ee335f]">
                Read guide
                <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  )
}
