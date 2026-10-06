import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

/** GitHub 品牌标记。lucide-react 已移除品牌图标，这里直接内联官方 path。 */
function GithubMark({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

const groups = [
  {
    title: '站点',
    links: [
      { to: '/', label: '首页' },
      { to: '/tools', label: '工具箱' },
      { to: '/ai', label: 'AI 模型榜单' },
      { to: '/knowledge', label: '技术笔记' },
    ],
  },
  {
    title: '更多',
    links: [
      { to: '/resources', label: '资源库' },
      { to: '/software', label: '软件推荐' },
      { to: '/games', label: '小游戏' },
      { to: '/favorites', label: '我的收藏' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
      <div className="max-w-6xl mx-auto section-padding py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="" className="w-6 h-6" />
              <span className="font-semibold tracking-tight text-slate-900 dark:text-white">TaoTools</span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              一个放在浏览器里的开发者工具箱：编解码、正则、时间戳、二维码等常用小工具全部本地运行，
              另附 AI 模型榜单与技术笔记。
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="label-mono mb-3">{g.title}</h3>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-[13px] text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-500">
            <span>© {new Date().getFullYear()} TaoTools</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              陕ICP备2026020064号
            </a>
            <a
              href="https://www.taotaobyte.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              友链 taotaobyte.cn
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://github.com/TaotaoByte"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <GithubMark className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="mailto:2042184732@qq.com"
              className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              邮箱
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
