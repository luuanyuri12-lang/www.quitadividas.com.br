'use client'

import { useEffect, useState } from 'react'
import { CAKTO_CHECKOUT_URLS } from '@/lib/cakto'
import { CheckCircle, XCircle, Shield } from 'lucide-react'

interface PlanoConfig {
  key: 'ESSENCIAL' | 'PRO' | 'ELITE'
  nome: string
  preco: string
  descricao: string
  destaque: boolean
  recursos: { label: string; incluido: boolean }[]
}

const planos: PlanoConfig[] = [
  {
    key: 'ESSENCIAL',
    nome: 'Essencial',
    preco: 'R$ 19,90',
    descricao: 'Para pessoas físicas que querem começar a controlar suas dívidas',
    destaque: false,
    recursos: [
      { label: 'Painel geral de dívidas', incluido: true },
      { label: 'Diagnóstico financeiro', incluido: true },
      { label: 'Cadastro ilimitado de dívidas', incluido: true },
      { label: 'Plano de ação em 6 etapas', incluido: true },
      { label: 'Chat com IA conselheira', incluido: true },
      { label: 'Módulo Aumento de Receita', incluido: false },
      { label: 'Módulo Liderança', incluido: false },
      { label: 'Módulo Propósito', incluido: false },
    ],
  },
  {
    key: 'PRO',
    nome: 'Pro',
    preco: 'R$ 97,00',
    descricao: 'Para pessoa física e donos de pequenos negócios que querem crescer',
    destaque: true,
    recursos: [
      { label: 'Tudo do Essencial', incluido: true },
      { label: 'Módulo Aumento de Receita com IA', incluido: true },
      { label: 'Módulo Liderança', incluido: true },
      { label: 'Calculadora de capacidade de gestão', incluido: true },
      { label: 'Sugestões de renda extra personalizadas', incluido: true },
      { label: 'Módulo Propósito', incluido: false },
    ],
  },
  {
    key: 'ELITE',
    nome: 'Elite',
    preco: 'R$ 197,00',
    descricao: 'Para donos de negócio que querem escalar com propósito e liderança',
    destaque: false,
    recursos: [
      { label: 'Tudo do Pro', incluido: true },
      { label: 'Módulo Propósito completo', incluido: true },
      { label: 'Diário de reflexão semanal', incluido: true },
      { label: 'Exercício de perdão financeiro', incluido: true },
      { label: 'Planejamento de metas ousadas', incluido: true },
      { label: 'Suporte prioritário', incluido: true },
    ],
  },
]

export default function PlanosPage() {
  const [planoAtual, setPlanoAtual] = useState<string>('')

  useEffect(() => {
    fetch('/api/usuario').then((r) => r.json()).then((u) => setPlanoAtual(u.plano))
  }, [])

  return (
    <div className="max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Planos e Preços</h1>
        <p className="text-gray-500">Escolha o plano ideal para sua jornada de saúde financeira</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((plano) => {
          const checkoutUrl = CAKTO_CHECKOUT_URLS[plano.key]
          const isAtual = planoAtual === plano.key

          return (
            <div
              key={plano.key}
              className={`bg-white rounded-2xl p-6 flex flex-col border-2 transition-all ${
                plano.destaque
                  ? 'border-emerald-500 shadow-lg shadow-emerald-100'
                  : 'border-gray-100'
              }`}
            >
              {plano.destaque && (
                <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                  Mais popular
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-800">{plano.nome}</h2>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-gray-900">{plano.preco}</span>
                <span className="text-gray-400 text-sm">/mês</span>
              </div>
              <p className="text-sm text-gray-500 mb-5">{plano.descricao}</p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plano.recursos.map((r, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    {r.incluido ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${r.incluido ? 'text-gray-700' : 'text-gray-400'}`}>
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>

              {isAtual ? (
                <div className="w-full text-center bg-gray-100 text-gray-500 font-medium py-3 rounded-xl text-sm">
                  Plano atual
                </div>
              ) : (
                <a
                  href={checkoutUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center font-semibold py-3 rounded-xl text-sm transition-colors block ${
                    plano.destaque
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
                >
                  Assinar {plano.nome}
                </a>
              )}
            </div>
          )
        })}
      </div>

      {/* Garantia */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="bg-emerald-100 rounded-xl p-3 flex-shrink-0">
          <Shield className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Garantia de 7 dias</h3>
          <p className="text-sm text-gray-600">
            Se em 7 dias você não ficar satisfeito, devolvemos 100% do seu dinheiro sem perguntas. Você não tem nada a perder — e muito a ganhar na sua saúde financeira.
          </p>
        </div>
      </div>
    </div>
  )
}
