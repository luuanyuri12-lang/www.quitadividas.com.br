'use client'

import { useState, useEffect } from 'react'
import LockedOverlay from '@/components/ui/LockedOverlay'
import { Heart, Wind, Star, Save } from 'lucide-react'

export default function PropositoPage() {
  const [plano, setPlano] = useState<string | null>(null)
  const [perdao, setPerdao] = useState('')
  const [soltar, setSoltar] = useState('')
  const [oportunidades, setOportunidades] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    fetch('/api/usuario').then((r) => r.json()).then((u) => setPlano(u.plano))
  }, [])

  async function handleSalvar() {
    if (!perdao && !soltar && !oportunidades) return
    setSalvando(true)
    const semana = Math.ceil(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )
    await fetch('/api/proposito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reflexao: JSON.stringify({ perdao, soltar, oportunidades }),
        semana,
      }),
    })
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  if (plano === null) {
    return <div className="text-gray-400 text-sm">Carregando...</div>
  }

  if (plano !== 'ELITE') {
    return <LockedOverlay planMinimo="ELITE" />
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Card 1: Perdão financeiro */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-rose-50 rounded-xl p-2">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="font-semibold text-gray-800">Liberar o Perdão Financeiro</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Muitas pessoas carregam vergonha, culpa e raiva por causa das dívidas. Isso consome energia emocional que poderia ir para a reconstrução. Antes de se libertar das dívidas financeiras, é preciso se libertar do peso emocional que elas carregam.
        </p>
        <p className="text-sm text-gray-500 mb-3">
          Escreva sobre quem você precisa perdoar — inclusive a si mesmo. Sobre decisões que tomou, oportunidades perdidas, pessoas que te prejudicaram. Solte o julgamento.
        </p>
        <textarea
          value={perdao}
          onChange={(e) => setPerdao(e.target.value)}
          placeholder="Eu preciso me perdoar por... Eu perdoo [nome/situação] por..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
        />
      </div>

      {/* Card 2: Soltar o que não é seu controlar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-sky-50 rounded-xl p-2">
            <Wind className="w-5 h-5 text-sky-500" />
          </div>
          <h2 className="font-semibold text-gray-800">Solte o que Não é Seu Controlar</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Existem coisas que você não pode mudar: o passado, a crise econômica, as atitudes de outras pessoas. Gastar energia tentando controlar o incontrolável é um dos maiores drenos de propósito e saúde mental.
        </p>
        <p className="text-sm text-gray-500 mb-3 italic">
          "Não posso controlar os juros que acumularam. Posso controlar como reajo a partir de hoje."
        </p>
        <textarea
          value={soltar}
          onChange={(e) => setSoltar(e.target.value)}
          placeholder="O que eu preciso largar e parar de tentar controlar? O que não depende de mim e eu posso soltar?"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
        />
      </div>

      {/* Card 3: Seja ousado quando o coração mandar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-amber-50 rounded-xl p-2">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-semibold text-gray-800">Seja Ousado Quando o Coração Mandar</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          A dívida não pode ser a razão para você nunca tentar. Registre as oportunidades que ficaram pelo caminho, as metas que você adiou. Depois escreva o que você vai perseguir quando estiver livre. Isso é o seu propósito financeiro — e ele precisa ser maior que as dívidas para te dar força de continuar.
        </p>
        <textarea
          value={oportunidades}
          onChange={(e) => setOportunidades(e.target.value)}
          placeholder="Oportunidades que deixei passar por medo ou falta de dinheiro:&#10;&#10;O que vou perseguir quando estiver financeiramente livre:"
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Botão salvar */}
      <button
        onClick={handleSalvar}
        disabled={salvando || (!perdao && !soltar && !oportunidades)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <Save className="w-4 h-4" />
        {salvando ? 'Salvando...' : salvo ? 'Reflexão salva!' : 'Salvar reflexão desta semana'}
      </button>
    </div>
  )
}
