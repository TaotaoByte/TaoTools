import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Settings, Trash2, MessageSquare, User, Bot, Loader2, ChevronDown, Eye, EyeOff, Check, X, Download, FileText, FileJson, Sparkles, Code2, Languages, PenLine, Theater, Plus, Pencil } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { MarkdownRenderer } from '../components/MarkdownRenderer.jsx'
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

// 预设智能体：本质是「角色 + 系统提示词 + 建议温度」的快捷组合
const PRESET_AGENTS = [
  {
    id: 'general',
    name: '通用助手',
    desc: '日常问答、知识解答',
    systemPrompt: '你是一个乐于助人、知识渊博的 AI 助手，回答准确、清晰、友好，必要时分点阐述。',
    icon: Sparkles,
    builtin: true,
  },
  {
    id: 'coder',
    name: '编程助手',
    desc: '写代码、调试、讲解技术',
    systemPrompt: '你是一名资深软件工程师。回答代码问题时给出可运行、带必要注释的代码，语言简洁，重点讲清原理与用法，并指出常见坑点。',
    temperature: 0.3,
    icon: Code2,
    builtin: true,
  },
  {
    id: 'translator',
    name: '翻译专家',
    desc: '多语言互译、润色',
    systemPrompt: '你是一名专业翻译。只输出翻译结果，不附带解释或原文，保持原意与语气，用词地道自然。',
    temperature: 0.3,
    icon: Languages,
    builtin: true,
  },
  {
    id: 'writer',
    name: '写作助手',
    desc: '文章、文案、润色创作',
    systemPrompt: '你是一名优秀的写作助手。根据用户需求创作内容，文笔流畅、结构清晰、符合场景语气，可应要求润色或改写。',
    temperature: 0.9,
    icon: PenLine,
    builtin: true,
  },
  {
    id: 'roleplay',
    name: '角色扮演',
    desc: '沉浸式角色对话',
    systemPrompt: '你可以投入地进行角色扮演，生动自然地扮演用户指定的角色，始终贴合角色设定与语气。',
    temperature: 1.0,
    icon: Theater,
    builtin: true,
  },
]

// 自定义智能体的表单初始值
const EMPTY_AGENT_FORM = { name: '', desc: '', systemPrompt: '', temperature: '0.7' }

const ROLE_LABELS = {
  user: { icon: User, label: '我', color: 'bg-primary-500' },
  assistant: { icon: Bot, label: 'AI', color: 'bg-emerald-500' },
  system: { icon: Settings, label: '系统', color: 'bg-amber-500' },
}

export default function AIChat() {
  const [settings, setSettings] = useLocalStorage('taotools-ai-settings', DEFAULT_SETTINGS)
  const [conversations, setConversations] = useLocalStorage('taotools-ai-conversations', [])
  const [activeId, setActiveId] = useLocalStorage('taotools-ai-active-chat', null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState(true)
  const [activeAgentId, setActiveAgentId] = useState(null)
  const [customAgents, setCustomAgents] = useLocalStorage('taotools-ai-agents', [])
  const [agentModalOpen, setAgentModalOpen] = useState(false)
  const [editingAgentId, setEditingAgentId] = useState(null)
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT_FORM)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  const allAgents = [...PRESET_AGENTS, ...customAgents]

  // —— 多会话 ——
  const activeConv = conversations.find((c) => c.id === activeId) || null
  const messages = activeConv ? activeConv.messages : []

  const createConversation = useCallback((messages = null) => ({
    id: `conv-${Date.now()}`,
    title: '新对话',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: messages || [{
      role: 'assistant',
      content: '你好！我是 AI 助手。请先点击右上角「设置」配置 API Key 和模型，然后就可以开始对话了。',
      id: Date.now(),
    }],
  }), [])

  // 更新当前会话的非 message 字段（如标题）
  const updateActive = useCallback((updater) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, ...(typeof updater === 'function' ? updater(c) : updater), updatedAt: Date.now() }
          : c,
      ),
    )
  }, [activeId, setConversations])

  // 与原 setMessages 用法一致的包装：更新当前会话的消息
  const setMessages = useCallback((updater) => {
    updateActive((c) => ({
      messages: typeof updater === 'function' ? updater(c.messages) : updater,
    }))
  }, [updateActive])

  const newConversation = useCallback(() => {
    const conv = createConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setError('')
  }, [createConversation, setConversations, setActiveId])

  const switchConversation = useCallback((id) => {
    setActiveId(id)
    setError('')
  }, [setActiveId])

  const deleteConversation = useCallback((id) => {
    if (!window.confirm('确定删除该对话？删除后无法恢复。')) return
    const remaining = conversations.filter((c) => c.id !== id)
    setConversations(remaining)
    if (activeId === id) {
      if (remaining.length) {
        setActiveId(remaining[0].id)
      } else {
        const conv = createConversation()
        setConversations([conv])
        setActiveId(conv.id)
      }
      setError('')
    }
  }, [conversations, activeId, setConversations, setActiveId, createConversation])

  // 迁移旧版「单会话」数据（taotools-ai-messages）到多会话结构
  useEffect(() => {
    try {
      const legacyRaw = window.localStorage.getItem('taotools-ai-messages')
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw)
        if (Array.isArray(legacy) && legacy.length > 0 && conversations.length === 0) {
          const firstUser = legacy.find((m) => m.role === 'user')
          const conv = {
            ...createConversation(legacy),
            title: firstUser?.content?.slice(0, 20) || '历史对话',
          }
          setConversations([conv])
          setActiveId(conv.id)
        }
        window.localStorage.removeItem('taotools-ai-messages')
      }
    } catch {
      window.localStorage.removeItem('taotools-ai-messages')
    }
  }, [])

  // 确保始终存在一个当前会话
  useEffect(() => {
    if (conversations.length === 0) {
      newConversation()
      return
    }
    if (!activeId || !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId, newConversation, setActiveId])

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

  // 切换智能体：将角色 + 建议温度写入设置
  const applyAgent = (agent) => {
    setActiveAgentId(agent.id)
    setSettings((prev) => ({
      ...prev,
      systemPrompt: agent.systemPrompt,
      ...(agent.temperature != null ? { temperature: agent.temperature } : {}),
    }))
  }

  // 打开「新建」智能体弹窗
  const openCreateAgent = () => {
    setEditingAgentId(null)
    setAgentForm(EMPTY_AGENT_FORM)
    setAgentModalOpen(true)
  }

  // 打开「编辑」智能体弹窗（仅自定义）
  const openEditAgent = (agent) => {
    setEditingAgentId(agent.id)
    setAgentForm({
      name: agent.name,
      desc: agent.desc || '',
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature != null ? String(agent.temperature) : '0.7',
    })
    setAgentModalOpen(true)
  }

  // 保存智能体（新建或更新）
  const saveAgent = () => {
    const name = agentForm.name.trim()
    const systemPrompt = agentForm.systemPrompt.trim()
    if (!name || !systemPrompt) return

    const payload = {
      name,
      desc: agentForm.desc.trim(),
      systemPrompt,
      temperature: Number(agentForm.temperature),
    }

    if (editingAgentId) {
      setCustomAgents((prev) =>
        prev.map((a) => (a.id === editingAgentId ? { ...a, ...payload } : a)),
      )
    } else {
      const newAgent = { ...payload, id: `custom-${Date.now()}` }
      setCustomAgents((prev) => [...prev, newAgent])
    }
    setAgentModalOpen(false)
  }

  // 删除自定义智能体
  const deleteAgent = (id) => {
    setCustomAgents((prev) => prev.filter((a) => a.id !== id))
    if (activeAgentId === id) {
      setActiveAgentId(null)
      setSettings((prev) => ({ ...prev, systemPrompt: '' }))
    }
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

    // 首次提问时用问题前 20 字作为会话标题
    updateActive((c) => {
      if (c.title && c.title !== '新对话') return {}
      return { title: trimmed.slice(0, 20) }
    })
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
  }, [input, loading, settings, messages, streaming, setMessages, updateActive])

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
                    <span className="font-medium">{settings.model}</span>
                    <span className="text-slate-400 dark:text-slate-500">·</span>
                    <span>key ···{settings.apiKey.slice(-4)}</span>
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

        {/* 会话列表 */}
        <div className="mb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={newConversation}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-500 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              新对话
            </button>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  'flex-shrink-0 flex items-stretch rounded-xl border transition-colors',
                  c.id === activeId
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700',
                )}
              >
                <button
                  onClick={() => switchConversation(c.id)}
                  title={c.title || '新对话'}
                  className={cn(
                    'flex items-center gap-2 pl-3 pr-2 py-2 text-sm font-medium transition-colors',
                    c.id === activeId
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                  <span className="max-w-[140px] truncate">{c.title || '新对话'}</span>
                </button>
                <button
                  onClick={() => deleteConversation(c.id)}
                  title="删除会话"
                  className="px-1.5 pr-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            可新建、切换多个对话，历史记录互不干扰
          </p>
        </div>

        {/* 智能体选择条 */}
        <div className="mb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {allAgents.map((agent) => {
              const AgentIcon = agent.icon || Bot
              const isActive = activeAgentId === agent.id
              const isCustom = !agent.builtin
              return (
                <div
                  key={agent.id}
                  className={cn(
                    'flex-shrink-0 flex items-stretch rounded-xl border transition-colors',
                    isActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700',
                  )}
                >
                  <button
                    onClick={() => applyAgent(agent)}
                    title={agent.desc || agent.name}
                    className={cn(
                      'flex items-center gap-2 pl-3 pr-2 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                    )}
                  >
                    <AgentIcon className="w-4 h-4" />
                    <span>{agent.name}</span>
                  </button>
                  {isCustom && (
                    <>
                      <button
                        onClick={() => openEditAgent(agent)}
                        title="编辑智能体"
                        className="px-1.5 text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        title="删除智能体"
                        className="px-1.5 pr-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
            <button
              onClick={openCreateAgent}
              title="新建智能体"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-500 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              自定义
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            选择角色即自动套用对应的系统提示词与建议温度，可在「设置」里进一步调整
          </p>
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
                {/* 显示当前服务商可选模型（下拉选择，避免误触） */}
                {(() => {
                  const preset = PRESETS.find((p) => p.baseUrl === settings.baseUrl)
                  if (!preset) return null
                  return (
                    <select
                      value={preset.models.includes(settings.model) ? settings.model : ''}
                      onChange={(e) => {
                        if (e.target.value) updateSetting('model', e.target.value)
                      }}
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="" disabled>选择预设模型…</option>
                      {preset.models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
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
                      {msg.role === 'assistant' && !msg.error ? (
                        msg.content ? (
                          <MarkdownRenderer content={msg.content} className="prose-sm" />
                        ) : msg.streaming ? (
                          <span className="text-slate-400">思考中...</span>
                        ) : null
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
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

      {/* 新建/编辑智能体弹窗 */}
      {agentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAgentModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingAgentId ? '编辑智能体' : '新建智能体'}
              </h3>
              <button
                onClick={() => setAgentModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="如：法务顾问"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  简介 <span className="text-slate-400 font-normal">（可选，仅作说明）</span>
                </label>
                <input
                  type="text"
                  value={agentForm.desc}
                  onChange={(e) => setAgentForm((p) => ({ ...p, desc: e.target.value }))}
                  placeholder="如：合同审查、法律咨询"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  系统提示词 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={agentForm.systemPrompt}
                  onChange={(e) => setAgentForm((p) => ({ ...p, systemPrompt: e.target.value }))}
                  placeholder="定义这个智能体的角色、知识范围与回答风格..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  建议温度 <span className="text-slate-400 font-normal">（{agentForm.temperature}）</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={agentForm.temperature}
                  onChange={(e) => setAgentForm((p) => ({ ...p, temperature: e.target.value }))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0 严谨</span>
                  <span>0.7 平衡</span>
                  <span>2.0 创意</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setAgentModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveAgent}
                disabled={!agentForm.name.trim() || !agentForm.systemPrompt.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingAgentId ? '保存修改' : '创建智能体'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
