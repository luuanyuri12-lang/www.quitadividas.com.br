'use client'

import { useState, useEffect } from 'react'
import { calcularIndiceSaude, classificarSaude } from '@/lib/calculos/indiceSaude'
import { calcularCustoOportunidade } from '@/lib/calculos/custoOportunidade'
import { TrendingDown, DollarSign, Activity, AlertCircle, CheckCircle } from 'lucide-react'

interface Divida {
  id: string
  nome: string
  tipo: string
  valorTotal: number
  parcela: number
  taxaMensal: number
  mesesRestantes: number
  prioridade: string
  status: string
}

interface Receita {
  id: string
  valor: number
  tipo: string
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dividas').then((r) => r.json()),
      fetch('/api/receitas').then((r) => r.json()),
    ]).then(([d, r]) => {
      setDividas(Array.isArray(d) ? d : [])
      setReceitas(Array.isArray(r) ? r : [])
      setLoading(false)
    })
  }, [])

  const totalDividas = dividas.reduce((s, d) => s + d.valorTotal, 0)
  const totalParcelas = dividas.reduce((s, d) => s + d.parcela, 0)
  const rendaMensal = receitas.reduce((s, r) => s + r.valor, 0)
  const indiceSaude = calcularIndiceSaude(rendaMensal, totalParcelas)
  const { label: saudeLabel, cor: saudeCor } = classificarSaude(indiceSaude)

  const saudeCores: Record<string, string> = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    ok: 'text-blue-600',
    success: 'text-emerald-600',
  }

  const saudeBarCores: Record<string, string> = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    ok: 'bg-blue-500',
    success: 'bg-emerald-500',
  }

  const custoTotal = dividas.reduce((acc, d) => {
    const { custoTotal } = calcularCustoOportunidade(d.valorTotal, d.taxaMensal, d.mesesRestantes)
    return acc + custoTotal
  }, 0)

  const jurosTotal = dividas.reduce((acc, d) => {
    const { jurosTotal } = calcularCustoOportunidade(d.valorTotal, d.taxaMensal, d.mesesRestantes)
    return acc + jurosTotal
  }, 0)

  const dividasAtivas = dividas.filter((d) => d.status === 'ATIVA')
  const dividasOrdenadas = [...dividasAtivas].sort((a, b) => {
    const order = { ALTA: 0, MEDIA: 1, BAIXA: 2 }
    return order[a.prioridade as keyof typeof order] - order[b.prioridade as keyof typeof order]
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-50 rounded-xl p-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-gray-500">Total em Dívidas</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{fmt(totalDividas)}</p>
          <p className="text-xs text-gray-400 mt-1">{dividas.length} dívidas ativas</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-50 rounded-xl p-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm text-gray-500">Parcelas Mensais</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{fmt(totalParcelas)}</p>
          <p className="text-xs text-gray-400 mt-1">por mês</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-50 rounded-xl p-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm text-gray-500">Renda Mensal</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{fmt(rendaMensal)}</p>
          <p className="text-xs text-gray-400 mt-1">{receitas.length} fontes de renda</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 rounded-xl p-2">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">Saúde Financeira</span>
          </div>
          <p className={`text-2xl font-bold ${saudeCores[saudeCor]}`}>
            {indiceSaude}/100
          </p>
          <p className={`text-xs mt-1 font-medium ${saudeCores[saudeCor]}`}>{saudeLabel}</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
            <div
              className={`h-1.5 rounded-full transition-all ${saudeBarCores[saudeCor]}`}
              style={{ width: `${indiceSaude}%` }}
            />
          </div>
        </div>
      </div>

      {/* Painéis centrais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classificação de gastos */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Classificação de Gastos</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Fútil (juros)</span>
              </div>
              <span className="font-bold text-red-600">{fmt(jurosTotal)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Útil (parcelas)</span>
              </div>
              <span className="font-bold text-amber-600">{fmt(totalParcelas)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Necessário (livre)</span>
              </div>
              <span className="font-bold text-emerald-600">
                {fmt(Math.max(0, rendaMensal - totalParcelas))}
              </span>
            </div>
          </div>
        </div>

        {/* Custo de oportunidade */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Custo de Oportunidade</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Juros totais a pagar</p>
              <p className="text-xl font-bold text-gray-800">{fmt(jurosTotal)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-red-500 mb-1">Rendimento perdido (equiv. Tesouro)</p>
              <p className="text-xl font-bold text-red-600">{fmt(jurosTotal * 0.43)}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Custo total real</p>
              <p className="text-xl font-bold text-white">{fmt(custoTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas ações */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Ações Prioritárias</h2>
        {dividasOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma dívida cadastrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {dividasOrdenadas.slice(0, 5).map((d) => {
              const progresso = Math.max(
                0,
                Math.min(100, 100 - (d.mesesRestantes / 60) * 100)
              )
              const prioridadeCor: Record<string, string> = {
                ALTA: 'bg-red-100 text-red-700',
                MEDIA: 'bg-amber-100 text-amber-700',
                BAIXA: 'bg-green-100 text-green-700',
              }
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{d.nome}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            prioridadeCor[d.prioridade]
                          }`}
                        >
                          {d.prioridade}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {fmt(d.valorTotal)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{fmt(d.parcela)}/mês</span>
                      <span className="text-xs text-gray-400">{d.mesesRestantes} meses restantes</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
