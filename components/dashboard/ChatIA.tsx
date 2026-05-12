'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatIA() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou seu conselheiro financeiro do Quita. Como posso te ajudar hoje? Pode me perguntar sobre suas dívidas, estratégias para economizar ou formas de aumentar sua renda.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const pergunta = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: pergunta }])
    setLoading(true)

    try {
      const res = await fetch('/api/ia/conselho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.resposta || 'Erro ao obter resposta.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão. Tente novamente.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        data-chat-trigger
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg z-50 transition-all hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden">
          <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Conselheiro Quita</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`rounded-full p-1.5 flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="bg-gray-100 rounded-full p-1.5">
                  <Bot className="w-4 h-4 text-gray-500" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-500">
                  Pensando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl p-2 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
