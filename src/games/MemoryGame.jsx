import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart, Star, Moon, Sun, Cloud, Zap, Flower2, Gem } from 'lucide-react'

const EMOJIS = [Heart, Star, Moon, Sun, Cloud, Zap, Flower2, Gem]
const COLORS = [
  'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
  'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  'text-sky-500 bg-sky-50 dark:bg-sky-900/20',
  'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
]

// 生成一副随机打乱的 16 张牌（8 对）
function createDeck() {
  const cards = []
  EMOJIS.forEach((Icon, i) => {
    cards.push({ Icon, color: COLORS[i], id: i })
    cards.push({ Icon, color: COLORS[i], id: i })
  })
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards.map((c, index) => ({ ...c, index }))
}

export default function MemoryGame() {
  const newGame = () => ({
    deck: createDeck(),
    flipped: [],      // 已翻开但未配对的下标
    matched: new Set(),
    moves: 0,
    over: false,
  })
  const [state, setState] = useState(newGame)
  const lockRef = useRef(false)

  // 自动翻回未匹配的牌
  useEffect(() => {
    if (state.flipped.length !== 2) return
    lockRef.current = true
    const t = setTimeout(() => {
      setState((prev) => {
        lockRef.current = false
        if (prev.over) return prev
        return { ...prev, flipped: [] }
      })
    }, 900)
    return () => clearTimeout(t)
  }, [state.flipped])

  const flip = useCallback((index) => {
    setState((prev) => {
      if (prev.over || lockRef.current) return prev
      if (prev.flipped.includes(index) || prev.matched.has(index)) return prev
      const flipped = [...prev.flipped, index]
      const moves = prev.moves
      if (flipped.length === 2) {
        const [a, b] = flipped
        const ca = prev.deck[a]
        const cb = prev.deck[b]
        const matched = new Set(prev.matched)
        if (ca.id === cb.id) {
          matched.add(a)
          matched.add(b)
          const over = matched.size === prev.deck.length
          return { ...prev, flipped: [], matched, moves: moves + 1, over }
        }
        return { ...prev, flipped, moves: moves + 1 }
      }
      return { ...prev, flipped }
    })
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-500 dark:text-slate-400">步数</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{state.moves}</div>
          </div>
          <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-500 dark:text-slate-400">配对</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{state.matched.size}</div>
          </div>
        </div>
        <button onClick={() => setState(newGame())} className="btn-primary text-sm px-4 py-2">
          重新开始
        </button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 gap-2">
          {state.deck.map((card, i) => {
            const isFlipped = state.flipped.includes(i) || state.matched.has(i)
            const isMatched = state.matched.has(i)
            if (isFlipped) {
              const CardIcon = card.Icon
              return (
                <button
                  key={i}
                  onClick={() => flip(i)}
                  className={`rounded-xl aspect-square flex items-center justify-center ${card.color} ${isMatched ? 'opacity-60 scale-95' : ''}`}
                >
                  <CardIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </button>
              )
            }
            return (
              <button
                key={i}
                onClick={() => flip(i)}
                className="rounded-xl aspect-square bg-slate-300 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                aria-label="翻开卡片"
              >
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-white/60 dark:bg-slate-500/40" />
              </button>
            )
          })}
        </div>

        {state.over && (
          <div className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-bold text-white">全部配对完成</p>
            <p className="text-white/80">共用了 {state.moves} 步</p>
            <button onClick={() => setState(newGame())} className="btn-primary">
              再来一局
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
        点击翻开卡片，找出相同的图案完成配对
      </p>
    </div>
  )
}