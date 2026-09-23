import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExternalLink, X, Zap } from 'lucide-react'
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

  // 支持 ?game=<id> 深链：自动打开对应内置游戏
  const gameParam = searchParams.get('game')
  useEffect(() => {
    if (!gameParam) return
    const game = gamesData.items.find((g) => g.id === gameParam)
    if (game && game.type === 'internal') {
      openGame(game)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameParam])

  if (activeGame) {
    return (
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={closeGame}
            className="mb-6 inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            ← 返回游戏大厅
          </button>
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon name={activeGame.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeGame.name}</h1>
                  <p className="text-slate-600 dark:text-slate-400">{activeGame.description}</p>
                </div>
              </div>
              <button
                onClick={closeGame}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            {GameComponent && <GameComponent />}
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <SectionTitle
        title="小游戏广场"
        subtitle="内置即点即玩的休闲小游戏，同时还为你整理了热门的外部游戏网站"
      />

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {gamesData.categories.map((cat) => (
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

      {/* 游戏网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredGames.map((game, index) => {
          const isBuiltin = game.type === 'internal'
          const cardContent = (
            <>
              <span
                className={`absolute top-4 right-4 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  isBuiltin
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                }`}
              >
                {isBuiltin ? <Zap className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                {isBuiltin ? '内置游戏' : '外部网站'}
              </span>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  {isBuiltin ? (
                    <Icon name={game.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Favicon id={game.id} url={game.url} fallbackIcon={game.icon} className="w-7 h-7 rounded" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 pr-14">{game.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{game.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                {game.difficulty ? (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    难度：{game.difficulty}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    外部游戏
                  </span>
                )}
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                  {isBuiltin ? '开始游戏 →' : '前往 →'}
                </span>
              </div>
            </>
          )

          return (
            <ScrollReveal key={game.id} delay={index * 0.05}>
              {isBuiltin ? (
                <Card onClick={() => openGame(game)} className="p-5 h-full group relative cursor-pointer">
                  {cardContent}
                </Card>
              ) : (
                <a href={game.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="p-5 h-full group relative cursor-pointer">
                    {cardContent}
                  </Card>
                </a>
              )}
            </ScrollReveal>
          )
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400">没有找到匹配的游戏</p>
        </div>
      )}
    </div>
  )
}