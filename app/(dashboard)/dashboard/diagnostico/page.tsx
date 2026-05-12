'use client'

import { useState } from 'react'
import { calcularIndiceSaude, classificarSaude } from '@/lib/calculos/indiceSaude'
import { calcularCustoOportunidade } from '@/lib/calculos/custoOportunidade'
import { CheckCircle, XCircle } from 'lucide-react'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DiagnosticoPage() {
  const [renda, setRenda] = useState('')
  const [totalDividas, setTotalDividas] = useState('')
  const [parcelas, setParcelas] = useState('')
  const [calculado, setCalculado] = useState(false)

  const [valorOport, setValorOport] = useState('')
  const [taxaOport, setTaxaOport] = useState('')
  const [mesesOport, setMesesOport] = useState('')

  const rendaNum = parseFloat(renda) || 0
  const parcelasNum = parseFloat(parcelas) || 0
  const totalDividasNum = parseFloat(totalDividas) || 0

  const indice = calcularIndiceSaude(rendaNum, parcelasNum)
  const { label, cor } = classificarSaude(indice)
  const comprometimento = rendaNum > 0 ? ((parcelasNum / rendaNum) * 100).toFixed(1) : '0'

  const corBarra: Record<string, string> = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    ok: 'bg-blue-500',
    success: 'bg-emerald-500',
  }
  const corTexto: Record<string, string> = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    ok: 'text-blue-600',
    success: 'text-emerald-600',
  }

  const checklist = [
    {
      ok: parseFloat(comprometimento) <= 30,
      sim: 'Comprometimento abaixo de 30% — ótimo!',
      nao: `${comprometimento}% da renda comprometida com dívidas — alto risco`,
    },
    {
      ok: totalDividasNum <= rendaNum * 6,
      sim: 'Total de dívidas controlado (< 6x a renda mensal)',
      nao: 'Total de dívidas muito alto em relação à renda',
    },
    {
      ok: rendaNum > 0,
      sim: 'Possui fonte de renda ativa',
      nao: 'Sem renda cadastrada — situação crítica',
    },
    {
      ok: parcelasNum < rendaNum,
      sim: 'Parcelas menores que a renda',
      nao: 'Parcelas ultrapassam a renda — emergência financeira',
    },
    {
      ok: totalDividasNum < rendaNum * 12,
      sim: 'Dívidas possíveis de quitar em 12 meses com esforço',
      nao: 'Dívidas altas demais — necessário plano de longo prazo',
    },
  ]

  const oport =
    valorOport && taxaOport && mesesOport
      ? calcularCustoOportunidade(
          parseFloat(valorOport),
          parseFloat(taxaOport),
          parseInt(mesesOport)
        )
      : null

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Formulário */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Insira seus dados financeiros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Renda mensal (R$)</label>
            <input
              type="number"
              value={renda}
              onChange={(e) => setRenda(e.target.value)}
              placeholder="3000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Total de dívidas (R$)</label>
            <input
              type="number"
              value={totalDividas}
              onChange={(e) => setTotalDividas(e.target.value)}
              placeholder="15000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Parcelas mensais (R$)</label>
            <input
              type="number"
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
              placeholder="1200"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <button
          onClick={() => setCalculado(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Calcular diagnóstico
        </button>
      </div>

      {/* Resultado */}
      {calculado && (
        <>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Índice de Saúde Financeira</h2>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-3xl font-bold ${corTexto[cor]}`}>{indice}/100</span>
              <span className={`text-lg font-semibold ${corTexto[cor]}`}>{label}</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full mb-3">
              <div
                className={`h-4 rounded-full transition-all ${corBarra[cor]}`}
                style={{ width: `${indice}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {parseFloat(comprometimento)}% da sua renda está comprometida com parcelas.{' '}
              {parseFloat(comprometimento) > 30
                ? 'Isso é preocupante — o ideal é manter abaixo de 30%.'
                : 'Dentro do limite saudável (até 30%).'}
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Checklist de Saúde Financeira</h2>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.ok ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${item.ok ? 'text-gray-700' : 'text-red-600'}`}>
                    {item.ok ? item.sim : item.nao}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Calculadora custo oportunidade */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Calculadora de Custo de Oportunidade</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Valor da dívida (R$)</label>
            <input
              type="number"
              value={valorOport}
              onChange={(e) => setValorOport(e.target.value)}
              placeholder="10000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Taxa mensal (%)</label>
            <input
              type="number"
              value={taxaOport}
              onChange={(e) => setTaxaOport(e.target.value)}
              placeholder="5.5"
              step="0.1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Prazo (meses)</label>
            <input
              type="number"
              value={mesesOport}
              onChange={(e) => setMesesOport(e.target.value)}
              placeholder="24"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {oport && (
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-600 mb-1">Juros totais</p>
              <p className="font-bold text-amber-700">{fmt(oport.jurosTotal)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-red-600 mb-1">Rendimento perdido</p>
              <p className="font-bold text-red-700">{fmt(oport.rendimentoPerdido)}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Custo real total</p>
              <p className="font-bold text-white">{fmt(oport.custoTotal)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
