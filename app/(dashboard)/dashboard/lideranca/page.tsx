'use client'

import { useState, useEffect } from 'react'
import LockedOverlay from '@/components/ui/LockedOverlay'
import { Users, AlertTriangle, Sparkles } from 'lucide-react'

export default function LiderancaPage() {
  const [plano, setPlano] = useState<string | null>(null)
  const [resposta, setResposta] = useState('')
  const [loadingIA, setLoadingIA] = useState(false)
  const [equipe, setEquipe] = useState('')
  const [faturamento, setFaturamento] = useState('')

  useEffect(() => {
    fetch('/api/usuario').then((r) => r.json()).then((u) => setPlano(u.plano))
  }, [])

  async function aprofundarLideranca() {
    setLoadingIA(true)
    const res = await fetch('/api/ia/conselho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pergunta:
          'Me dê um guia prático sobre como um pequeno empresário pode desenvolver outros líderes dentro do seu negócio, com ações concretas para os próximos 30 dias.',
      }),
    })
    const data = await res.json()
    setResposta(data.resposta)
    setLoadingIA(false)
  }

  const equipeNum = parseInt(equipe) || 0
  const faturamentoNum = parseFloat(faturamento) || 0
  const capacidadeIdeal = equipeNum * 50000
  const situacao =
    faturamentoNum === 0
      ? null
      : faturamentoNum > capacidadeIdeal
      ? 'acima'
      : faturamentoNum < capacidadeIdeal * 0.5
      ? 'abaixo'
      : 'adequado'

  if (plano === null) {
    return <div className="text-gray-400 text-sm">Carregando...</div>
  }

  if (plano === 'ESSENCIAL') {
    return <LockedOverlay planMinimo="PRO" />
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Card 1: Gerar líderes */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-50 rounded-xl p-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Gerar Outros Líderes</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          O maior erro de um pequeno empresário é ser insubstituível no próprio negócio. Se você parar, o negócio para. O caminho para escalar é criar líderes que pensem como donos, tomem decisões no seu lugar e garantam a operação funcionar sem você.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">
          Isso começa com delegar tarefas com responsabilidade, dar feedback constante, e criar processos documentados. O objetivo é que em 90 dias, pelo menos uma pessoa no seu negócio possa resolver 70% dos problemas sem você.
        </p>
        <button
          onClick={aprofundarLideranca}
          disabled={loadingIA}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {loadingIA ? 'Gerando...' : 'Aprofundar com IA'}
        </button>

        {resposta && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {resposta}
          </div>
        )}
      </div>

      {/* Card 2: Capacidade de gestão */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-amber-50 rounded-xl p-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-800">
            Negócios não quebram — ficam maiores que a cabeça do dono
          </h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          Quando um negócio cresce mais rápido do que a capacidade de gestão do dono, ele começa a implodir de dentro. Clientes insatisfeitos, funcionários desmotivados, processos quebrados. Calcule se seu negócio está dentro da sua capacidade de gestão atual.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nº de funcionários</label>
            <input
              type="number"
              value={equipe}
              onChange={(e) => setEquipe(e.target.value)}
              placeholder="5"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Faturamento mensal (R$)</label>
            <input
              type="number"
              value={faturamento}
              onChange={(e) => setFaturamento(e.target.value)}
              placeholder="80000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {situacao && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              situacao === 'acima'
                ? 'bg-red-50 text-red-700'
                : situacao === 'abaixo'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {situacao === 'acima' && (
              <>
                <strong>Atenção:</strong> Seu faturamento (R${' '}
                {faturamentoNum.toLocaleString('pt-BR')}) pode estar acima da capacidade
                ideal para {equipeNum} pessoa(s). Considere estruturar melhor os processos
                e desenvolver lideranças antes de crescer mais.
              </>
            )}
            {situacao === 'abaixo' && (
              <>
                <strong>Potencial de crescimento:</strong> Sua equipe tem capacidade para
                suportar um faturamento maior. Foque em aquisição de clientes e vendas.
              </>
            )}
            {situacao === 'adequado' && (
              <>
                <strong>Equilíbrio saudável:</strong> Seu negócio está crescendo dentro
                de uma capacidade gerenciável. Continue investindo em processos e pessoas.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
