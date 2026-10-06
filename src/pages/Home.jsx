import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import { AnimatedCounter } from '../components/AnimatedCounter.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Card } from '../components/Card.jsx'
import { Icon } from '../components/Icon.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { LeaderboardTeaser } from '../components/LeaderboardTeaser.jsx'
import categoriesData from '../data/categories.json'
import latestData from '../data/latest.json'
import toolsData from '../data/tools.json'
import resourcesData from '../data/resources.json'
import aiTutorialsData from '../data/aiTutorials.json'
import { useStats } from '../hooks/useStats.js'

/* ── 小图标块：发丝描边 + 中性色，悬浮时才出现强调色 ── */
function GlyphBox({ name, size = 'md' }) {
  const box = size === 'lg' ? 'w-11 h-11' : 'w-10 h-10'
  const ico = size === 'lg' ? 'w-5 h-5' : 'w-[18px] h-[18px]'
  return (
    <span
      className={`${box} shrink-0 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center
                  text-slate-500 dark:text-slate-400 transition-colors
                  group-hover:border-primary-300 dark:group-hover:border-primary-800
                  group-hover:text-primary-700 dark:group-hover:text-primary-400`}
    >
      <Icon name={name} className={ico} />
    </span>
  )
}

export default function Home() {
  const stats = useStats()

  const featuredTools = toolsData.items.filter((t) => t.featured).slice(0, 6)
  const featuredResources = resourcesData.items.slice(0, 6)
  const tutorials = aiTutorialsData.items.slice(0, 4)
  const cards = categoriesData.homeCards.filter((c) => c.link?.startsWith('/'))

  return (
    <div>
      {/* ── 首屏 ── */}
      <section className="relative border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-dotgrid mask-fade-b opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto section-padding pt-14 pb-12 sm:pt-16 sm:pb-14">
          <p className="label-mono mb-5">Tools · Rankings · Notes</p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white text-balance">
            开发者的小工具台
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl">
            <span className="text-slate-900 dark:text-slate-200 font-medium">TaoTools</span>{' '}
            收录了一批在浏览器本地运行的小工具、一份自动同步的 AI 模型榜单，以及持续整理的中文技术笔记。
            不注册、不上传，用完即走。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/tools" className="btn-primary">
              打开工具箱
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/ai" className="btn-secondary">
              查看 AI 榜单
            </Link>
          </div>

          {/* 数据行：一条基线 + 竖分隔，不用彩色卡片 */}
          <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 dark:border-slate-800">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="py-5 pr-4 border-b border-slate-200 dark:border-slate-800 sm:border-b-0 sm:border-r last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
              >
                <dt className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white tnum">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="max-w-6xl mx-auto section-padding py-12 sm:py-14 space-y-16">
        {/* ── 01 板块导航 ── */}
        <section>
          <SectionTitle
            index="01"
            title="板块"
            subtitle="按用途分成六块，想找什么直接进。"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <ScrollReveal key={card.id}>
                <Link to={card.link} className="group block">
                  <Card className="p-5 h-full flex items-start gap-4">
                    <GlyphBox name={card.icon} />
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">
                        {card.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {card.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── 02 AI 模型榜单（自动同步） ── */}
        <LeaderboardTeaser />

        {/* ── 03 精选工具 ── */}
        <section>
          <SectionTitle
            index="03"
            title="精选工具"
            subtitle="打开就能用，数据不出浏览器。"
            action={
              <Link
                to="/tools"
                className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
              >
                全部工具 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredTools.map((tool) => (
              <ScrollReveal key={tool.id}>
                <Link to={tool.type === 'external' ? tool.url : '/tools'} className="group block">
                  <Card className="p-5 h-full flex items-start gap-4">
                    <GlyphBox name={tool.icon} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">
                          {tool.name}
                        </h3>
                        {tool.type === 'external' && (
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── 04 精选资源 ── */}
        <section>
          <SectionTitle
            index="04"
            title="精选资源"
            subtitle="设计、素材、字体与学习站点。"
            action={
              <Link
                to="/resources"
                className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
              >
                全部资源 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredResources.map((item) => (
              <ScrollReveal key={item.id}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <Card className="p-5 h-full flex items-start gap-4">
                    <GlyphBox name={item.icon} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">
                          {item.name}
                        </h3>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── 05 AI 教程 ── */}
        <section>
          <SectionTitle
            index="05"
            title="AI 教程"
            subtitle="从 Prompt 写法到本地部署，都是实际用过的内容。"
            action={
              <Link
                to="/ai"
                className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
              >
                更多 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tutorials.map((item) => (
              <ScrollReveal key={item.id}>
                <Link to={`/ai/tutorials/${item.slug}`} className="group block h-full">
                  <Card className="h-full overflow-hidden flex flex-col">
                    {item.cover && (
                      <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <img
                          src={item.cover}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-[15px] font-medium leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                        {item.summary}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="label-mono">{item.date}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {item.readTime}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── 06 最近更新 ── */}
        <section>
          <SectionTitle index="06" title="最近更新" subtitle="站点近期新增与调整。" />
          <div className="border-t border-slate-200 dark:border-slate-800">
            {latestData.items.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="group flex items-baseline gap-4 py-4 border-b border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/50 transition-colors px-1"
              >
                <span className="label-mono w-20 shrink-0">{item.date}</span>
                <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  {item.tag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-[15px] font-medium text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                    {item.title}
                  </span>
                  <span className="hidden sm:inline text-[13px] text-slate-500 dark:text-slate-400">
                    {' '}— {item.description}
                  </span>
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
