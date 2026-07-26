import { useState } from 'react'

export default function WordCountTool() {
  const [text, setText] = useState('')

  const stats = {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    chinese: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
    words: (text.match(/[a-zA-Z]+/g) || []).length,
    lines: text === '' ? 0 : text.split('\n').length,
    paragraphs: text === '' ? 0 : text.split(/\n\s*\n/).filter(Boolean).length,
  }

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在此输入或粘贴文本..."
        className="w-full h-64 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.chars}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">总字符数</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.charsNoSpace}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">不含空格</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.chinese}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">中文字数</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.words}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">英文单词</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lines}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">行数</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.paragraphs}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">段落数</div>
        </div>
      </div>
    </div>
  )
}
