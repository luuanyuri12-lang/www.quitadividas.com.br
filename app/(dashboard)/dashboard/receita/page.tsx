'use client'

import { useState, useEffect } from 'react'
import LockedOverlay from '@/components/ui/LockedOverlay'
import { Sparkles, Plus, TrendingUp } from 'lucide-react'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ReceitaPage() {
  const [plano, setPlano] = useState<string | null>(null)
  const [habilidades, setHabilidades] = useState('')
  const [sugestoes, setSugestoes] = useState('')
  const [loadingIA, setLoadingIA] = useState(false)
  const [rendaExtra, setRendaExtra] = useState('')
  const [totalParcelas, setTotalParcelas] = useState(0)

  useEffect(() => {
    fetch('/api/usuario').then((r) => r.json()).then((u) => setPlano(u.plano))
    fetch('/api/dividas').then((r) => r.json()).then((d) => {
      const total = Array.isArray(d) ? d.reduce((s: number, x: { parcela: number }) => s + x.parcela, 0) : 0
      setTotalParcelas(total)
    })
  }, [])

  async function buscarSugestoes() {
    if (!habilidades.trim()) return
    setLoadingIA(true)
    const res = await fetch('/api/ia/conselho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pergunta: `Com base nas minhas habilidades: "${habilidades}", sugira 5 formas concretas de gerar renda extra no Brasil. Para cada uma, dê o potencial de ganho mensal estimado e os primeiros passos práticos.`,
      }),
    })
    const data = await res.json()
    setSugestoes(data.resposta)
    setLoadingIA(false)
  }

  const rendaExtraNum = parseFloat(rendaExtra) || 0
  const mesesComExtra = rendaExtraNum > 0 && totalParcelas > 0
    ? Math.ceil(totalParcelas / rendaExtraNum)
    : null

  if (plano === null) {
    return <div className="text-gray-400 text-sm">Carregando...</div>
  }

  if (plano === 'ESSENCIAL') {
    return <LockedOverlay planMinimo="PRO" />
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Mapeamento de habilidades */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-1">Mapeamento de Habilidades</h2>
        <p className="text-sm text-gray-500 mb-4">
          Descreva suas habilidades e experiências. A IA vai sugerir formas de monetizá-las.
        </p>
        <textarea
          value={habilidades}
          onChange={(e) => setHabilidades(e.target.value)}
          placeholder="Ex: Tenho experiência com design gráfico, falo inglês intermediário, sei cozinhar bem, tenho carro..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <button
          onClick={buscarSugestoes}
          disabled={!habilidades.trim() || loadingIA}
          className="mt-3 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {loadingIA ? 'Analisando...' : 'Gerar sugestões com IA'}
        </button>
      </div>

      {/* Sugestões IA */}
      {sugestoes && (
        <div className="bg-white rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-800">Sugestões de Renda Extra</h2>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sugestoes}</div>
        </div>
      )}

      {/* Calculadora de impacto */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-1">Calculadora de Impacto</h2>
        <p className="text-sm text-gray-500 mb-4">
          Veja quanto mais rápido você quitaria suas dívidas com renda extra.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Renda extra por mês (R$)</label>
            <div className="relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={rendaExtra}
                onChange={(e) => setRendaExtra(e.target.value)}
                placeholder="500"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {rendaExtraNum > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 mb-1">Renda extra por mês</p>
              <p className="text-xl font-bold text-emerald-700">{fmt(rendaExtraNum)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-1">Renda extra por ano</p>
              <p className="text-xl font-bold text-blue-700">{fmt(rendaExtraNum * 12)}</p>
            </div>
            {mesesComExtra && (
              <div className="col-span-2 bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">
                  Direcionando {fmt(rendaExtraNum)} para dívidas todo mês
                </p>
                <p className="text-lg font-bold text-white">
                  Parcelas quitadas em {mesesComExtra} meses a mais de esforço
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
