import { useMemo, useState } from 'react'

function uuidV4() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export default function UuidTool() {
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [noHyphen, setNoHyphen] = useState(false)
  const [uuids, setUuids] = useState([])

  const generate = () => {
    const list = []
    for (let i = 0; i < count; i++) {
      let u = uuidV4()
      if (noHyphen) u = u.replace(/-/g, '')
      if (uppercase) u = u.toUpperCase()
      list.push(u)
    }
    setUuids(list)
  }

  const text = useMemo(() => uuids.join('\n'), [uuids])

  const copyAll = () => {
    if (text) navigator.clipboard.writeText(text)
  }

  const copyOne = (u) => {
    navigator.clipboard.writeText(u)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-700 dark:text-slate-300">数量：</label>
        <input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          className="w-24 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <label className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 ml-2 cursor-pointer">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
          大写
        </label>
        <label className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={noHyphen} onChange={(e) => setNoHyphen(e.target.checked)} />
          无连字符
        </label>
        <button onClick={generate} className="btn-primary text-sm py-2 px-4 ml-2">生成</button>
      </div>

      {uuids.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">结果</label>
            <button onClick={copyAll} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              复制全部
            </button>
          </div>
          <ul className="space-y-2">
            {uuids.map((u, i) => (
              <li
                key={i}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50"
              >
                <code className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{u}</code>
                <button
                  onClick={() => copyOne(u)}
                  className="shrink-0 text-xs text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  复制
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}