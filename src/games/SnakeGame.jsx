import { useState, useEffect, useCallback, useRef } from 'react'

const COLS = 20
const ROWS = 20

function randCell(exclude = []) {
  const set = new Set(exclude.map((c) => `${c[0]},${c[1]}`))
  const empty = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!set.has(`${r},${c}`)) empty.push([r, c])
    }
  }
  if (empty.length === 0) return null
  return empty[Math.floor(Math.random() * empty.length)]
}

export default function SnakeGame() {
  // 初始蛇：横向 3 节，位于中间
  const start = () => {
    const mid = Math.floor(ROWS / 2)
    return {
      snake: [[mid, 5], [mid, 4], [mid, 3]],
      food: randCell([[mid, 5], [mid, 4], [mid, 3]]),
      dir: 'right',
      over: false,
      score: 0,
    }
  }
  const [state, setState] = useState(start)
  const dirRef = useRef('right')
  const stateRef = useRef(state)
  stateRef.current = state

  const reset = () => {
    dirRef.current = 'right'
    setState(start())
  }

  const turn = useCallback((dir) => {
    const { dir: cur } = stateRef.current
    const opposite = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }
    if (dir !== opposite[cur]) dirRef.current = dir
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      }
      if (map[e.key]) {
        e.preventDefault()
        turn(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn])

  // 游戏主循环
  useEffect(() => {
    if (state.over) return
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.over) return prev
        const dir = dirRef.current
        const head = prev.snake[0]
        const nr = head[0] + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0)
        const nc = head[1] + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0)
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return { ...prev, over: true }
        const hitSelf = prev.snake.some(([r, c], i) => i < prev.snake.length - 1 && r === nr && c === nc)
        if (hitSelf) return { ...prev, over: true }
        const ate = prev.food && prev.food[0] === nr && prev.food[1] === nc
        const newSnake = [[nr, nc], ...prev.snake]
        if (!ate) newSnake.pop()
        const food = ate ? randCell(newSnake) || prev.food : prev.food
        return { ...prev, snake: newSnake, food, score: prev.score + (ate ? 1 : 0) }
      })
    }, Math.max(70, 150 - state.score * 3))
    return () => clearInterval(id)
  }, [state.over, state.score])

  const snakeSet = new Set(state.snake.map(([r, c]) => `${r},${c}`))

  return (
    <div className="select-none max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-600">
          <div className="text-xs text-slate-500 dark:text-slate-400">长度</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{state.score + 3}</div>
        </div>
        <button onClick={reset} className="btn-primary text-sm px-4 py-2">
          重新开始
        </button>
      </div>

      <div
        className="relative grid bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, aspectRatio: '1 / 1' }}
      >
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const key = `${r},${c}`
            const isFood = state.food && state.food[0] === r && state.food[1] === c
            const isHead = state.snake[0][0] === r && state.snake[0][1] === c
            const isBody = snakeSet.has(key)
            return (
              <div
                key={key}
                className={isHead
                  ? 'bg-primary-600 rounded-sm'
                  : isBody
                  ? 'bg-primary-400 rounded-sm'
                  : isFood
                  ? 'bg-red-500 rounded-full'
                  : ''}
                style={{ aspectRatio: '1/1' }}
              />
            )
          })
        )}

        {state.over && (
          <div className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-bold text-white">游戏结束</p>
            <p className="text-white/80">得分：{state.score}</p>
            <button onClick={reset} className="btn-primary">
              再来一局
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
        使用方向键或 WASD 控制方向，吃下红色食物不断变长
      </p>
    </div>
  )
}