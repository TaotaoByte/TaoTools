import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '../components/AnimatedCounter.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Card } from '../components/Card.jsx'
import { Icon } from '../components/Icon.jsx'
import statsData from '../data/stats.json'
import categoriesData from '../data/categories.json'
import latestData from '../data/latest.json'
import toolsData from '../data/tools.json'
import resourcesData from '../data/resources.json'
import aiTutorialsData from '../data/aiTutorials.json'

const statColors = [
  'bg-blue-500 text-blue-600 dark:text-blue-400',
  'bg-emerald-500 text-emerald-600 dark:text-emerald-400',
  'bg-violet-500 text-violet-600 dark:text-violet-400',
  'bg-rose-500 text-rose-600 dark:text-rose-400',
]

const statBgColors = [
  'bg-blue-50 dark:bg-blue-900/20',
  'bg-emerald-50 dark:bg-emerald-900/20',
  'bg-violet-50 dark:bg-violet-900/20',
  'bg-rose-50 dark:bg-rose-900/20',
]

function SectionHeader({ en, zh, desc }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-1 h-5 rounded-full bg-primary-600 dark:bg-primary-400" />
        <span className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400">
          {en}
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">{zh}</span>
      </div>
      {desc && (
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{desc}</p>
      )}
    </div>
  )
}

function NumberBadge({ number }) {
  return (
    <span className="text-3xl sm:text-4xl font-bold text-slate-100 dark:text-slate-800 select-none">
      {String(number).padStart(2, '0')}
    </span>
  )
}

export default function Home() {
  const featuredItems = [
    { ...latestData.items[0], type: '精选', number: 1 },
    { ...aiTutorialsData.items[0], type: '教程', number: 2 },
    { ...latestData.items[1], type: '文章', number: 3 },
  ]

  const featuredTools = toolsData.items
    .filter((t) => t.featured)
    .slice(0, 6)

  const featuredResources = resourcesData.items.slice(0, 6)

  return (
    <div className="overflow-hidden">
      {/* Hero 区域 */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center pt-16 pb-12">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 left-1/5 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-10 w-64 h-64 bg-emerald-300/20 dark:bg-emerald-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-10 w-72 h-72 bg-amber-300/20 dark:bg-amber-700/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-primary-100/40 to-indigo-100/40 dark:from-primary-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto section-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>实用工具 · 精选资源 · 知识分享</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            TaoTools
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl lg:text-3xl text-slate-700 dark:text-slate-200 mb-8 font-medium leading-relaxed max-w-3xl mx-auto"
          >
            把每一个工具与资源，真正变成你的能力。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/tools" className="btn-primary text-base min-w-[180px]">
              开始探索
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/knowledge" className="btn-secondary text-base min-w-[180px]">
              浏览知识库
            </Link>
          </motion.div>

          {/* 首屏数据概览 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statsData.items.map((stat, index) => (
                <Card key={stat.id} className="p-4 sm:p-5 text-center backdrop-blur-sm bg-white/70 dark:bg-slate-800/70">
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-xl ${statBgColors[index % statBgColors.length]} flex items-center justify-center`}>
                    <Icon name={stat.icon} className={`w-5 h-5 ${statColors[index % statColors.length]}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 精选推荐 Featured */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader
            en="Featured"
            zh="精选推荐"
            desc="最值得先看的内容，从工具到教程，帮你快速找到方向。"
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredItems.map((item, index) => (
              <ScrollReveal key={`featured-${index}`} delay={index * 0.1}>
                <Link to={item.link || `/ai/tutorials/${item.slug}`}>
                  <Card className="overflow-hidden h-full group relative flex flex-col">
                    {item.cover && (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-widest text-primary-600 dark:text-primary-400 uppercase">
                          {String(item.number).padStart(2, '0')} / {item.type}
                        </span>
                        <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1">
                        {item.description || item.summary}
                      </p>
                      {item.readTime && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                          阅读时间：{item.readTime}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <NumberBadge number={item.number} />
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 探索板块 Explore */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader
            en="Explore"
            zh="探索板块"
            desc="六大核心板块，覆盖工具、资源、软件、AI 与知识。"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {categoriesData.homeCards.map((card, index) => (
              <ScrollReveal key={card.id} delay={index * 0.08}>
                <Link to={card.link}>
                  <Card className="p-6 h-full group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={card.icon} className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{card.description}</p>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 精选工具 Tools */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              en="Toolbox"
              zh="精选工具"
              desc="即开即用的内置小工具，提升日常工作效率。"
            />
            <Link
              to="/tools"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-10"
            >
              全部工具 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredTools.map((tool, index) => {
              const colorClass = statColors[index % statColors.length]
              const bgClass = statBgColors[index % statBgColors.length]
              return (
                <ScrollReveal key={tool.id} delay={index * 0.05}>
                  <Link to={tool.type === 'external' ? tool.url : `/tools`}>
                    <Card className="p-5 h-full group flex items-start gap-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300">
                      <span className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
                        <Icon name={tool.icon} className={`w-6 h-6 ${colorClass}`} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">
                            {tool.category}
                          </span>
                          {tool.type === 'external' && (
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 精选资源 Resources */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              en="Resources"
              zh="精选资源"
              desc="设计、素材、字体、学习资源，一键直达。"
            />
            <Link
              to="/resources"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-10"
            >
              全部资源 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredResources.map((item, index) => {
              const categoryName = resourcesData.categories.find((c) => c.id === item.category)?.name
              const colorClass = statColors[(index + 2) % statColors.length]
              const bgClass = statBgColors[(index + 2) % statBgColors.length]
              return (
                <ScrollReveal key={item.id} delay={index * 0.05}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="p-5 h-full group flex items-start gap-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300">
                      <span className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
                        <Icon name={item.icon} className={`w-6 h-6 ${colorClass}`} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">
                            {categoryName}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </Card>
                  </a>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 最新更新 Latest */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader
            en="Latest"
            zh="最新更新"
            desc="近期新增的工具、文章与资源推荐。"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {latestData.items.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 0.1}>
                <Link to={item.link}>
                  <Card className="p-5 h-full group hover:shadow-lg transition-all duration-300">
                    <span className="text-xs font-bold tracking-widest text-primary-600 dark:text-primary-400 uppercase mb-3 block">
                      {String(index + 1).padStart(2, '0')} / {item.tag}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{item.date}</span>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
