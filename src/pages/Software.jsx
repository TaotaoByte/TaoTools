import { useState, useMemo } from 'react'
import { Search, Download } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Icon } from '../components/Icon.jsx'
import { Favicon } from '../components/Favicon.jsx'
import softwareData from '../data/software.json'

export default function Software() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredSoftware = useMemo(() => {
    return softwareData.items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="page-container">
      <SectionTitle
        title="软件推荐"
        subtitle="精选开发、办公、设计、系统与媒体软件，提升你的数字生产力"
      />

      {/* 搜索框 */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索软件名称..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {softwareData.categories.map((cat) => (
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

      {/* 软件网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredSoftware.map((item, index) => (
          <ScrollReveal key={item.id} delay={index * 0.05}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full group"
            >
              <Card className="p-5 h-full group relative flex flex-col cursor-pointer hover:border-primary-200 dark:hover:border-primary-800">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                    <Favicon id={item.id} url={item.url} fallbackIcon={item.icon} className="w-7 h-7 rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {item.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      {platform}
                    </span>
                  ))}
                  <span
                    className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      item.price.includes('免费') || item.price.includes('开源')
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.price}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {softwareData.categories.find((c) => c.id === item.category)?.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                    <Download className="w-3.5 h-3.5" /> 官网
                  </span>
                </div>
              </Card>
            </a>
          </ScrollReveal>
        ))}
      </div>

      {filteredSoftware.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400">没有找到匹配的软件</p>
        </div>
      )}
    </div>
  )
}
