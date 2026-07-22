'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Building2, TrendingUp, TrendingDown, Wallet, Percent } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

interface Conta {
  id: string
  nome: string
  cnpj: string | null
  setor: string | null
}

interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: string
  categoria: string
  data: string
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const categorias = ['Vendas', 'Serviços', 'Fornecedores', 'Folha de pagamento', 'Impostos', 'Marketing', 'Aluguel', 'Outros']

export default function EmpresarialPage() {
  const [conta, setConta] = useState<Conta | null>(null)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [carregando, setCarregando] = useState(true)

  const [formEmpresa, setFormEmpresa] = useState({ nome: '', cnpj: '', setor: '' })
  const [criandoEmpresa, setCriandoEmpresa] = useState(false)

  const [modalLancamento, setModalLancamento] = useState(false)
  const [formLancamento, setFormLancamento] = useState({
    descricao: '', valor: '', tipo: 'Receita', categoria: categorias[0],
  })
  const [salvandoLancamento, setSalvandoLancamento] = useState(false)

  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'Receita' | 'Despesa'>('TODOS')

  async function carregar() {
    setCarregando(true)
    try {
      const resConta = await fetch('/api/empresarial')
      const dataConta = await resConta.json()
      setConta(dataConta)

      if (dataConta) {
        const resLanc = await fetch('/api/empresarial/lancamentos')
        const dataLanc = await resLanc.json()
        setLancamentos(Array.isArray(dataLanc) ? dataLanc : [])
      }
    } catch (err) {
      console.error('[empresarial] erro ao carregar:', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function criarEmpresa(e: React.FormEvent) {
    e.preventDefault()
    setCriandoEmpresa(true)
    try {
      const res = await fetch('/api/empresarial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEmpresa),
      })
      if (res.ok) {
        const nova = await res.json()
        setConta(nova)
      }
    } catch (err) {
      console.error('[empresarial] erro ao criar empresa:', err)
    } finally {
      setCriandoEmpresa(false)
    }
  }

  async function adicionarLancamento(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoLancamento(true)
    try {
      const res = await fetch('/api/empresarial/lancamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: formLancamento.descricao,
          valor: Number(formLancamento.valor),
          tipo: formLancamento.tipo,
          categoria: formLancamento.categoria,
        }),
      })
      if (res.ok) {
        const novo = await res.json()
        setLancamentos((prev) => [novo, ...prev])
        setModalLancamento(false)
        setFormLancamento({ descricao: '', valor: '', tipo: 'Receita', categoria: categorias[0] })
      }
    } catch (err) {
      console.error('[empresarial] erro ao adicionar lançamento:', err)
    } finally {
      setSalvandoLancamento(false)
    }
  }

  async function excluirLancamento(id: string) {
    try {
      await fetch('/api/empresarial/lancamentos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setLancamentos((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      console.error('[empresarial] erro ao excluir lançamento:', err)
    }
  }

  const totalReceitas = useMemo(
    () => lancamentos.filter((l) => l.tipo === 'Receita').reduce((s, l) => s + l.valor, 0),
    [lancamentos]
  )
  const totalDespesas = useMemo(
    () => lancamentos.filter((l) => l.tipo === 'Despesa').reduce((s, l) => s + l.valor, 0),
    [lancamentos]
  )
  const lucroLiquido = totalReceitas - totalDespesas
  const margem = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0

  const dadosGrafico = useMemo(() => {
    const porMes: Record<string, { mes: string; Receitas: number; Despesas: number }> = {}
    for (const l of lancamentos) {
      const d = new Date(l.data)
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (!porMes[chave]) porMes[chave] = { mes: label, Receitas: 0, Despesas: 0 }
      if (l.tipo === 'Receita') porMes[chave].Receitas += l.valor
      else porMes[chave].Despesas += l.valor
    }
    return Object.keys(porMes).sort().map((k) => porMes[k])
  }, [lancamentos])

  const lancamentosFiltrados = filtroTipo === 'TODOS'
    ? lancamentos
    : lancamentos.filter((l) => l.tipo === filtroTipo)

  if (carregando) {
    return <div className="text-gray-400 text-sm">Carregando...</div>
  }

  if (!conta) {
    return (
      <div className="max-w-lg">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <div className="bg-emerald-50 rounded-xl p-3 w-fit mb-4">
            <Building2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-gray-800 mb-1">Módulo Empresarial</h2>
          <p className="text-sm text-gray-500">
            Organize as finanças do seu negócio separado das suas finanças pessoais.
            Cadastre lançamentos de receitas e despesas e acompanhe o lucro líquido e a margem do seu negócio.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Cadastre sua empresa</h3>
          <form onSubmit={criarEmpresa} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome da empresa</label>
              <input
                required
                value={formEmpresa.nome}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, nome: e.target.value })}
                placeholder="Ex: Padaria do João"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">CNPJ (opcional)</label>
              <input
                value={formEmpresa.cnpj}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Setor (opcional)</label>
              <input
                value={formEmpresa.setor}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, setor: e.target.value })}
                placeholder="Ex: Alimentação, Varejo, Serviços..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={criandoEmpresa}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {criandoEmpresa ? 'Criando...' : 'Criar empresa'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">{conta.nome}</h2>
          <p className="text-sm text-gray-400">{conta.setor || 'Sem setor definido'}{conta.cnpj ? ` · ${conta.cnpj}` : ''}</p>
        </div>
        <button
          onClick={() => setModalLancamento(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo lançamento
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <p className="text-xs text-gray-500">Receitas</p>
          </div>
          <p className="text-lg font-bold text-emerald-700">{fmt(totalReceitas)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <TrendingDown className="w-4 h-4" />
            <p className="text-xs text-gray-500">Despesas</p>
          </div>
          <p className="text-lg font-bold text-red-600">{fmt(totalDespesas)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Wallet className="w-4 h-4" />
            <p className="text-xs text-gray-500">Lucro líquido</p>
          </div>
          <p className={`text-lg font-bold ${lucroLiquido >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{fmt(lucroLiquido)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Percent className="w-4 h-4" />
            <p className="text-xs text-gray-500">Margem</p>
          </div>
          <p className="text-lg font-bold text-gray-800">{margem.toFixed(1)}%</p>
        </div>
      </div>

      {/* Gráfico */}
      {dadosGrafico.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Receitas vs Despesas por mês</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend />
                <Bar dataKey="Receitas" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lista de lançamentos */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">Lançamentos</h3>
          <div className="flex gap-1">
            {(['TODOS', 'Receita', 'Despesa'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltroTipo(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filtroTipo === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f === 'TODOS' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>

        {lancamentosFiltrados.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Nenhum lançamento por aqui ainda.</p>
        ) : (
          <div className="space-y-2">
            {lancamentosFiltrados.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{l.descricao}</p>
                  <p className="text-xs text-gray-400">
                    {l.categoria} · {new Date(l.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${l.tipo === 'Receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {l.tipo === 'Receita' ? '+' : '-'}{fmt(l.valor)}
                  </span>
                  <button
                    onClick={() => excluirLancamento(l.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo lançamento */}
      {modalLancamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 mb-5">Novo lançamento</h2>
            <form onSubmit={adicionarLancamento} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                <input
                  required
                  value={formLancamento.descricao}
                  onChange={(e) => setFormLancamento({ ...formLancamento, descricao: e.target.value })}
                  placeholder="Ex: Venda de produtos"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor (R$)</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={formLancamento.valor}
                    onChange={(e) => setFormLancamento({ ...formLancamento, valor: e.target.value })}
                    placeholder="500"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    value={formLancamento.tipo}
                    onChange={(e) => setFormLancamento({ ...formLancamento, tipo: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                <select
                  value={formLancamento.categoria}
                  onChange={(e) => setFormLancamento({ ...formLancamento, categoria: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categorias.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLancamento(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoLancamento}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {salvandoLancamento ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
