import { useState, useEffect, useCallback, useRef } from 'react'

const SIZE = 4

// 每个数字对应的背景色
const TILE_STYLES = {
  2: 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100',
  4: 'bg-amber-200 dark:bg-amber-700/60 text-slate-800 dark:text-slate-100',
  8: 'bg-orange-300 text-slate-800',
  16: 'bg-orange-400 text-white',
  32: 'bg-rose-400 text-white',
  64: 'bg-red-400 text-white',
  128: 'bg-yellow-300 text-slate-800',
  256: 'bg-yellow-400 text-slate-800',
  512: 'bg-lime-400 text-slate-900',
  1024: 'bg-emerald-400 text-slate-900',
  2048: 'bg-primary-500 text-white',
}

function TileStyle(value) {
  return TILE_STYLES[value] || 'bg-slate-500 text-white'
}

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandomTile(board) {
  const empty = []
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) empty.push([r, c])
    })
  )
  if (empty.length === 0) return board
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const next = board.map((row) => [...row])
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

function newGame() {
  let b = emptyBoard()
  b = addRandomTile(b)
  b = addRandomTile(b)
  return { board: b, score: 0, over: false, won: false }
}

// 在一条线（数组）上执行滑动合并，返回 [新数组, 增加分数, 是否发生变化]
function slideLine(line, score) {
  const vals = line.filter((v) => v !== 0)
  const merged = []
  let gained = 0
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      merged.push(vals[i] * 2)
      gained += vals[i] * 2
      i++
    } else {
      merged.push(vals[i])
    }
  }
  while (merged.length < SIZE) merged.push(0)
  const moved = merged.some((v, i) => v !== line[i])
  return { line: merged, gained, moved }
}

function moveBoard(board, dir) {
  const score = 0
  const fromCols = dir === 'left' || dir === 'right'
  const reverse = dir === 'right' || dir === 'down'
  const next = emptyBoard()
  let gained = 0
  let moved = false

  for (let i = 0; i < SIZE; i++) {
    const line = []
    for (let j = 0; j < SIZE; j++) {
      const v = fromCols ? board[i][j] : board[j][i]
      line.push(v)
    }
    const prepared = reverse ? [...line].reverse() : line
    const { line: newLine, gained: g, moved: m } = slideLine(prepared, score)
    const lineFinal = reverse ? [...newLine].reverse() : newLine
    gained += g
    if (m) moved = true
    lineFinal.forEach((v, j) => {
      if (fromCols) next[i][j] = v
      else next[j][i] = v
    })
  }
  return { board: next, gained, moved }
}

function hasMoves(board) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) return true
      if (j + 1 < SIZE && board[i][j] === board[i][j + 1]) return true
      if (i + 1 < SIZE && board[i][j] === board[i + 1][j]) return true
    }
  }
  return false
}

export default function Game2048() {
  const [state, setState] = useState(newGame)
  const touchStart = useRef(null)

  const handleMove = useCallback((dir) => {
    setState((prev) => {
      const { board: nb, gained, moved } = moveBoard(prev.board, dir)
      if (!moved) return prev
      let board = addRandomTile(nb)
      let won = prev.won
      if (!won) {
        board.forEach((row) => row.forEach((v) => { if (v >= 2048) won = true }))
      }
      const over = !hasMoves(board)
      return { board, score: prev.score + gained, over, won }
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      }
      if (map[e.key]) {
        e.preventDefault()
        handleMove(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMove])

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    handleMove(dir)
    touchStart.current = null
  }

  const best = Math.max(...state.board.flat(), 0)

  return (
    <div className="select-none max-w-md mx-auto">
      {/* 顶部信息 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 text-center border border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-500 dark:text-slate-400">得分</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{state.score}</div>
          </div>
          <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 text-center border border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-500 dark:text-slate-400">最高</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{Math.max(best, state.score)}</div>
          </div>
        </div>
        <button onClick={() => setState(newGame())} className="btn-primary text-sm px-4 py-2">
          重新开始
        </button>
      </div>

      {/* 棋盘 */}
      <div
        className="relative grid gap-2 bg-slate-300 dark:bg-slate-700 rounded-2xl p-2 touch-none"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, aspectRatio: '1 / 1' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {state.board.flat().map((v, i) => (
          <div
            key={i}
            className={`rounded-xl flex items-center justify-center font-bold transition-colors duration-150 ${
              v ? TileStyle(v) : 'bg-white/40 dark:bg-slate-800/40'
            } ${v >= 100 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}
          >
            {v || ''}
          </div>
        ))}

        {(state.over || state.won) && (
          <div className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-bold text-white">{state.won ? '你赢了！' : '游戏结束'}</p>
            <button onClick={() => setState(newGame())} className="btn-primary">
              再来一局
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
        使用键盘方向键或滑动屏幕，合并相同数字合成 2048
      </p>
    </div>
  )
}