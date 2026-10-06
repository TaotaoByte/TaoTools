import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../components/Card.jsx'

const links = [
  { to: '/', label: '首页', desc: '站点总览' },
  { to: '/tools', label: '工具箱', desc: '在浏览器本地运行的小工具' },
  { to: '/ai', label: 'AI 榜单', desc: '每周自动同步的模型排名' },
  { to: '/knowledge', label: '技术笔记', desc: 'Markdown、部署与开发笔记' },
]

/**
 * 兜底路由。原来 Routes 里没有 path="*"，访问不存在的地址会渲染出一个
 * 只有顶栏和页脚的空页面，用户不知道发生了什么。
 */
export default function NotFound() {
  return (
    <div className="page-container">
      <p className="label-mono">404</p>
      <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
        这个页面不存在
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
        地址可能拼错了，或者这个页面已经被移除。下面几个入口也许能找到你要的东西。
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="group block">
            <Card className="p-4 h-full">
              <span className="text-[15px] font-medium text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                {l.label}
              </span>
              <span className="mt-1 block text-[13px] text-slate-500 dark:text-slate-400">
                {l.desc}
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}
