'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  Loader2,
  Bot,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { createTailoredResumeAction } from '@/server/actions/resume.actions'

function formatInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary border border-border"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function ResumeApprovalCard({ targetRole }: { targetRole: string }) {
  const [isCreating, setIsCreating] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const router = useRouter()

  const handleApprove = async () => {
    setIsCreating(true)
    try {
      const res = await createTailoredResumeAction({ targetRole, title: `${targetRole} Resume` })
      if (res.success && res.resumeId) {
        setCreatedId(res.resumeId)
        toast.success(`Tailored resume for ${targetRole} created successfully!`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create resume.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="my-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
        <Sparkles className="h-4 w-4" />
        <span>Action Required: Approve Resume Creation</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Approve to generate a complete tailored resume version for <strong>{targetRole}</strong> using your selected projects and skills.
      </p>

      {createdId ? (
        <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Resume Created!
          </span>
          <button
            onClick={() => router.push(`/resumes/${createdId}`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-sm hover:bg-primary/90 transition-all"
          >
            <span>View & Print Resume</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleApprove}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-brand-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Tailored Resume...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Approve & Create Tailored Resume</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground">
      {lines.map((line, idx) => {
        if (line.includes('```create_resume_proposal:')) {
          const roleMatch = line.match(/```create_resume_proposal:(.*)/)
          const targetRole = roleMatch ? roleMatch[1].trim() : 'Software Engineer'
          return <ResumeApprovalCard key={idx} targetRole={targetRole} />
        }
        if (line.trim().startsWith('```')) {
          return null
        }

        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-foreground mt-3 mb-1">
              {formatInline(line.slice(4))}
            </h3>
          )
        }
        if (line.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-xs font-semibold text-foreground mt-2 mb-1">
              {formatInline(line.slice(5))}
            </h4>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-bold text-foreground mt-3 mb-1.5">
              {formatInline(line.slice(3))}
            </h2>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-lg font-extrabold text-foreground mt-4 mb-2">
              {formatInline(line.slice(2))}
            </h1>
          )
        }

        const trimmed = line.trim()

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 my-0.5">
              <span className="text-primary font-bold select-none">•</span>
              <span className="flex-1">{formatInline(trimmed.slice(2))}</span>
            </div>
          )
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 my-0.5">
              <span className="text-primary font-semibold font-mono text-xs select-none">
                {numMatch[1]}.
              </span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          )
        }

        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        return <p key={idx}>{formatInline(line)}</p>
      })}
    </div>
  )
}

export interface Message {
  id: string
  chatId?: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  metadata?: any
  createdAt: Date | string
}

export interface Chat {
  id: string
  userId: string
  title: string
  createdAt: Date | string
  updatedAt: Date | string
  messages?: Message[]
}

export interface ChatInterfaceProps {
  userId: string
  chats: any[]
  profileSummary?: any
  profileComplete?: boolean
}

const STARTER_PROMPTS = [
  '📋 Paste a job description to get started',
  '🎯 Let me analyze a JD for Software Engineer at Google',
  '📊 What skills am I missing for a Data Scientist role?',
  '✨ Generate a resume for a Frontend Engineer position',
]

export function ChatInterface({
  userId,
  chats: initialChats,
  profileSummary,
  profileComplete,
}: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats[0]?.id ?? null
  )
  const [messages, setMessages] = useState<Message[]>(
    initialChats[0]?.messages ?? []
  )
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleNewChatClick = () => {
    setActiveChatId(null)
    setMessages([])
  }

  const createNewChat = async (): Promise<Chat | null> => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        const chat = await res.json()
        const fullChat: Chat = { ...chat, messages: [] }
        setChats((prev) => [fullChat, ...prev])
        setActiveChatId(chat.id)
        return fullChat
      }
    } catch (e) {
      console.error(e)
    }
    return null
  }

  const loadChat = async (chatId: string) => {
    setActiveChatId(chatId)
    const existing = chats.find((c) => c.id === chatId)
    if (existing?.messages && existing.messages.length > 0) {
      setMessages(existing.messages)
    }

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, messages: data.messages } : c))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' })
      if (res.ok) {
        const remaining = chats.filter((c) => c.id !== chatId)
        setChats(remaining)
        if (activeChatId === chatId) {
          if (remaining.length > 0) {
            loadChat(remaining[0].id)
          } else {
            setActiveChatId(null)
            setMessages([])
          }
        }
        toast.success('Chat deleted')
      }
    } catch {
      toast.error('Failed to delete chat')
    }
  }

  const sendMessage = async (content?: string) => {
    const text = (content ?? input).trim()
    if (!text || isStreaming) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    let currentChatId = activeChatId
    if (!currentChatId) {
      const newChat = await createNewChat()
      if (!newChat) {
        toast.error('Failed to create new chat session')
        return
      }
      currentChatId = newChat.id
    }

    // Update title in chats list if title is default 'New Chat'
    const titleSnippet = text.slice(0, 60) + (text.length > 60 ? '...' : '')
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId && (c.title === 'New Chat' || !c.title)
          ? { ...c, title: titleSnippet }
          : c
      )
    )

    // Add user message optimistically
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Save user message to DB
    if (currentChatId) {
      await fetch(`/api/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'USER', content: text }),
      }).catch(console.error)
    }

    setIsStreaming(true)
    setStreamingContent('')

    try {
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role.toLowerCase() as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: text },
      ]

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          chatId: currentChatId,
          profileSummary,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content
                  setStreamingContent(fullContent)
                }
              } catch {}
            }
          }
        }
      }

      // Add AI message to messages list
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ASSISTANT',
        content: fullContent,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setStreamingContent('')
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col border-r border-border bg-sidebar overflow-hidden shrink-0"
          >
            <div className="p-3 border-b border-sidebar-border">
              <button
                onClick={handleNewChatClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-brand-sm"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Chats
              </p>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={cn(
                    'group w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                    activeChatId === chat.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <MessageSquare size={14} className="shrink-0 mt-0.5" />
                    <span className="text-xs truncate">{chat.title || 'Untitled Chat'}</span>
                  </div>
                  <button
                    onClick={(e) => deleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    title="Delete Chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Resume AI Agent</span>
          </div>
          {!profileComplete && (
            <div className="ml-auto">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                ⚠️ Complete profile for better results
              </Link>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full gap-8 max-w-lg mx-auto text-center">
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient mx-auto mb-4 shadow-brand">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="heading-display text-2xl mb-2">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">
                  Paste a job description and I&apos;ll analyze it, match it to your profile, and generate a tailored resume.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt.slice(2).trim())}
                    className="text-left rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'USER' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role !== 'USER' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm mt-0.5">
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                      message.role === 'USER'
                        ? 'rounded-tr-xs bg-primary text-primary-foreground font-normal'
                        : 'rounded-tl-xs bg-card dark:bg-muted/80 text-foreground border border-border'
                    )}
                  >
                    {message.role === 'USER' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <MarkdownMessage content={message.content} />
                    )}
                  </div>
                  {message.role === 'USER' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border shadow-sm mt-0.5">
                      <User size={16} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Streaming message */}
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm mt-0.5">
                    <Bot size={16} />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-card dark:bg-muted/80 text-foreground border border-border px-4 py-3 text-sm leading-relaxed shadow-sm">
                    {streamingContent ? (
                      <MarkdownMessage content={streamingContent} />
                    ) : (
                      <div className="flex gap-1.5 items-center h-5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-3 shadow-card focus-within:border-primary/40 focus-within:shadow-brand-sm transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Paste a job description or ask anything..."
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-60 max-h-48 leading-relaxed"
              />
              <button
                id="chat-send-button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                  input.trim() && !isStreaming
                    ? 'bg-primary text-primary-foreground shadow-brand-sm hover:bg-primary/90 active:scale-95'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                aria-label="Send message"
              >
                {isStreaming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Press <kbd className="rounded border border-border px-1 py-0.5 font-mono">Enter</kbd> to send · <kbd className="rounded border border-border px-1 py-0.5 font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
