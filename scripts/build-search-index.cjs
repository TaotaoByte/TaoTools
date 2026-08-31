#!/usr/bin/env node

/**
 * 从 tools / resources / software / knowledge / aiTutorials 五个数据文件
 * 生成轻量化站内搜索索引（仅保留检索所需元数据，不包含文章正文）。
 *
 * 用法：
 *   node scripts/build-search-index.cjs
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'data')

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf-8'))
}

function categoryName(data, id) {
  const cat = (data.categories || []).find((c) => c.id === id)
  return cat ? cat.name : ''
}

function build() {
  const tools = read('tools.json')
  const resources = read('resources.json')
  const software = read('software.json')
  const knowledge = read('knowledge.json')
  const aiTutorials = read('aiTutorials.json')

  const index = []

  // 工具
  tools.items.forEach((t) => {
    index.push({
      type: 'tool',
      id: t.id,
      title: t.name,
      description: t.description || '',
      category: categoryName(tools, t.category),
      tags: [],
      icon: t.icon || 'Wrench',
      link: t.type === 'external' ? t.url : `/tools?tool=${t.id}`,
      external: t.type === 'external',
    })
  })

  // 资源
  resources.items.forEach((r) => {
    index.push({
      type: 'resource',
      id: r.id,
      title: r.name,
      description: r.description || '',
      category: categoryName(resources, r.category),
      tags: r.tags || [],
      icon: r.icon || 'Globe',
      link: r.url,
      external: true,
    })
  })

  // 软件
  software.items.forEach((s) => {
    index.push({
      type: 'software',
      id: s.id,
      title: s.name,
      description: s.description || '',
      category: categoryName(software, s.category),
      tags: s.platforms || [],
      icon: s.icon || 'Download',
      link: s.url,
      external: true,
    })
  })

  // 知识库文章
  knowledge.items.forEach((k) => {
    index.push({
      type: 'knowledge',
      id: k.id,
      title: k.title,
      description: k.summary || '',
      category: categoryName(knowledge, k.category),
      tags: k.tags || [],
      icon: 'BookOpen',
      link: `/knowledge/${k.slug}`,
      external: false,
    })
  })

  // AI 教程
  aiTutorials.items.forEach((a) => {
    index.push({
      type: 'ai',
      id: a.id,
      title: a.title,
      description: a.summary || '',
      category: 'AI 教程',
      tags: a.tags || [],
      icon: 'Sparkles',
      link: `/ai/tutorials/${a.slug}`,
      external: false,
    })
  })

  const output =
    '// 本文件由 scripts/build-search-index.cjs 自动生成，请勿手动修改。\n' +
    `export default ${JSON.stringify(index, null, 2)}\n`

  fs.writeFileSync(path.join(DATA_DIR, 'searchIndex.js'), output)
  console.log(`✅ 已生成 searchIndex.js，共 ${index.length} 条索引`)
}

build()