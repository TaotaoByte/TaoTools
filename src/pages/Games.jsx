import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Play, X } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Icon } from '../components/Icon.jsx'
import { Favicon } from '../components/Favicon.jsx'
import gamesData from '../data/games.json'

// 动态导入内置小游戏组件
const gameComponents = {
  Game2048: () => import('../games/Game2048.jsx'),
  SnakeGame: () => import('../games/SnakeGame.jsx'),
  MinesweeperGame: () => import('../games/MinesweeperGame.jsx'),
  MemoryGame: () => import('../games/MemoryGame.jsx'),
}

/* 图标块：发丝描边 + 中性色，只有整卡悬浮时才出现强调色 */
function GlyphBox({ children }) {
  return (
    <span
      className="w-10 h-10 shrink-0 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center
                 text-slate-500 dark:text-slate-400 transition-colors
                 group-hover:border-primary-300 dark:group-hover:border-primary-800
                 group-hover:text-primary-700 dark:group-hover:text-primary-400"
    >
      {children}
    </span>
  )
}

/* 分类标签：整页只有「当前项」用到强调色 */
function chipClass(active) {
  return `px-3 py-1.5 rounded-md text-[13px] border transition-colors ${
    active
      ? 'bg-primary-600 border-primary-600 text-white font-medium'
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100'
  }`
}

export default function Games() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeGame, setActiveGame] = useState(null)
  const [GameComponent, setGameComponent] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const filteredGames = gamesData.items.filter(
    (game) => activeCategory === 'all' || game.category === activeCategory
  )

  const openGame = async (game) => {
    if (game.type === 'external') {
      window.open(game.url, '_blank', 'noopener,noreferrer')
      return
    }
    const importFn = gameComponents[game.component]
    if (importFn) {
      const module = await importFn()
      setGameComponent(() => module.default)
      setActiveGame(game)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const closeGame = () => {
    setActiveGame(null)
    setGameComponent(null)
    if (searchParams.get('game')) {
      setSearchParams({}, { replace: true })
    }
  }

  // 支持 ?game=<id> 深链：自动打开对应内置游戏。
  // 参数消失时同样要关掉详情，避免地址回到列表而页面还停在上一个游戏上。
  const gameParam = searchParams.get('game')
  useEffect(() => {
    const close = () => {
      setActiveGame(null)
      setGameComponent(null)
    }
    if (!gameParam) {
      close()
      return
    }
    const game = gamesData.items.find((g) => g.id === gameParam)
    if (game && game.type === 'internal') {
      openGame(game)
    } else {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameParam])

  // 列表数量直接由数据推导，避免页头文案与数据脱节
  const builtinCount = gamesData.items.filter((g) => g.type === 'internal').length
  const externalCount = gamesData.items.length - builtinCount

  if (activeGame) {
    return (
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={closeGame}
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回游戏列表
          </button>

          <Card hover={false} className="mt-4">
            <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 min-w-0">
                <GlyphBox>
                  <Icon name={activeGame.icon} className="w-[18px] h-[18px]" />
                </GlyphBox>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    {activeGame.name}
                  </h1>
                  <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
                    {activeGame.description}
                  </p>
                </div>
              </div>
              <button
                onClick={closeGame}
                className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="关闭游戏"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5">{GameComponent && <GameComponent />}</div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-10">
      {/* ── 页头 ── */}
      <header>
        <p className="label-mono">Games</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          小游戏
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          {builtinCount} 个内置小游戏打开即可开始，另有 {externalCount} 个外部游戏站点在新标签页打开。
        </p>
      </header>

      <section>
        <SectionTitle
          index="01"
          title="全部游戏"
          subtitle="内置游戏直接在本页开始，外部站点在新标签页打开。"
          action={
            <span className="label-mono tnum">
              {filteredGames.length} / {gamesData.items.length}
            </span>
          }
        />

        {/* 分类 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gamesData.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={chipClass(activeCategory === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 游戏网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGames.map((game, index) => {
            const isBuiltin = game.type === 'internal'
            const cardContent = (
              <>
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  {isBuiltin ? <Play className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                  {isBuiltin ? '内置游戏' : '外部网站'}
                </span>
                <div className="flex items-start gap-3 mb-3">
                  <GlyphBox>
                    {isBuiltin ? (
                      <Icon name={game.icon} className="w-[18px] h-[18px]" />
                    ) : (
                      <Favicon
                        id={game.id}
                        url={game.url}
                        fallbackIcon={game.icon}
                        className="w-5 h-5 rounded-sm"
                      />
                    )}
                  </GlyphBox>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-[15px] font-medium text-slate-900 dark:text-white pr-16">
                      {game.name}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {game.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    {game.difficulty ? `难度：${game.difficulty}` : '外部游戏'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 group-hover:underline">
                    {isBuiltin ? '开始游戏' : '前往'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </>
            )

            return (
              <ScrollReveal key={game.id} delay={index * 0.05}>
                {isBuiltin ? (
                  <Card onClick={() => openGame(game)} className="p-4 h-full group relative cursor-pointer flex flex-col">
                    {cardContent}
                  </Card>
                ) : (
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <Card className="p-4 h-full group relative cursor-pointer flex flex-col">
                      {cardContent}
                    </Card>
                  </a>
                )}
              </ScrollReveal>
            )
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              这个分类下暂时没有游戏。
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
            >
              查看全部分类
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
