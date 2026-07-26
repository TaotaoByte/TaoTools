#!/usr/bin/env node

/**
 * 交互式添加工具、资源或软件到对应 JSON 数据文件。
 *
 * 用法：
 *   node scripts/add-item.cjs
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'data')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve))
}

function kebabCase(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function addTool() {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tools.json'), 'utf-8'))
  const categories = data.categories.filter((c) => c.id !== 'all')

  const name = await ask('工具名称：')
  const id = await ask(`工具 ID（回车使用 ${kebabCase(name)}）：`) || kebabCase(name)
  const description = await ask('工具描述：')
  console.log('可选分类：', categories.map((c) => `${c.id}=${c.name}`).join(', '))
  const category = await ask('分类 ID：')
  const type = await ask('类型（internal 内置 / external 外部，默认 external）：') || 'external'
  const component = type === 'internal' ? await ask('组件名（如 JsonTool）：') : ''
  const url = type === 'external' ? await ask('外部链接：') : ''
  const icon = await ask('Lucide 图标名（如 Wrench）：') || 'Wrench'

  const newItem = {
    id,
    name,
    description,
    category,
    type,
    icon,
  }
  if (component) newItem.component = component
  if (url) newItem.url = url

  data.items.push(newItem)
  fs.writeFileSync(path.join(DATA_DIR, 'tools.json'), JSON.stringify(data, null, 2) + '\n')
  console.log(`✅ 已添加工具「${name}」到 tools.json`)
}

async function addResource() {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'resources.json'), 'utf-8'))
  const categories = data.categories.filter((c) => c.id !== 'all')

  const name = await ask('资源名称：')
  const id = await ask(`资源 ID（回车使用 ${kebabCase(name)}）：`) || kebabCase(name)
  const description = await ask('资源描述：')
  console.log('可选分类：', categories.map((c) => `${c.id}=${c.name}`).join(', '))
  const category = await ask('分类 ID：')
  const url = await ask('资源链接：')
  const tagsInput = await ask('标签（用逗号分隔，如 免费,设计）：')
  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
  const icon = await ask('Lucide 图标名（如 Figma）：') || 'ExternalLink'

  data.items.push({
    id,
    name,
    description,
    category,
    url,
    tags,
    icon,
  })

  fs.writeFileSync(path.join(DATA_DIR, 'resources.json'), JSON.stringify(data, null, 2) + '\n')
  console.log(`✅ 已添加资源「${name}」到 resources.json`)
}

async function addSoftware() {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'software.json'), 'utf-8'))
  const categories = data.categories.filter((c) => c.id !== 'all')

  const name = await ask('软件名称：')
  const id = await ask(`软件 ID（回车使用 ${kebabCase(name)}）：`) || kebabCase(name)
  const description = await ask('软件描述：')
  console.log('可选分类：', categories.map((c) => `${c.id}=${c.name}`).join(', '))
  const category = await ask('分类 ID：')
  const platformsInput = await ask('支持平台（用逗号分隔，如 Win,Mac,Linux）：')
  const platforms = platformsInput.split(',').map((p) => p.trim()).filter(Boolean)
  const price = await ask('价格标签（如 免费 / 开源 / 免费版 / 付费）：') || '免费'
  const url = await ask('官网链接：')
  const icon = await ask('Lucide 图标名（如 Code）：') || 'Download'

  data.items.push({
    id,
    name,
    description,
    category,
    platforms,
    price,
    url,
    icon,
  })

  fs.writeFileSync(path.join(DATA_DIR, 'software.json'), JSON.stringify(data, null, 2) + '\n')
  console.log(`✅ 已添加软件「${name}」到 software.json`)
}

async function addArticle() {
  const type = await ask('文章类型（knowledge 知识库 / ai AI教学）：')
  const title = await ask('文章标题：')
  const slug = await ask(`文章 slug（回车使用 ${kebabCase(title)}）：`) || kebabCase(title)
  const category = await ask('分类 ID：')
  const cover = await ask('封面图路径（如 /covers/example.jpg，可回车跳过）：')
  const summary = await ask('文章摘要：')
  const date = await ask('发布日期（如 2025-01-01）：')
  const readTime = await ask('阅读时间（如 5 分钟）：')
  const tagsInput = await ask('标签（用逗号分隔，可回车跳过）：')
  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)

  const dir = path.join(ROOT, 'public', 'articles', type)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const lines = [
    '---',
    `id: ${slug}`,
    `slug: ${slug}`,
    `title: ${title}`,
    `category: ${category}`,
  ]
  if (cover) lines.push(`cover: ${cover}`)
  lines.push(`summary: ${summary}`)
  lines.push(`date: ${date}`)
  lines.push(`readTime: ${readTime}`)
  if (tags.length > 0) {
    lines.push('tags:')
    tags.forEach((tag) => lines.push(`  - ${tag}`))
  }
  lines.push('---')
  lines.push('')
  lines.push(`# ${title}`)
  lines.push('')
  lines.push('在这里开始写文章正文...')
  lines.push('')

  fs.writeFileSync(path.join(dir, `${slug}.md`), lines.join('\n'))
  console.log(`✅ 已创建文章 ${path.join(dir, `${slug}.md`)}`)
  console.log('📝 请编辑该 Markdown 文件，然后运行 node scripts/build-data.cjs 生成数据')
}

async function main() {
  console.log('请选择要添加的类型：')
  console.log('  1. tool    - 工具')
  console.log('  2. resource - 资源')
  console.log('  3. software - 软件')
  console.log('  4. article  - 文章')
  const type = await ask('输入类型（tool/resource/software/article）：')

  switch (type.trim()) {
    case 'tool':
    case '1':
      await addTool()
      break
    case 'resource':
    case '2':
      await addResource()
      break
    case 'software':
    case '3':
      await addSoftware()
      break
    case 'article':
    case '4':
      await addArticle()
      break
    default:
      console.log('❌ 未知类型')
  }

  rl.close()
}

main().catch((err) => {
  console.error(err)
  rl.close()
  process.exit(1)
})
