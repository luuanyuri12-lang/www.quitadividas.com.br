'use client'

import { useEffect, useState } from 'react'

export default function Topbar({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  const [tema, setTema] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const temaSalvo = (localStorage.getItem('tema') as 'light' | 'dark') || 'light'
    setTema(temaSalvo)
    document.documentElement.setAttribute('data-theme', temaSalvo)
  }, [])

  function alternarTema() {
    const novoTema = tema === 'light' ? 'dark' : 'light'
    setTema(novoTema)
    localStorage.setItem('tema', novoTema)
    document.documentElement.setAttribute('data-theme', novoTema)
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{titulo}</h1>
        {subtitulo && <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={alternarTema}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          title="Alternar tema"
        >
          {tema === 'light' ? '🌙 Modo escuro' : '☀️ Modo claro'}
        </button>
        <button
          onClick={() => {
            const btn = document.querySelector<HTMLButtonElement>('[data-chat-trigger]')
            btn?.click()
          }}
          className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Pedir conselho à IA
        </button>
      </div>
    </header>
  )
}
