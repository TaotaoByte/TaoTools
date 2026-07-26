import { useState, useMemo } from 'react'
import { Search, ExternalLink, Heart } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Icon } from '../components/Icon.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import resourcesData from '../data/resources.json'

export default function Resources() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [favorites, setFavorites] = useLocalStorage('taotools-favorites', [])

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const filteredResources = useMemo(() => {
    return resourcesData.items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="page-container">
      <SectionTitle
        title="资源库"
        subtitle="精选设计、素材、图标、字体与学习资源，助力创作与学习"
      />

      {/* 搜索框 */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索资源名称、标签..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {resourcesData.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 资源网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredResources.map((item, index) => {
          const isFavorite = favorites.includes(item.id)
          return (
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
                    aria-label={isFavorite ? '取消收藏' : '收藏'}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isFavorite
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  </button>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <Icon name={item.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400">没有找到匹配的资源</p>
        </div>
      )}
    </div>
  )
}
