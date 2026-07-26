import { useState } from 'react'

export default function TimestampTool() {
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)))
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '))

  const timestampToDate = () => {
    const ts = parseInt(timestamp, 10)
    if (isNaN(ts)) return
    const date = new Date(ts.toString().length > 10 ? ts : ts * 1000)
    setDateStr(date.toISOString().slice(0, 19).replace('T', ' '))
  }

  const dateToTimestamp = () => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return
    setTimestamp(String(Math.floor(date.getTime() / 1000)))
  }

  const setNow = () => {
    const now = new Date()
    setTimestamp(String(Math.floor(now.getTime() / 1000)))
    setDateStr(now.toISOString().slice(0, 19).replace('T', ' '))
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={setNow} className="btn-secondary text-sm py-2 px-4">获取当前时间</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unix 时间戳（秒）</label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button onClick={timestampToDate} className="btn-primary text-sm py-2 px-4 w-full">转换为日期 →</button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">日期时间</label>
          <input
            type="text"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            placeholder="YYYY-MM-DD HH:mm:ss"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button onClick={dateToTimestamp} className="btn-primary text-sm py-2 px-4 w-full">← 转换为时间戳</button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
        <p>当前时间戳：{Math.floor(Date.now() / 1000)}</p>
        <p>当前时间：{new Date().toLocaleString('zh-CN')}</p>
      </div>
    </div>
  )
}
