import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Trash2, Heart, HeartOff } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Favicon } from '../components/Favicon.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import resourcesData from '../data/resources.json'

export default function Favorites() {
  const [favorites, setFavorites] = useLocalStorage('taotools-favorites', [])

  const favoriteItems = useMemo(
    () => resourcesData.items.filter((item) => favorites.includes(item.id)),
    [favorites],
  )

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const clearAll = () => {
    setFavorites([])
  }

  const hasFavorites = favoriteItems.length > 0

  return (
    <div className="page-container space-y-12">
      <header>
        <p className="label-mono">Favorites</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          我的收藏
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          {hasFavorites
            ? `已收藏 ${favoriteItems.length} 个资源，收藏记录保存在本机浏览器。`
            : '在资源库收藏的站点会汇总到这里，记录保存在本机浏览器。'}
        </p>
      </header>

      <section>
        <SectionTitle
          index="01"
          title="已收藏资源"
          subtitle={hasFavorites ? '点卡片直接在新标签页打开站点。' : '收藏后会在这里列出。'}
          action={
            hasFavorites ? (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 清空收藏
              </button>
            ) : undefined
          }
        />

        {!hasFavorites ? (
          <div className="py-16 text-center">
            <span className="w-10 h-10 mx-auto flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
              <HeartOff className="w-[18px] h-[18px]" />
            </span>
            <p className="mt-4 text-[15px] font-medium text-slate-900 dark:text-white">
              还没有收藏任何资源
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              在资源库点击卡片右上角的 ♥，收藏的站点就会出现在这里。
            </p>
            <Link to="/resources" className="btn-primary mt-6">
              浏览资源库
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteItems.map((item) => (
              <ScrollReveal key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <Card className="relative p-4 h-full flex flex-col">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                      aria-label="取消收藏"
                      title="取消收藏"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    <div className="flex items-start gap-3 pr-8">
                      <span
                        className="w-10 h-10 shrink-0 rounded-md border border-slate-200 dark:border-slate-700
                                   flex items-center justify-center p-2.5 text-slate-500 dark:text-slate-400 transition-colors
                                   group-hover:border-primary-300 dark:group-hover:border-primary-800"
                      >
                        <Favicon
                          id={item.id}
                          url={item.url}
                          fallbackIcon={item.icon}
                          className="w-full h-full object-contain"
                        />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-medium leading-snug text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 mb-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="label-mono">
                        {resourcesData.categories.find((c) => c.id === item.category)?.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        访问
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </a>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
