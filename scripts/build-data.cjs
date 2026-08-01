#!/usr/bin/env node

/**
 * 自动扫描 public/articles 下的 Markdown 文件，
 * 读取 frontmatter 与正文，生成 src/data 下的 JSON 数据文件。
 *
 * 用法：
 *   node scripts/build-data.cjs
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ARTICLES_DIR = path.join(ROOT, 'public', 'articles')
const DATA_DIR = path.join(ROOT, 'src', 'data')

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  const metaText = match[1]
  const body = match[2]
  const meta = {}

  metaText.split('\n').forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return

    // 数组格式：tags:
    //   - value
    const listMatch = line.match(/^(\w+):\s*$/)
    if (listMatch) {
      meta[listMatch[1]] = []
      return
    }

    const itemMatch = line.match(/^\s+-\s+(.+)$/)
    if (itemMatch) {
      const lastKey = Object.keys(meta).pop()
      if (lastKey && Array.isArray(meta[lastKey])) {
        meta[lastKey].push(itemMatch[1])
      }
      return
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1]
      let value = kvMatch[2].trim()
      if (value === 'true') value = true
      else if (value === 'false') value = false
      else if (/^\d+$/.test(value)) value = Number(value)
      meta[key] = value
    }
  })

  return { meta, body }
}

function scanArticles(type) {
  const dir = path.join(ARTICLES_DIR, type)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(dir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { meta, body } = parseFrontmatter(raw)

      return {
        id: meta.id || path.basename(file, '.md'),
        slug: meta.slug || meta.id || path.basename(file, '.md'),
        title: meta.title || '未命名文章',
        category: meta.category || 'other',
        cover: meta.cover || '',
        summary: meta.summary || '',
        date: meta.date || '',
        readTime: meta.readTime || '',
        order: meta.order === undefined ? 9999 : Number(meta.order),
        tags: meta.tags || [],
        likes: meta.likes === undefined ? 10 : Number(meta.likes),
        content: body.trim(),
      }
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return new Date(a.date || 0) - new Date(b.date || 0)
    })
}

function buildKnowledge() {
  const existing = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knowledge.json'), 'utf-8'))
  const items = scanArticles('knowledge')

  const output = {
    categories: existing.categories,
    items,
  }

  fs.writeFileSync(path.join(DATA_DIR, 'knowledge.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(`✅ 已生成 knowledge.json，共 ${items.length} 篇文章`)
}

function buildAiTutorials() {
  const items = scanArticles('ai')

  const output = {
    items,
  }

  fs.writeFileSync(path.join(DATA_DIR, 'aiTutorials.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(`✅ 已生成 aiTutorials.json，共 ${items.length} 篇文章`)
}

function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  buildKnowledge()
  buildAiTutorials()
}

main()
