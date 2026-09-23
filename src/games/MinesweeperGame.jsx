import { useState, useCallback } from 'react'
import { Bomb, Flag } from 'lucide-react'

const DIFFICULTIES = {
  easy: { label: '简单', rows: 9, cols: 9, mines: 10 },
  medium: { label: '中等', rows: 16, cols: 16, mines: 40 },
}

function initBoard(rows, cols, mines) {
  const cells = Array.from({ length: rows * cols }, () => ({
    isMine: false,
    count: 0,
    revealed: false,
    flagged: false,
  }))
  // 布雷
  let placed = 0
  while (placed < mines) {
    const idx = Math.floor(Math.random() * cells.length)
    if (!cells[idx].isMine) {
      cells[idx].isMine = true
      placed++
    }
  }
  // 计算周围地雷数
  const getNeighbors = (i) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    const out = []
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc)
      }
    }
    return out
  }
  cells.forEach((cell, i) => {
    if (cell.isMine) return
    cell.count = getNeighbors(i).filter((n) => cells[n].isMine).length
  })
  return { cells, rows, cols, mines }
}

function clone(cells) {
  const next = cells.map((c) => ({ ...c }))
  return next
}

export default function MinesweeperGame() {
  const [diff, setDiff] = useState('easy')
  const buildNew = (d = diff) =>
    initBoard(DIFFICULTIES[d].rows, DIFFICULTIES[d].cols, DIFFICULTIES[d].mines)
  const [board, setBoard] = useState(() => buildNew('easy'))
  const [status, setStatus] = useState('playing') // playing | won | lost

  const cells = board.cells
  const { rows, cols } = board
  const diffInfo = DIFFICULTIES[diff]

  const reveal = useCallback((idx) => {
    setBoard((prev) => {
      if (status !== 'playing') return prev
      const next = clone(prev.cells)
      const target = next[idx]
      if (target.revealed || target.flagged) return prev
      if (target.isMine) {
        next.forEach((c) => { if (c.isMine) c.revealed = true })
        setStatus('lost')
        return { ...prev, cells: next }
      }
      // 洪水填充
      const stack = [idx]
      while (stack.length) {
        const i = stack.pop()
        const cell = next[i]
        if (cell.revealed || cell.flagged) continue
        cell.revealed = true
        if (cell.count === 0 && !cell.isMine) {
          const r = Math.floor(i / cols)
          const c = i % cols
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) stack.push(nr * cols + nc)
            }
          }
        }
      }
      // 判断是否获胜
      const safeRevealed = next.filter((c) => !c.isMine && c.revealed).length
      const totalSafe = rows * cols - prev.mines
      let won = safeRevealed === totalSafe
      if (won) {
        next.forEach((c) => { if (c.isMine) c.flagged = true })
        setStatus('won')
      }
      return { ...prev, cells: next }
    })
  }, [status, cols, rows])

  const toggleFlag = useCallback(
    (e, idx) => {
      e.preventDefault()
      setBoard((prev) => {
        if (status !== 'playing') return prev
        const next = clone(prev.cells)
        const target = next[idx]
        if (target.revealed) return prev
        target.flagged = !target.flagged
        return { ...prev, cells: next }
      })
    },
    [status]
  )

  const flagsLeft = board.mines - cells.filter((c) => c.flagged).length
  const numBase = Math.max(cols * rows, 100)
  const fontSize = numBase >= 400 ? 'text-[9px] sm:text-[10px]' : numBase >= 200 ? 'text-[11px] sm:text-xs' : 'text-sm'

  const cellSizeClass =
    numBase >= 400 ? '' : 'aspect-square'

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {Object.entries(DIFFICULTIES).map(([id, d]) => (
            <button
              key={id}
              onClick={() => {
                setDiff(id)
                setBoard(buildNew(id))
                setStatus('playing')
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                diff === id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">剩余: {flagsLeft}</span>
          <button
            onClick={() => { setBoard(buildNew()); setStatus('playing') }}
            className="btn-primary text-sm px-4 py-2"
          >
            重开
          </button>
        </div>
      </div>

      <div
        className="grid gap-1 bg-slate-300 dark:bg-slate-700 rounded-2xl p-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cells.map((cell, i) => {
          let content = null
          let cls = 'bg-white dark:bg-slate-800'
          if (cell.revealed) {
            if (cell.isMine) {
              cls = 'bg-red-100 dark:bg-red-900/40'
            } else if (cell.count > 0) {
              content = cell.count
              cls = 'bg-slate-100 dark:bg-slate-700'
            } else {
              cls = 'bg-slate-100 dark:bg-slate-700'
            }
          } else if (cell.flagged) {
            cls = 'bg-amber-50 dark:bg-amber-900/30'
          }
          const colorMap = { 1: 'text-blue-600', 2: 'text-emerald-600', 3: 'text-red-600', 4: 'text-indigo-600', 5: 'text-amber-600', 6: 'text-cyan-600', 7: 'text-slate-600', 8: 'text-slate-500' }
          return (
            <button
              key={i}
              onClick={() => reveal(i)}
              onContextMenu={(e) => toggleFlag(e, i)}
              className={`${cls} ${cellSizeClass} rounded-md font-bold ${fontSize} ${colorMap[cell.count] || ''} select-none flex items-center justify-center`}
              style={{ aspectRatio: '1/1' }}
            >
              {content || (cell.revealed && cell.isMine ? <Bomb className="w-4 h-4 text-red-600" /> : cell.flagged ? <Flag className="w-3 h-3 text-amber-500" /> : null)}
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
        左键翻开，右键插旗标记地雷
      </p>
    </div>
  )
}