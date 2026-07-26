import { Mail, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon.jsx'

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto section-padding py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* 网站简介 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">TaoTools</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              一站式工具导航与知识分享平台，汇聚实用工具、精选资源、效率软件、AI 技巧与开发知识。
            </p>
          </div>

          {/* 快速链接 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">快速链接</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">首页</Link></li>
              <li><Link to="/tools" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">工具箱</Link></li>
              <li><Link to="/resources" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">资源库</Link></li>
              <li><Link to="/knowledge" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">知识库</Link></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">联系方式</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="https://github.com/TaotaoByte"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Icon name="Github" className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="mailto:hello@taotools.dev"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@taotools.dev
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-500">
              <p>备案信息占位</p>
              <p>友情链接占位</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-500">
          <p>© 2025 TaoTools. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by TaoTools
          </p>
        </div>
      </div>
    </footer>
  )
}
