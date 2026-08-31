import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ExternalLink, Trash2, HeartOff } from 'lucide-react'
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

  return (
    <div className="page-container">
      <div className="flex items-start justify-between mb-10">
        <SectionTitle
          title="我的收藏"
          subtitle={
            favoriteItems.length > 0
              ? `共收藏 ${favoriteItems.length} 个资源`
              : '收藏你喜欢的资源，随时回来查看'
          }
        />
        {favoriteItems.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 shrink-0 mt-1 px-3 py-2 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> 清空收藏
          </button>
        )}
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <HeartOff className="w-9 h-9 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">还没有收藏任何资源</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            在「资源库」中点击卡片右上角的 ♥ 即可收藏
          </p>
          <Link to="/resources" className="btn-primary text-sm">
            去逛逛资源库
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {favoriteItems.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.05}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full group"
              >
                <Card className="p-5 h-full group relative flex flex-col cursor-pointer hover:border-primary-200 dark:hover:border-primary-800">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFavorite(item.id)
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
                    aria-label="取消收藏"
                    title="取消收藏"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </button>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <Favicon id={item.id} url={item.url} fallbackIcon={item.icon} className="w-7 h-7 rounded" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {resourcesData.categories.find((c) => c.id === item.category)?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                      访问 <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </a>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}