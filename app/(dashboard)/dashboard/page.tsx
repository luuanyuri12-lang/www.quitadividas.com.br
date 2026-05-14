'use client'

import { useState, useEffect } from 'react'
import { calcularIndiceSaude, classificarSaude } from '@/lib/calculos/indiceSaude'
import { calcularCustoOportunidade } from '@/lib/calculos/custoOportunidade'
import {
  TrendingDown, DollarSign, Activity,
  Pencil, ReceiptText, Plus, Trash2, Wallet,
} from 'lucide-react'

interface Divida {
  id: string; nome: string; tipo: string; valorTotal: number
  parcela: number; taxaMensal: number; mesesRestantes: number
  prioridade: string; status: string
}

interface Gasto {
  id: string; descricao: string; valor: number; categoria: string
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CAT_CORES: Record<string, { bg: string; text: string; label: string }> = {
  'Fútil':      { bg: 'bg-red-50',     text: 'text-red-700',     label: '🔴 Fútil' },
  'Útil':       { bg: 'bg-amber-50',   text: 'text-amber-700',   label: '🟡 Útil' },
  'Necessário': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '🟢 Necessário' },
}

export default function DashboardPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [rendaMensal, setRendaMensal] = useState(0)
  const [loading, setLoading] = useState(true)

  // renda editável
  const [editandoRenda, setEditandoRenda] = useState(false)
  const [novaRenda, setNovaRenda] = useState('')
  const [salvandoRenda, setSalvandoRenda] = useState(false)
  const [rendaSalva, setRendaSalva] = useState(false)

  // gasto form — objeto único
  const [novoGasto, setNovoGasto] = useState({ descricao: '', valor: '', categoria: 'Fútil' })
  const [adicionando, setAdicionando] = useState(false)

  async function carregarDados() {
    const [d, r, g] = await Promise.all([
      fetch('/api/dividas').then(res => res.json()),
      fetch('/api/renda').then(res => res.json()),
      fetch('/api/gastos').then(res => res.json()),
    ])
    setDividas(Array.isArray(d) ? d : [])
    setRendaMensal(typeof r?.rendaMensal === 'number' ? r.rendaMensal : 0)
    setGastos(Array.isArray(g) ? g : [])
    setLoading(false)
  }

  useEffect(() => { carregarDados() }, [])

  async function salvarRenda() {
    if (!novaRenda) return
    setSalvandoRenda(true)
    try {
      const res = await fetch('/api/renda', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rendaMensal: Number(novaRenda) }),
      })
      if (res.ok) {
        const data = await res.json()
        setRendaMensal(data.rendaMensal)
        setEditandoRenda(false)
        setRendaSalva(true)
        setTimeout(() => setRendaSalva(false), 2000)
      }
    } finally {
      setSalvandoRenda(false)
    }
  }

  async function adicionarGasto() {
    if (!novoGasto.descricao || !novoGasto.valor) return
    try {
      setAdicionando(true)
      const response = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: novoGasto.descricao,
          valor: Number(novoGasto.valor),
          categoria: novoGasto.categoria || 'Fútil',
        }),
      })
      if (!response.ok) {
        const erro = await response.json()
        console.error('Erro ao adicionar gasto:', erro)
        alert('Erro ao adicionar: ' + (erro.error || 'Tente novamente'))
        return
      }
      const gastoSalvo = await response.json()
      setGastos(prev => [...prev, gastoSalvo])
      setNovoGasto({ descricao: '', valor: '', categoria: 'Fútil' })
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao adicionar gasto')
    } finally {
      setAdicionando(false)
    }
  }

  async function deletarGasto(id: string) {
    await fetch('/api/gastos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setGastos(prev => prev.filter(g => g.id !== id))
  }

  // ─── Cálculos ───
  const totalDividas      = dividas.reduce((s, d) => s + d.valorTotal, 0)
  const totalParcelas     = dividas.reduce((s, d) => s + d.parcela, 0)
  const totalNecessario   = gastos.filter(g => g.categoria === 'Necessário').reduce((s, g) => s + g.valor, 0)
  const totalUtil         = gastos.filter(g => g.categoria === 'Útil').reduce((s, g) => s + g.valor, 0)
  const totalFutil        = gastos.filter(g => g.categoria === 'Fútil').reduce((s, g) => s + g.valor, 0)
  const totalGastos       = totalNecessario + totalUtil + totalFutil
  const sobra             = rendaMensal - totalParcelas - totalNecessario - totalUtil
  const indiceSaude       = calcularIndiceSaude(rendaMensal, totalParcelas)
  const { label: saudeLabel, cor: saudeCor } = classificarSaude(indiceSaude)

  const jurosTotal = dividas.reduce((acc, d) => acc + calcularCustoOportunidade(d.valorTotal, d.taxaMensal, d.mesesRestantes).jurosTotal, 0)
  const custoTotal = dividas.reduce((acc, d) => acc + calcularCustoOportunidade(d.valorTotal, d.taxaMensal, d.mesesRestantes).custoTotal, 0)

  const dividasAtivas = [...dividas.filter(d => d.status === 'ATIVA')]
    .sort((a, b) => ({'ALTA':0,'MEDIA':1,'BAIXA':2}[a.prioridade as 'ALTA'|'MEDIA'|'BAIXA'] ?? 2) - ({'ALTA':0,'MEDIA':1,'BAIXA':2}[b.prioridade as 'ALTA'|'MEDIA'|'BAIXA'] ?? 2))

  const saudeCores:    Record<string, string> = { danger: 'text-red-600', warning: 'text-amber-600', ok: 'text-blue-600', success: 'text-emerald-600' }
  const saudeBarCores: Record<string, string> = { danger: 'bg-red-500',  warning: 'bg-amber-500',  ok: 'bg-blue-500',  success: 'bg-emerald-500' }

  const gastosPorCat = ['Fútil', 'Útil', 'Necessário'].map(cat => ({
    cat,
    items: gastos.filter(g => g.categoria === cat),
    total: gastos.filter(g => g.categoria === cat).reduce((s, g) => s + g.valor, 0),
  }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Carregando...</div></div>

  return (
    <div className="space-y-6">

      {/* ─── MÉTRICAS (4 cards) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-50 rounded-xl p-2"><TrendingDown className="w-5 h-5 text-red-500" /></div>
            <span className="text-sm text-gray-500">Total em Dívidas</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{fmt(totalDividas)}</p>
          <p className="text-xs text-gray-400 mt-1">{dividas.length} dívida(s) ativa(s)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-50 rounded-xl p-2"><DollarSign className="w-5 h-5 text-amber-500" /></div>
            <span className="text-sm text-gray-500">Parcelas Mensais</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{fmt(totalParcelas)}</p>
          <p className="text-xs text-gray-400 mt-1">por mês</p>
        </div>

        {/* Renda Mensal — editável */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-50 rounded-xl p-2"><DollarSign className="w-5 h-5 text-emerald-500" /></div>
            <span className="text-sm text-gray-500">Renda Mensal</span>
          </div>
          {editandoRenda ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={novaRenda}
                onChange={e => setNovaRenda(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && salvarRenda()}
                autoFocus
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button onClick={salvarRenda} disabled={salvandoRenda} className="text-emerald-600 hover:text-emerald-700 font-bold text-lg">✓</button>
              <button onClick={() => setEditandoRenda(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✗</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-800">{fmt(rendaMensal)}</p>
              <button onClick={() => { setNovaRenda(String(rendaMensal)); setEditandoRenda(true) }} className="text-gray-400 hover:text-emerald-600 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              {rendaSalva && <span className="text-xs text-emerald-600 font-medium">Salvo!</span>}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">clique no lápis para editar</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 rounded-xl p-2"><Activity className="w-5 h-5 text-blue-500" /></div>
            <span className="text-sm text-gray-500">Saúde Financeira</span>
          </div>
          <p className={`text-2xl font-bold ${saudeCores[saudeCor]}`}>{indiceSaude}/100</p>
          <p className={`text-xs mt-1 font-medium ${saudeCores[saudeCor]}`}>{saudeLabel}</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
            <div className={`h-1.5 rounded-full transition-all ${saudeBarCores[saudeCor]}`} style={{ width: `${indiceSaude}%` }} />
          </div>
        </div>
      </div>

      {/* ─── SOBRA DA RENDA MENSAL ─── */}
      <div className={`rounded-2xl p-6 border-2 ${sobra >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`rounded-xl p-2 ${sobra >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <Wallet className={`w-5 h-5 ${sobra >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Sobra da Renda Mensal</h2>
            <p className="text-xs text-gray-500">após pagar dívidas e gastos essenciais</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Valor em destaque */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <p className={`text-4xl font-extrabold ${sobra >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {fmt(Math.abs(sobra))}
            </p>
            <p className={`text-sm font-medium mt-1 ${sobra >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {sobra >= 0
                ? `✅ Você tem ${fmt(sobra)} disponíveis por mês`
                : `⚠️ Déficit — você gasta mais do que ganha`}
            </p>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Renda mensal</span>
              <span className="font-semibold text-emerald-700">+ {fmt(rendaMensal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">(−) Parcelas das dívidas</span>
              <span className="font-semibold text-red-600">− {fmt(totalParcelas)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">(−) Gastos necessários</span>
              <span className="font-semibold text-red-600">− {fmt(totalNecessario)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">(−) Gastos úteis</span>
              <span className="font-semibold text-amber-600">− {fmt(totalUtil)}</span>
            </div>
            <div className={`flex justify-between py-1.5 rounded-lg px-2 font-bold ${sobra >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              <span>(=) Sobra da renda</span>
              <span>{fmt(sobra)}</span>
            </div>
            {totalFutil > 0 && (
              <div className="flex justify-between py-1 text-gray-500 text-xs pt-2">
                <span>💡 Gastos fúteis identificados (pode cortar):</span>
                <span className="font-semibold text-red-500">{fmt(totalFutil)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── CUSTO DE OPORTUNIDADE ─── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Custo de Oportunidade das Dívidas</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">Juros totais a pagar</p>
            <p className="text-lg font-bold text-gray-800">{fmt(jurosTotal)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-center">
            <p className="text-xs text-red-500 mb-1">Rendimento perdido</p>
            <p className="text-lg font-bold text-red-600">{fmt(jurosTotal * 0.43)}</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-xl text-center">
            <p className="text-xs text-gray-400 mb-1">Custo real total</p>
            <p className="text-lg font-bold text-white">{fmt(custoTotal)}</p>
          </div>
        </div>
      </div>

      {/* ─── CLASSIFICAÇÃO DE GASTOS ─── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-2"><ReceiptText className="w-5 h-5 text-blue-600" /></div>
          <h2 className="font-semibold text-gray-800">Classificação de Gastos</h2>
        </div>

        {/* Orientação */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-5">
          <p className="text-sm font-semibold text-emerald-800 mb-3">💡 Como classificar seus gastos?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-bold text-red-600 mb-2">🔴 Fútil — Pode cortar agora</p>
              <ul className="text-gray-600 space-y-1">
                <li>• Uber/taxi todo dia</li>
                <li>• Assinaturas que não usa</li>
                <li>• Delivery frequente</li>
                <li>• Compras por impulso</li>
                <li>• Cigarro, bebidas em excesso</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-amber-600 mb-2">🟡 Útil — Pode economizar</p>
              <ul className="text-gray-600 space-y-1">
                <li>• Gasolina (otimize rotas)</li>
                <li>• Plano de celular (reduza)</li>
                <li>• Academia (troque por gratuito)</li>
                <li>• Alimentação fora (reduza)</li>
                <li>• Streaming (compartilhe)</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-emerald-700 mb-2">🟢 Necessário — Não corte</p>
              <ul className="text-gray-600 space-y-1">
                <li>• Aluguel / financiamento</li>
                <li>• Alimentação em casa</li>
                <li>• Água, luz, internet</li>
                <li>• Remédios e saúde</li>
                <li>• Transporte para trabalho</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            value={novoGasto.descricao}
            onChange={e => setNovoGasto(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder="Descrição (ex: Uber para trabalho)"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            value={novoGasto.valor}
            onChange={e => setNovoGasto(prev => ({ ...prev, valor: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && adicionarGasto()}
            placeholder="Valor R$"
            min="0"
            step="0.01"
            className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={novoGasto.categoria}
            onChange={e => setNovoGasto(prev => ({ ...prev, categoria: e.target.value }))}
            className="w-36 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>Fútil</option>
            <option>Útil</option>
            <option>Necessário</option>
          </select>
          <button
            onClick={adicionarGasto}
            disabled={adicionando || !novoGasto.descricao || !novoGasto.valor}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {adicionando ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>

        {/* Resumo por categoria */}
        {totalGastos > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {gastosPorCat.map(({ cat, total }) => {
              const c = CAT_CORES[cat]
              return (
                <div key={cat} className={`${c.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xs font-semibold mb-1 ${c.text}`}>{c.label}</p>
                  <p className={`text-lg font-bold ${c.text}`}>{fmt(total)}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Lista */}
        {gastos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Nenhum gasto cadastrado. Adicione seus gastos acima.</p>
        ) : (
          <div className="space-y-4">
            {gastosPorCat.filter(g => g.items.length > 0).map(({ cat, items, total }) => {
              const c = CAT_CORES[cat]
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${c.text}`}>{c.label}</span>
                    <span className={`text-sm font-bold ${c.text}`}>{fmt(total)}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(g => (
                      <div key={g.id} className={`flex items-center justify-between px-4 py-2.5 ${c.bg} rounded-xl`}>
                        <span className="text-sm text-gray-700">{g.descricao}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${c.text}`}>{fmt(g.valor)}</span>
                          <button onClick={() => deletarGasto(g.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total de gastos</span>
              <span className="text-sm font-bold text-gray-900">{fmt(totalGastos)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── PRIORIDADES ─── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Ações Prioritárias</h2>
        {dividasAtivas.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma dívida cadastrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {dividasAtivas.slice(0, 5).map(d => {
              const progresso = Math.max(0, Math.min(100, 100 - (d.mesesRestantes / 60) * 100))
              const prioridadeCor: Record<string, string> = { ALTA: 'bg-red-100 text-red-700', MEDIA: 'bg-amber-100 text-amber-700', BAIXA: 'bg-green-100 text-green-700' }
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{d.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeCor[d.prioridade]}`}>{d.prioridade}</span>
                        <span className="text-sm font-semibold text-gray-700">{fmt(d.valorTotal)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${progresso}%` }} />
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
