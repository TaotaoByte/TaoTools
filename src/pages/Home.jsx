import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowUpRight, ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '../components/Icon.jsx'
import { Card } from '../components/Card.jsx'
import toolsData from '../data/tools.json'
import knowledgeData from '../data/knowledge.json'
import categoriesData from '../data/categories.json'

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const tools = toolsData.items.filter(t => t.featured).slice(0, 6)
  const notes = [...knowledgeData.items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  return (
    <div className="home-workbench">
      <section className="workbench-hero max-w-6xl mx-auto section-padding">
        <div className="hero-copy">
          <p className="eyebrow"><span /> TAO'S DIGITAL WORKBENCH</p>
          <h1>把琐事交给工具，<br /><span>把时间留给创造。</span></h1>
          <p className="hero-description">写代码、处理文件、找一份好资源。<br />这是我的日常工具台，也希望能帮上你的忙。</p>
          <form className="hero-search" onSubmit={e => { e.preventDefault(); navigate(`/tools?q=${encodeURIComponent(query.trim())}`) }}>
            <Search size={20} aria-hidden="true" />
            <input aria-label="搜索工具" value={query} onChange={e => setQuery(e.target.value)} placeholder="试试 JSON、图片压缩、时间戳…" />
            <button type="submit" aria-label="开始搜索"><ArrowRight size={20} /></button>
          </form>
          <div className="hero-popular">常用 <Link to="/tools?tool=json-tool">JSON 格式化</Link><Link to="/tools?tool=image-compress">图片压缩</Link><Link to="/tools?tool=timestamp">时间戳</Link></div>
        </div>
        <aside className="desk-panel" aria-label="工具速用">
          <div className="desk-panel-top"><span>随手可用</span><span className="label-mono">QUICK ACCESS / 01</span></div>
          <Link className="desk-feature" to="/tools?tool=image-compress">
            <div className="desk-file"><Icon name="Image" className="w-8 h-8" /><span>IMAGE</span></div>
            <div><span className="eyebrow">新增工具</span><h2>给图片减减重。</h2><p>调整尺寸、压缩体积，本地完成。</p></div>
            <ArrowUpRight size={22} className="desk-arrow" />
          </Link>
          <div className="desk-shortcuts">
            {[['json-tool', 'Braces', '整理 JSON', '让数据清楚一点'], ['text-diff', 'GitCompare', '对比文本', '改了哪里，一眼看见']].map(([id, icon, title, sub]) => <Link key={id} to={`/tools?tool=${id}`}><Icon name={icon} className="w-5 h-5" /><strong>{title}</strong><small>{sub}</small><ArrowUpRight size={16} /></Link>)}
          </div>
          <p className="desk-foot"><ShieldCheck size={14} /> 内置工具在浏览器内处理数据</p>
        </aside>
      </section>
      <div className="workbench-directory"><div className="max-w-6xl mx-auto section-padding directory-inner"><span className="label-mono">EXPLORE</span>{categoriesData.homeCards.filter(c => c.link?.startsWith('/')).map(c => <Link key={c.id} to={c.link}><Icon name={c.icon} className="w-4 h-4" />{c.title}<ArrowUpRight size={13} /></Link>)}</div></div>
      <div className="max-w-6xl mx-auto section-padding py-12 sm:py-16 space-y-16">
        <section>
          <div className="workbench-heading"><div><p className="eyebrow">THE ESSENTIALS</p><h2>少一点折腾，多一点顺手。</h2><p>无需安装，打开就能开始。</p></div><Link to="/tools">全部 {toolsData.items.length} 个工具 <ArrowRight size={16} /></Link></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{tools.map((tool, i) => <Link className="group h-full" key={tool.id} to={`/tools?tool=${tool.id}`}><Card className="essential-card h-full"><div className={`tool-glyph ${['tone-0', 'tone-1', 'tone-2'][i % 3]}`}><Icon name={tool.icon} className="w-5 h-5" /></div><ArrowUpRight className="essential-arrow w-4 h-4" /><h3>{tool.name}</h3><p>{tool.description}</p><span className="essential-meta">浏览器本地运行 <span>打开工具 →</span></span></Card></Link>)}</div>
        </section>
        <section>
          <div className="workbench-heading"><div><p className="eyebrow">FIELD NOTES</p><h2>做过的事，记下来。</h2><p>开发笔记、排错过程，还有一些实用方法。</p></div><Link to="/knowledge">阅读笔记 <ArrowRight size={16} /></Link></div>
          <div className="notes-list">{notes.map((note, i) => <Link to={`/knowledge/${note.slug}`} key={note.id}><span className="note-number">0{i + 1}</span><div><span className="label-mono">{note.date} / {note.readTime}</span><h3>{note.title}</h3><p>{note.summary}</p></div><ArrowUpRight size={20} /></Link>)}</div>
        </section>
        <section className="workbench-bottom"><div><p className="eyebrow">A SMALL COLLECTION, KEPT WITH CARE</p><h2>工具之外，也有好东西。</h2><p>把值得留住的软件、资源和学习资料放在一起。</p></div><Link to="/resources" className="btn-primary">逛逛资源库 <ArrowUpRight size={16} /></Link></section>
      </div>
    </div>
  )
}
