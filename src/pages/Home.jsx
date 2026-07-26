import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '../components/AnimatedCounter.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { Icon } from '../components/Icon.jsx'
import statsData from '../data/stats.json'
import categoriesData from '../data/categories.json'
import latestData from '../data/latest.json'

export default function Home() {
  const scrollToContent = () => {
    document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="overflow-hidden">
      {/* Hero 区域 */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-700/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-100/40 to-indigo-100/40 dark:from-primary-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
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
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            TaoTools
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-4 font-medium"
          >
            一站式工具导航与知识分享平台
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            聚合实用工具、精选资源、效率软件与开发知识，让你的工作与学习更高效。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={scrollToContent} className="btn-primary text-base min-w-[160px]">
              开始探索
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <Link to="/tools" className="btn-secondary text-base min-w-[160px]">
              浏览工具
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 数据统计区 */}
      <section id="stats" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionTitle
            title="数据概览"
            subtitle="TaoTools 持续成长，为你提供更丰富的工具与资源"
            centered
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statsData.items.map((stat, index) => (
              <ScrollReveal key={stat.id} delay={index * 0.1}>
                <Card className="p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Icon name={stat.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 板块快捷入口 */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionTitle
            title="探索板块"
            subtitle="六大核心板块，覆盖工具、资源、软件、AI 与知识"
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {categoriesData.homeCards.map((card, index) => (
              <ScrollReveal key={card.id} delay={index * 0.08}>
                <Link to={card.link}>
                  <Card className="p-6 h-full group">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={card.icon} className="w-7 h-7 text-white" />
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

      {/* 最新更新/推荐区 */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionTitle
            title="最新更新"
            subtitle="近期新增的工具、文章与资源推荐"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {latestData.items.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 0.1}>
                <Link to={item.link}>
                  <Card className="p-5 h-full">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium mb-3">
                      {item.tag}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">{item.description}</p>
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
