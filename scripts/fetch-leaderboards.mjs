#!/usr/bin/env node
/**
 * 抓取权威 AI 大模型榜单，生成 src/data/leaderboards.json。
 *
 * 设计原则：
 *  1. 任何单个源失败都不能让脚本失败 —— 失败时沿用上一次的缓存，并标记 stale。
 *  2. 每个源都做结构校验，字段缺失就丢弃该源，不要写坏数据。
 *  3. 输出体积受控：每个榜单只保留前 `TOP_N` 名。
 *  4. 网络环境差异（部分网络按 TLS SNI 阻断 huggingface.co / raw.githubusercontent.com）
 *     通过「官方地址优先、镜像回退」处理，因此本脚本在 GitHub Actions 和国内都能跑。
 *
 * 用法：
 *   node scripts/fetch-leaderboards.mjs            # 正常抓取
 *   node scripts/fetch-leaderboards.mjs --dry-run  # 只抓取并打印摘要，不写文件
 *   node scripts/fetch-leaderboards.mjs --only=lmarena
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_FILE = path.join(ROOT, 'src', 'data', 'leaderboards.json')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const TOP_N = 30
const TIMEOUT_MS = 45_000

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const ONLY = (argv.find((a) => a.startsWith('--only=')) || '').slice(7) || null

/* ────────────────────────── 工具函数 ────────────────────────── */

const log = (...a) => console.log(...a)

async function httpGet(url, { accept = '*/*', as = 'text' } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: accept },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  if (as === 'json') return { data: await res.json(), res }
  if (as === 'buffer') return { data: Buffer.from(await res.arrayBuffer()), res }
  return { data: await res.text(), res }
}

/** 依次尝试多个地址，返回第一个成功的 */
async function httpGetAny(urls, opts) {
  const errors = []
  for (const url of urls) {
    try {
      const out = await httpGet(url, opts)
      return { ...out, url }
    } catch (e) {
      errors.push(`${new URL(url).host}: ${e.message}`)
    }
  }
  throw new Error(errors.join(' | '))
}

/* ────────────────────────── 模型名规范化 ────────────────────────── */

const VENDOR_CN = {
  google: 'Google',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  xai: 'xAI',
  deepseek: 'DeepSeek',
  deepseekai: 'DeepSeek',
  moonshot: '月之暗面',
  moonshotai: '月之暗面',
  alibaba: '阿里巴巴',
  qwen: '阿里巴巴',
  meta: 'Meta',
  'meta-llama': 'Meta',
  mistral: 'Mistral',
  mistralai: 'Mistral',
  zai: '智谱 AI',
  'z-ai': '智谱 AI',
  thudm: '智谱 AI',
  minimax: 'MiniMax',
  baidu: '百度',
  bytedance: '字节跳动',
  doubao: '字节跳动',
  tencent: '腾讯',
  hunyuan: '腾讯',
  stepfun: '阶跃星辰',
  '01ai': '零一万物',
  yi: '零一万物',
  xiaomi: '小米',
  inclusionai: 'InclusionAI',
  spacexai: 'SpaceXAI',
  kimi: '月之暗面',
  zhipu: '智谱 AI',
  amazon: 'Amazon',
  microsoft: 'Microsoft',
  nvidia: 'NVIDIA',
  cohere: 'Cohere',
  ai21: 'AI21 Labs',
  perplexity: 'Perplexity',
  reka: 'Reka AI',
  nousresearch: 'Nous Research',
  allenai: 'Allen AI',
  ibm: 'IBM',
  lg: 'LG',
  upstage: 'Upstage',
  naver: 'NAVER',
}

function vendorLabel(raw) {
  if (!raw) return ''
  const key = String(raw).toLowerCase().replace(/[\s._-]/g, '')
  return VENDOR_CN[key] || String(raw)
}

/** `gemini-4-argon-high` → `Gemini 4 Argon High`；`claude-opus-4-5` → `Claude Opus 4.5` */
function prettyModelName(slug) {
  if (!slug) return ''
  const s = String(slug)
  if (/\s/.test(s)) {
    // 已含空格的名字只做大小写清洗，避免二次破坏
    return s.replace(/\((xhigh|xHigh|XHigh)\)/gi, '(Xhigh)')
  }
  const up = {
    gpt: 'GPT', llm: 'LLM', ai: 'AI', moe: 'MoE', oss: 'OSS', glm: 'GLM',
    deepseek: 'DeepSeek', vl: 'VL', it: 'IT', max: 'Max', pro: 'Pro',
  }
  const parts = s.split(/[-_/]/).filter(Boolean)
  const out = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    // 版本号：把相邻的两个纯数字合并成 x.y（4-5 → 4.5），但最多并两位，
    // 避免把日期（20251101）也并进来
    if (/^\d{1,2}$/.test(part) && /^\d{1,2}$/.test(parts[i + 1] || '')) {
      out.push(`${part}.${parts[i + 1]}`)
      i++
      continue
    }
    if (up[part.toLowerCase()]) {
      out.push(up[part.toLowerCase()])
    } else if (/^\d/.test(part)) {
      out.push(part)
    } else {
      out.push(part.charAt(0).toUpperCase() + part.slice(1))
    }
  }
  return out.join(' ')
}

/** 去掉 OpenRouter 的厂商前缀 "Anthropic: Claude Opus 5.5" 与 (batch) 之类的重复变体 */
function stripVendorPrefix(name) {
  return String(name).replace(/^[^:]{2,24}:\s*/, '')
}
function dedupeKey(name) {
  return stripVendorPrefix(name)
    .toLowerCase()
    .replace(/\((batch|free|beta|preview|default fallback)\)/g, '')
    .replace(/[^a-z0-9.]+/g, '')
}

/* ────────────────────────── 各数据源 ────────────────────────── */

/** 1. LMArena（原 Chatbot Arena）官方 Elo 榜，数据托管在 HuggingFace 数据集 */
async function fetchLMArena() {
  const { parquetReadObjects } = await import('hyparquet')
  const { data, url } = await httpGetAny(
    [
      'https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/resolve/main/text/latest-00000-of-00001.parquet',
      // 国内网络若 huggingface.co 被 SNI 阻断，走镜像
      'https://hf-mirror.com/datasets/lmarena-ai/leaderboard-dataset/resolve/main/text/latest-00000-of-00001.parquet',
    ],
    { accept: 'application/octet-stream', as: 'buffer' },
  )
  log(`   下载 parquet (${(data.length / 1024).toFixed(0)} KB) ← ${new URL(url).host}`)

  const rows = await parquetReadObjects({ file: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) })
  if (!Array.isArray(rows) || !rows.length) throw new Error('parquet 解析结果为空')
  const sample = rows[0]
  for (const f of ['model_name', 'rating', 'category']) {
    if (!(f in sample)) throw new Error(`缺少字段 ${f}，数据结构可能已变化`)
  }

  const published = rows.find((r) => r.leaderboard_publish_date)?.leaderboard_publish_date || null

  const build = (category) => {
    const list = rows
      .filter((r) => r.category === category && Number.isFinite(Number(r.rating)))
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, TOP_N)
      .map((r, i) => ({
        rank: i + 1,
        model: prettyModelName(r.model_name),
        slug: r.model_name,
        vendor: vendorLabel(r.organization),
        score: Number(Number(r.rating).toFixed(1)),
        votes: Number.isFinite(Number(r.vote_count)) ? Math.round(Number(r.vote_count)) : undefined,
        ci: [
          r.rating_lower != null ? Number(Number(r.rating_lower).toFixed(1)) : undefined,
          r.rating_upper != null ? Number(Number(r.rating_upper).toFixed(1)) : undefined,
        ].filter((v) => v !== undefined),
      }))
    return list.length ? list : null
  }

  const out = []
  const overall = build('overall')
  const chinese = build('chinese')
  const coding = build('coding')
  const totalRows = rows.filter((r) => r.category === 'overall').length

  if (overall) {
    out.push({
      id: 'lmarena-overall',
      name: '综合能力（总榜）',
      publisher: 'LMArena · 原 Chatbot Arena',
      metric: 'Elo 评分',
      metricHint: '由真人盲测两两对战投票得出，分数越高越强；票数越多越可靠。',
      url: 'https://lmarena.ai/leaderboard',
      license: 'CC BY 4.0',
      updatedAt: published,
      sampleSize: totalRows,
      ranked: overall,
    })
  }
  if (chinese) {
    out.push({
      id: 'lmarena-chinese',
      name: '中文能力榜',
      publisher: 'LMArena · 原 Chatbot Arena',
      metric: 'Elo 评分',
      metricHint: 'LMArena 官方中文分榜，只统计中文对话对战结果。',
      url: 'https://lmarena.ai/leaderboard',
      license: 'CC BY 4.0',
      updatedAt: published,
      sampleSize: rows.filter((r) => r.category === 'chinese').length,
      ranked: chinese,
    })
  }
  if (coding) {
    out.push({
      id: 'lmarena-coding',
      name: '编程能力榜',
      publisher: 'LMArena · 原 Chatbot Arena',
      metric: 'Elo 评分',
      metricHint: '只统计编程类问题的对战结果。',
      url: 'https://lmarena.ai/leaderboard',
      license: 'CC BY 4.0',
      updatedAt: published,
      sampleSize: rows.filter((r) => r.category === 'coding').length,
      ranked: coding,
    })
  }
  return out
}

/** 2. OpenRouter —— 标准 REST JSON，无需鉴权（最稳的一个源） */
async function fetchOpenRouter() {
  const { data } = await httpGet('https://openrouter.ai/api/v1/models', {
    accept: 'application/json',
    as: 'json',
  })
  const list = Array.isArray(data?.data) ? data.data : []
  if (!list.length) throw new Error('返回结构异常：data 为空')

  const seen = new Set()
  const ranked = list
    .filter((m) => Number.isFinite(m?.benchmarks?.artificial_analysis?.intelligence_index))
    .sort(
      (a, b) =>
        b.benchmarks.artificial_analysis.intelligence_index -
        a.benchmarks.artificial_analysis.intelligence_index,
    )
    .filter((m) => {
      const k = dedupeKey(m.name)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, TOP_N)
    .map((m, i) => {
      const p = m.pricing || {}
      return {
        rank: i + 1,
        model: stripVendorPrefix(m.name),
        slug: m.id,
        vendor: vendorLabel((m.name || '').split(':')[0]) || '',
        score: m.benchmarks.artificial_analysis.intelligence_index,
        context: Number.isFinite(m.context_length) ? m.context_length : undefined,
        priceIn: Number.isFinite(Number(p.prompt)) ? Number(p.prompt) * 1_000_000 : undefined,
        priceOut: Number.isFinite(Number(p.completion)) ? Number(p.completion) * 1_000_000 : undefined,
      }
    })

  return [
    {
      id: 'openrouter-intelligence',
      name: '智能指数榜',
      publisher: 'OpenRouter（透传 Artificial Analysis 指数）',
      metric: 'AA 智能指数',
      metricHint: 'Artificial Analysis 的综合智能指数，覆盖推理、代码、数学等多项评测。',
      url: 'https://openrouter.ai/models?order=intelligence-high-to-low',
      license: '公开 API',
      updatedAt: null,
      sampleSize: ranked.length,
      ranked,
    },
  ]
}

/** 3. Artificial Analysis —— 官网榜单页把数据内嵌在 React Flight 载荷里 */
async function fetchArtificialAnalysis() {
  const { data: html } = await httpGet('https://artificialanalysis.ai/leaderboards/models', {
    accept: 'text/html',
  })

  const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map((m) => m[1])
  if (!pushes.length) throw new Error('页面结构变化：未找到 __next_f 载荷')
  let flight = ''
  for (const p of pushes) {
    try {
      flight += JSON.parse(p)
    } catch {
      /* 忽略无法解析的分片 */
    }
  }

  function sliceBalancedArray(str, start) {
    if (str[start] !== '[') return null
    let depth = 0
    let inStr = false
    let esc = false
    for (let i = start; i < str.length; i++) {
      const c = str[i]
      if (inStr) {
        if (esc) esc = false
        else if (c === '\\') esc = true
        else if (c === '"') inStr = false
        continue
      }
      if (c === '"') inStr = true
      else if (c === '[') depth++
      else if (c === ']') {
        depth--
        if (depth === 0) return str.slice(start, i + 1)
      }
    }
    return null
  }

  let models = null
  let idx = -1
  while ((idx = flight.indexOf('"models":[', idx + 1)) !== -1) {
    const raw = sliceBalancedArray(flight, idx + '"models":'.length)
    if (!raw) continue
    let arr
    try {
      arr = JSON.parse(raw)
    } catch {
      continue // 切片不完整，继续找下一处
    }
    if (Array.isArray(arr) && arr.length && 'intelligenceIndex' in arr[0]) {
      models = arr
      break
    }
  }
  if (!models) throw new Error('未能在载荷中定位含 intelligenceIndex 的 models 数组')

  // 同一模型有 Max / Xhigh / High 等多个推理档位，按模型名去重保留最高分
  const best = new Map()
  for (const m of models) {
    if (!Number.isFinite(m.intelligenceIndex) || !m.name) continue
    const base = m.name.replace(/\s*\((?:Max|Xhigh|High|Medium|Low|Default Fallback|Non-reasoning)[^)]*\)\s*/gi, '').trim()
    const k = dedupeKey(base)
    const prev = best.get(k)
    if (!prev || m.intelligenceIndex > prev.intelligenceIndex) best.set(k, { ...m, baseName: base })
  }

  const ranked = [...best.values()]
    .sort((a, b) => b.intelligenceIndex - a.intelligenceIndex)
    .slice(0, TOP_N)
    .map((m, i) => ({
      rank: i + 1,
      model: m.baseName,
      slug: m.slug,
      vendor: vendorLabel(m.modelCreatorName),
      score: Number(m.intelligenceIndex.toFixed(1)),
      context: Number.isFinite(m.contextWindowTokens) ? m.contextWindowTokens : undefined,
      priceIn: Number.isFinite(m.price1mInputTokens) ? m.price1mInputTokens : undefined,
      priceOut: Number.isFinite(m.price1mOutputTokens) ? m.price1mOutputTokens : undefined,
    }))

  if (!ranked.length) throw new Error('解析后没有任何带分数的模型')

  return [
    {
      id: 'aa-intelligence',
      name: '智能指数榜（去重）',
      publisher: 'Artificial Analysis',
      metric: 'Intelligence Index',
      metricHint: 'Artificial Analysis 官方智能指数。同一模型的多个推理档位已合并，保留最高分。',
      url: 'https://artificialanalysis.ai/leaderboards/models',
      license: '公开页面数据',
      updatedAt: null, // 官方未提供更新时间
      sampleSize: ranked.length,
      ranked,
    },
  ]
}

/** 4. SWE-bench —— 首页内嵌 JSON，一次请求拿到 5 个榜单 */
async function fetchSweBench() {
  const { data: html } = await httpGet('https://www.swebench.com/', { accept: 'text/html' })
  const m = html.match(
    /<script[^>]*type="application\/json"[^>]*id="leaderboard-data"[^>]*>([\s\S]*?)<\/script>/,
  )
  if (!m) throw new Error('页面结构变化：未找到 leaderboard-data 脚本')
  const parsed = JSON.parse(m[1])
  const boards = Object.values(parsed).filter((b) => b && Array.isArray(b.results))
  const verified = boards.find((b) => /verified/i.test(b.name || ''))
  if (!verified) throw new Error('未找到 Verified 榜单')

  const seen = new Set()
  const ranked = verified.results
    .filter((r) => Number.isFinite(Number(r.resolved)))
    .sort((a, b) => Number(b.resolved) - Number(a.resolved))
    .filter((r) => {
      const k = String(r.name || '').toLowerCase()
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, TOP_N)
    .map((r, i) => ({
      rank: i + 1,
      model: r.name,
      slug: r.name,
      vendor: '',
      score: Number(Number(r.resolved).toFixed(1)),
      note: r.checked === false ? '未复核' : undefined,
    }))

  if (!ranked.length) throw new Error('Verified 榜单为空')

  return [
    {
      id: 'swebench-verified',
      name: '代码修复能力榜',
      publisher: 'SWE-bench Verified',
      metric: '解决率 %',
      metricHint:
        '在真实 GitHub issue 上「改对并通过测试」的比例。注意榜单条目多为「智能体 + 模型」组合，不等于模型裸分。',
      url: 'https://www.swebench.com/',
      license: '公开数据',
      updatedAt: null,
      sampleSize: ranked.length,
      ranked,
    },
  ]
}

/** 5. LiveBench —— 官方 CSV，文件名带日期，需先自动发现最新文件 */
async function fetchLiveBench() {
  let tableName = null
  try {
    const { data } = await httpGet(
      'https://api.github.com/repos/LiveBench/livebench.github.io/contents/public',
      { accept: 'application/vnd.github+json', as: 'json' },
    )
    const names = (Array.isArray(data) ? data : [])
      .map((f) => f.name)
      .filter((n) => /^table_\d{4}_\d{2}_\d{2}\.csv$/.test(n))
      .sort()
    tableName = names[names.length - 1] || null
  } catch (e) {
    log(`   GitHub 目录发现失败（${e.message}），回退到已知文件名`)
  }
  if (!tableName) tableName = 'table_2026_06_25.csv'

  const datePart = tableName.replace(/^table_/, '').replace(/\.csv$/, '')
  const base = `https://livebench.ai/${tableName}`
  const { data: csv } = await httpGet(base, { accept: 'text/csv' })
  const { data: cats } = await httpGet(`https://livebench.ai/categories_${datePart}.json`, {
    accept: 'application/json',
    as: 'json',
  })

  const lines = csv.split('\n').filter((l) => l.trim())
  if (lines.length < 2) throw new Error('CSV 为空')
  const header = lines[0].split(',')
  const rows = lines.slice(1).map((l) => {
    const cells = l.split(',')
    const o = {}
    header.forEach((h, i) => {
      o[h.trim()] = cells[i]
    })
    return o
  })

  // LiveBench 没有总分列，官方口径是 7 个分类均值的平均
  const groups = Object.keys(cats || {})
  if (!groups.length) throw new Error('categories 结构异常')
  const ranked = rows
    .map((row) => {
      const per = groups
        .map((g) => {
          const cols = (cats[g] || []).filter(
            (k) => row[k] !== undefined && row[k] !== '' && Number.isFinite(Number(row[k])),
          )
          if (!cols.length) return null
          return cols.reduce((a, k) => a + Number(row[k]), 0) / cols.length
        })
        .filter((v) => v !== null)
      if (!per.length) return null
      return { model: row.model, score: per.reduce((a, b) => a + b, 0) / per.length }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((r, i) => ({
      rank: i + 1,
      model: prettyModelName(r.model),
      slug: r.model,
      vendor: '',
      score: Number(r.score.toFixed(1)),
    }))

  if (!ranked.length) throw new Error('复算后没有有效成绩')
  const [y, mo, d] = datePart.split('_')

  return [
    {
      id: 'livebench',
      name: '多任务综合榜',
      publisher: 'LiveBench',
      metric: '平均分',
      metricHint: '涵盖推理、编程、数学、数据分析、语言、指令遵循等 7 大类，取各类均值的平均。',
      url: 'https://livebench.ai/',
      license: '公开数据',
      updatedAt: `${y}-${mo}-${d}`,
      sampleSize: ranked.length,
      ranked,
    },
  ]
}

/* ────────────────────────── 主流程 ────────────────────────── */

const SOURCES = [
  { key: 'lmarena', label: 'LMArena 官方榜', fn: fetchLMArena },
  { key: 'openrouter', label: 'OpenRouter 智能指数', fn: fetchOpenRouter },
  { key: 'artificialanalysis', label: 'Artificial Analysis', fn: fetchArtificialAnalysis },
  { key: 'swebench', label: 'SWE-bench Verified', fn: fetchSweBench },
  { key: 'livebench', label: 'LiveBench', fn: fetchLiveBench },
]

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'))
  } catch {
    return null
  }
}

async function main() {
  const existing = readExisting()
  const prevById = new Map((existing?.boards || []).map((b) => [b.id, b]))

  const boards = []
  const sourceStatus = []

  for (const src of SOURCES) {
    if (ONLY && src.key !== ONLY) {
      // 未抓取的源沿用旧数据
      ;(existing?.boards || [])
        .filter((b) => (b.source || '') === src.key)
        .forEach((b) => boards.push(b))
      continue
    }

    log(`→ 抓取 ${src.label} …`)
    const startedAt = Date.now()
    try {
      const result = await src.fn()
      for (const b of result) {
        boards.push({ ...b, source: src.key, stale: false })
      }
      sourceStatus.push({
        key: src.key,
        label: src.label,
        ok: true,
        ms: Date.now() - startedAt,
        boards: result.map((b) => b.id),
      })
      log(`   ✅ ${result.map((b) => `${b.name}(${b.ranked.length})`).join('、')}`)
    } catch (e) {
      const fallback = (existing?.boards || []).filter((b) => (b.source || '') === src.key)
      fallback.forEach((b) => boards.push({ ...b, stale: true }))
      sourceStatus.push({
        key: src.key,
        label: src.label,
        ok: false,
        error: e.message,
        ms: Date.now() - startedAt,
        boards: fallback.map((b) => b.id),
      })
      log(`   ❌ 失败：${e.message}`)
      if (fallback.length) log(`   ↩︎ 沿用上次缓存（${fallback.length} 个榜单）`)
    }
  }

  if (!boards.length) {
    console.error('\n所有数据源都失败了，且没有可用缓存。保留原文件不做修改。')
    process.exitCode = 1
    return
  }

  const out = {
    generatedAt: new Date().toISOString(),
    note:
      '本文件由 scripts/fetch-leaderboards.mjs 自动生成，请勿手工编辑。' +
      'GitHub Actions 每周自动刷新；本地可运行 npm run update:leaderboards。',
    sources: sourceStatus,
    boards,
  }

  const okCount = sourceStatus.filter((s) => s.ok).length
  log(`\n完成：${okCount}/${sourceStatus.length} 个数据源抓取成功，共 ${boards.length} 个榜单。`)

  if (DRY_RUN) {
    log('--dry-run：不写入文件。')
    return
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n')
  log(`已写入 ${path.relative(ROOT, OUT_FILE)}（${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB）`)

  if (okCount < sourceStatus.length) process.exitCode = 0 // 部分失败不算构建失败
}

main().catch((e) => {
  console.error('未捕获错误：', e)
  process.exitCode = 1
})
