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
  const raw = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content
  // 统一换行符。Windows 上（或 core.autocrlf=true 时 git 检出）markdown 会是 CRLF，
  // 而 JS 正则里的 . 不匹配 \r，导致 /^(\w+):\s*(.*)$/ 这类行根本匹配不上：
  // frontmatter 会整段静默失效，标题变成「未命名文章」、封面被清空、日期丢失。
  const clean = raw.replace(/\r\n?/g, '\n')
  const match = clean.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: clean }

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

function scanArticles(type, previousCoverBySlug = new Map()) {
  const dir = path.join(ARTICLES_DIR, type)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(dir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { meta, body } = parseFrontmatter(raw)
      const id = meta.id || path.basename(file, '.md')

      // 封面兜底：frontmatter 里没写 cover 时，沿用上一次生成的结果。
      // 否则只要有人漏写 cover，重新生成就会把已有封面清空（曾经真的发生过：
      // ssh-github-setup / regex-cheatsheet / devtools-tips 三篇的封面被抹掉）。
      let cover = meta.cover || ''
      if (!cover && previousCoverBySlug.has(id)) {
        cover = previousCoverBySlug.get(id)
        console.warn(
          `⚠️  ${file} 的 frontmatter 没有 cover 字段，沿用上次生成的封面：${cover}`,
        )
      }

      return {
        id,
        slug: meta.slug || id,
        title: meta.title || '未命名文章',
        category: meta.category || 'other',
        cover,
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

/** 读取已生成的数据文件，取出 slug → cover 映射，供封面兜底使用 */
function readPreviousCovers(fileName) {
  const map = new Map()
  try {
    const prev = JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), 'utf-8'))
    ;(prev.items || []).forEach((it) => {
      if (it.slug && it.cover) map.set(it.slug, it.cover)
    })
  } catch {
    // 首次生成时文件还不存在，正常
  }
  return map
}

function buildKnowledge() {
  const existing = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knowledge.json'), 'utf-8'))
  const items = scanArticles('knowledge', readPreviousCovers('knowledge.json'))

  const output = {
    categories: existing.categories,
    items,
  }

  fs.writeFileSync(path.join(DATA_DIR, 'knowledge.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(`✅ 已生成 knowledge.json，共 ${items.length} 篇文章`)
}

function buildAiTutorials() {
  const items = scanArticles('ai', readPreviousCovers('aiTutorials.json'))

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
