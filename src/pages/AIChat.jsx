import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Settings, Trash2, MessageSquare, User, Bot, Loader2, ChevronDown, Eye, EyeOff, Check, X, Download, FileText, FileJson } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { cn } from '../utils/helpers.js'

// 预设服务商，模型名严格对照各厂商 2026-08 官方文档
const PRESETS = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5.6-sol',
    models: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-4.1', 'gpt-4.1-mini'],
  },
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-flash',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-v4-flash-vision-exp'],
  },
  {
    name: '月之暗面 Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'kimi-k3',
    models: ['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.7-code-highspeed', 'kimi-k2.6'],
  },
  {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen3.8-max',
    models: ['qwen3.8-max', 'qwen3.8-flash', 'qwen3.7-plus', 'qwen3.7-flash'],
  },
  {
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-5.3',
    models: ['glm-5.3', 'glm-5.3-flash', 'glm-5.2', 'glm-5.1'],
  },
  {
    name: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V4-Flash',
    models: ['deepseek-ai/DeepSeek-V4-Flash', 'deepseek-ai/DeepSeek-V4-Pro', 'zai-org/GLM-5.2', 'moonshotai/Kimi-K2.7-Code'],
  },
]

const DEFAULT_SETTINGS = {
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-v4-flash',
  systemPrompt: '',
  temperature: 0.7,
}

const ROLE_LABELS = {
  user: { icon: User, label: '我', color: 'bg-primary-500' },
  assistant: { icon: Bot, label: 'AI', color: 'bg-emerald-500' },
  system: { icon: Settings, label: '系统', color: 'bg-amber-500' },
}

export default function AIChat() {
  const [settings, setSettings] = useLocalStorage('taotools-ai-settings', DEFAULT_SETTINGS)
  const [messages, setMessages] = useLocalStorage('taotools-ai-messages', [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  // 初始问候
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '你好！我是 AI 助手。请先点击右上角「设置」配置 API Key 和模型，然后就可以开始对话了。',
        id: Date.now(),
      }])
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 自适应 textarea 高度
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
    }
  }, [input])

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const applyPreset = (preset) => {
    setSettings((prev) => ({
      ...prev,
      baseUrl: preset.baseUrl,
      model: preset.model,
    }))
  }

  const clearMessages = () => {
    setMessages([])
    setError('')
  }

  // 导出为 Markdown
  const exportMarkdown = () => {
    const validMessages = messages.filter((m) => !m.error)
    if (validMessages.length === 0) return

    const lines = []
    lines.push(`# AI 对话记录`)
    lines.push('')
    lines.push(`> 模型: ${settings.model || '未知'}  |  时间: ${new Date().toLocaleString('zh-CN')}`)
    lines.push('')
    if (settings.systemPrompt) {
      lines.push(`## 系统提示`)
      lines.push('')
      lines.push(settings.systemPrompt)
      lines.push('')
    }
    validMessages.forEach((msg) => {
      const role = msg.role === 'user' ? '🧑 我' : msg.role === 'assistant' ? '🤖 AI' : '⚙️ 系统'
      lines.push(`### ${role}`)
      lines.push('')
      lines.push(msg.content)
      lines.push('')
    })
    lines.push('---')
    lines.push(`*由 TaoTools AI 对话导出*`)

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-chat-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  // 导出为 JSON
  const exportJson = () => {
    const validMessages = messages.filter((m) => !m.error)
    if (validMessages.length === 0) return

    const data = {
      model: settings.model,
      baseUrl: settings.baseUrl,
      exportedAt: new Date().toISOString(),
      systemPrompt: settings.systemPrompt || '',
      messages: validMessages.map((m) => ({ role: m.role, content: m.content })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-chat-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setLoading(false)
  }

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    if (!settings.apiKey) {
      setError('请先在设置中填写 API Key')
      setShowSettings(true)
      return
    }

    setError('')
    const userMessage = { role: 'user', content: trimmed, id: Date.now() }
    const apiMessages = []

    // 构建发送给 API 的消息列表
    if (settings.systemPrompt) {
      apiMessages.push({ role: 'system', content: settings.systemPrompt })
    }
    // 只取最近 20 条历史，避免超出上下文
    const history = messages.slice(-20).map(({ role, content }) => ({ role, content }))
    apiMessages.push(...history, { role: 'user', content: trimmed })

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const assistantId = Date.now() + 1

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const response = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: apiMessages,
          temperature: Number(settings.temperature) || 0.7,
          stream: streaming,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errText = await response.text()
        let errMsg = `请求失败 (${response.status})`
        try {
          const errJson = JSON.parse(errText)
          errMsg = errJson.error?.message || errJson.message || errMsg
        } catch {
          if (errText) errMsg += `: ${errText.slice(0, 200)}`
        }
        throw new Error(errMsg)
      }

      if (streaming && response.body) {
        // 流式读取
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let assistantContent = ''

        setMessages((prev) => [...prev, { role: 'assistant', content: '', id: assistantId, streaming: true }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine || !trimmedLine.startsWith('data:')) continue
            const data = trimmedLine.slice(5).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              if (delta) {
                assistantContent += delta
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                )
              }
            } catch {
              // 跳过无法解析的行
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m
          )
        )
      } else {
        // 非流式
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || '（空回复）'
        setMessages((prev) => [...prev, { role: 'assistant', content, id: assistantId }])
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // 用户主动停止，保留已有内容
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content || '（已停止）', streaming: false } : m
          )
        )
      } else {
        const errMsg = err.message || '网络异常'
        setError(errMsg)
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `⚠️ ${errMsg}`,
          id: assistantId,
          error: true,
        }])
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading, settings, messages, streaming, setMessages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isConfigured = settings.apiKey && settings.baseUrl && settings.model

  return (
    <div className="min-h-screen pb-6">
      <div className="max-w-4xl mx-auto section-padding">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI 对话</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    {settings.model}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <X className="w-3 h-3" />未配置
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 导出按钮 */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={messages.length === 0}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                title="导出对话"
              >
                <Download className="w-4 h-4" />
              </button>
              {showDownloadMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
                    <button
                      onClick={exportMarkdown}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      导出为 Markdown
                    </button>
                    <button
                      onClick={exportJson}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      <FileJson className="w-4 h-4 text-slate-400" />
                      导出为 JSON
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={clearMessages}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="清空对话"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'p-2.5 rounded-xl transition-colors',
                showSettings
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
              )}
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <Card hover={false} className="mb-4 p-5">
            <div className="space-y-4">
              {/* 预设服务商 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  快速选择服务商
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        settings.baseUrl === preset.baseUrl
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300',
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Base URL */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={(e) => updateSetting('baseUrl', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  带 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">/v1</code> 的是 OpenAI 兼容接口版本前缀，代码会自动拼接 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">/chat/completions</code>。实际请求地址如：<code className="text-slate-500">{settings.baseUrl.replace(/\/$/, '')}/chat/completions</code>
                </p>
              </div>

              {/* API Key */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => updateSetting('apiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Key 仅保存在本地浏览器，不会上传服务器</p>
              </div>

              {/* 模型 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  模型名称
                </label>
                <input
                  type="text"
                  value={settings.model}
                  onChange={(e) => updateSetting('model', e.target.value)}
                  placeholder="deepseek-chat"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {/* 显示当前服务商可选模型 */}
                {(() => {
                  const preset = PRESETS.find((p) => p.baseUrl === settings.baseUrl)
                  if (!preset) return null
                  return (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {preset.models.map((m) => (
                        <button
                          key={m}
                          onClick={() => updateSetting('model', m)}
                          className={cn(
                            'px-2 py-1 rounded-md text-xs border transition-colors',
                            settings.model === m
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary-300',
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* 系统提示词 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  系统提示词 <span className="text-slate-400 font-normal">（可选）</span>
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                  placeholder="你是一个专业的编程助手..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* 温度与流式 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  温度 Temperature
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    当前 {settings.temperature} · 取值 0–2，越大越发散
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSetting('temperature', e.target.value)}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0 严谨</span>
                  <span>0.7 平衡</span>
                  <span>1.0 创意</span>
                  <span>2.0 随机</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  控制回答的随机性。<span className="text-slate-600 dark:text-slate-300 font-medium">0</span> 几乎每次相同（适合代码、翻译、事实问答）；
                  <span className="text-slate-600 dark:text-slate-300 font-medium">0.7</span> 默认，兼顾准确与灵活；
                  <span className="text-slate-600 dark:text-slate-300 font-medium">1.0 以上</span> 更有创意，但可能不严谨（适合写作、头脑风暴）。
                  <span className="block mt-1 text-slate-400">注：推理类模型（如 GLM-5.3、DeepSeek-V4 thinking 模式）通常锁定 temperature=1.0，调节可能无效。</span>
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={streaming}
                  onChange={(e) => setStreaming(e.target.checked)}
                  className="accent-primary-500"
                />
                流式输出
              </label>
            </div>
          </Card>
        )}

        {/* 错误提示 */}
        {error && !showSettings && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 对话区域 */}
        <Card hover={false} className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[50vh] max-h-[60vh]">
            {messages.map((msg) => {
              const roleInfo = ROLE_LABELS[msg.role] || ROLE_LABELS.assistant
              const Icon = roleInfo.icon
              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  {/* 头像 */}
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm',
                    roleInfo.color,
                    msg.error && 'bg-red-500',
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {/* 气泡 */}
                  <div className={cn('flex flex-col gap-1 max-w-[80%]', msg.role === 'user' && 'items-end')}>
                    <div className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-md'
                        : msg.error
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-md'
                          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-md',
                    )}>
                      <div className="whitespace-pre-wrap">{msg.content || (msg.streaming && '思考中...')}</div>
                      {msg.streaming && msg.content && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary-500 animate-pulse align-text-bottom" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 rounded-2xl rounded-tl-md px-4 py-2.5">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isConfigured ? '输入消息，Enter 发送，Shift+Enter 换行...' : '请先配置 API Key...'}
                rows={1}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-50"
                style={{ minHeight: '40px', maxHeight: '200px' }}
              />
              {loading ? (
                <button
                  onClick={handleStop}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 bg-white rounded-sm" /> 停止
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> 发送
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* 底部说明 */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          支持 OpenAI 兼容接口（DeepSeek、Kimi、通义、GLM 等）· 对话历史自动保存到本地，刷新不丢失
        </p>
      </div>
    </div>
  )
}
