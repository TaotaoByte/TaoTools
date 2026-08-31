import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Settings, Trash2, MessageSquare, User, Bot, Loader2, ChevronDown, Eye, EyeOff, Check, X } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { cn } from '../utils/helpers.js'

// 预设服务商，方便用户快速选择
const PRESETS = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    name: '月之暗面 Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  },
  {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
  },
  {
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    models: ['glm-4', 'glm-4-flash', 'glm-4-air'],
  },
  {
    name: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V3',
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct'],
  },
]

const DEFAULT_SETTINGS = {
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    温度 <span className="text-slate-400 font-normal">({settings.temperature})</span>
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
          支持 OpenAI 兼容接口（DeepSeek、Kimi、通义、GLM 等）· 数据仅保存在本地浏览器
        </p>
      </div>
    </div>
  )
}
