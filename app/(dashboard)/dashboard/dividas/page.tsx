'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, X, AlertCircle, Pencil } from 'lucide-react'

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

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const prioridadeBadge: Record<string, string> = {
  ALTA: 'bg-red-100 text-red-700',
  MEDIA: 'bg-amber-100 text-amber-700',
  BAIXA: 'bg-green-100 text-green-700',
}

const statusBadge: Record<string, string> = {
  ATIVA: 'bg-blue-100 text-blue-700',
  RENEGOCIADA: 'bg-amber-100 text-amber-700',
  QUITADA: 'bg-green-100 text-green-700',
}

const prioridadeOrder: Record<string, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

const formInicial = {
  nome: '',
  tipo: 'Cartão de crédito',
  valorTotal: '',
  parcela: '',
  taxaMensal: '',
  mesesRestantes: '',
}

const tipos = [
  'Cartão de crédito', 'Cheque especial', 'Empréstimo pessoal',
  'Financiamento', 'Crediário', 'Consignado', 'Outro',
]

export default function DividasPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(formInicial)

  const [dividaEditando, setDividaEditando] = useState<Divida | null>(null)
  const [formEdicao, setFormEdicao] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)

  async function carregarDividas() {
    try {
      const res = await fetch('/api/dividas')
      const data = await res.json()
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a: Divida, b: Divida) =>
          prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade]
      )
      setDividas(sorted)
    } catch (err) {
      console.error('[dividas] erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDividas()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')

    const payload = {
      nome: form.nome,
      tipo: form.tipo,
      valorTotal: Number(form.valorTotal),
      parcela: Number(form.parcela),
      taxaMensal: Number(form.taxaMensal),
      mesesRestantes: Number(form.mesesRestantes),
    }

    try {
      const response = await fetch('/api/dividas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setForm(formInicial)
        setModalOpen(false)
        await carregarDividas()
      } else {
        setErro('Erro: ' + (data.error || data.detail || JSON.stringify(data)))
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function editarDivida(e: React.FormEvent) {
    e.preventDefault()
    if (!dividaEditando) return
    setSalvando(true)

    const payload = {
      id: dividaEditando.id,
      nome: formEdicao.nome,
      tipo: formEdicao.tipo,
      valorTotal: Number(formEdicao.valorTotal),
      parcela: Number(formEdicao.parcela),
      taxaMensal: Number(formEdicao.taxaMensal),
      mesesRestantes: Number(formEdicao.mesesRestantes),
    }

    try {
      const res = await fetch('/api/dividas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setDividaEditando(null)
        await carregarDividas()
      }
    } catch (err) {
      console.error('[dividas] erro ao editar:', err)
    } finally {
      setSalvando(false)
    }
  }

  async function alterarStatus(id: string, status: string) {
    try {
      await fetch('/api/dividas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      await carregarDividas()
    } catch (err) {
      console.error('[dividas] erro ao alterar status:', err)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch('/api/dividas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await carregarDividas()
    } catch (err) {
      console.error('[dividas] erro ao deletar:', err)
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{dividas.length} dívida(s) cadastrada(s)</p>
        <button
          onClick={() => { setModalOpen(true); setErro('') }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar dívida
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : dividas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-400 mb-2">Nenhuma dívida cadastrada</p>
          <p className="text-gray-400 text-sm">Adicione suas dívidas para começar o plano de quitação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dividas.map((d) => (
            <div
              key={d.id}
              className={`bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-4 transition-opacity ${d.status === 'QUITADA' ? 'opacity-60' : ''}`}
            >
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Dívida</p>
                  <p className="font-semibold text-gray-800 text-sm">{d.nome}</p>
                  <p className="text-xs text-gray-400">{d.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Valor total</p>
                  <p className="font-semibold text-red-600 text-sm">{fmt(d.valorTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Parcela</p>
                  <p className="font-semibold text-gray-800 text-sm">{fmt(d.parcela)}/mês</p>
                  <p className="text-xs text-gray-400">{d.taxaMensal}% a.m.</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Restante</p>
                  <p className="font-semibold text-gray-800 text-sm">{d.mesesRestantes} meses</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeBadge[d.prioridade]}`}>
                      {d.prioridade}
                    </span>
                    {d.status === 'QUITADA' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                        Quitada
                      </span>
                    )}
                    {d.status === 'RENEGOCIADA' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                        Renegociada
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setDividaEditando(d)
                      setFormEdicao({
                        nome: d.nome,
                        tipo: d.tipo,
                        valorTotal: String(d.valorTotal),
                        parcela: String(d.parcela),
                        taxaMensal: String(d.taxaMensal),
                        mesesRestantes: String(d.mesesRestantes),
                      })
                    }}
                    className="text-gray-300 hover:text-emerald-500 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={d.status}
                  onChange={(e) => alterarStatus(d.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="ATIVA">Ativa</option>
                  <option value="RENEGOCIADA">Renegociada</option>
                  <option value="QUITADA">Quitada</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Nova dívida</h2>
              <button onClick={() => { setModalOpen(false); setErro('') }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {erro && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {erro}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Nome da dívida</label>
                  <input
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Cartão Nubank"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {tipos.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor total (R$)</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={form.valorTotal}
                    onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                    placeholder="10000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Parcela mensal (R$)</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={form.parcela}
                    onChange={(e) => setForm({ ...form, parcela: e.target.value })}
                    placeholder="500"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Taxa mensal (%)</label>
                  <input
                    required type="number" min="0" step="0.1"
                    value={form.taxaMensal}
                    onChange={(e) => setForm({ ...form, taxaMensal: e.target.value })}
                    placeholder="5.5"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Meses restantes</label>
                  <input
                    required type="number" min="1"
                    value={form.mesesRestantes}
                    onChange={(e) => setForm({ ...form, mesesRestantes: e.target.value })}
                    placeholder="24"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setErro('') }}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {saving ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {dividaEditando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Editar dívida</h2>
              <button onClick={() => setDividaEditando(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={editarDivida} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Nome da dívida</label>
                  <input
                    required
                    value={formEdicao.nome}
                    onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    value={formEdicao.tipo}
                    onChange={(e) => setFormEdicao({ ...formEdicao, tipo: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {tipos.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor total (R$)</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={formEdicao.valorTotal}
                    onChange={(e) => setFormEdicao({ ...formEdicao, valorTotal: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Parcela mensal (R$)</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={formEdicao.parcela}
                    onChange={(e) => setFormEdicao({ ...formEdicao, parcela: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Taxa mensal (%)</label>
                  <input
                    required type="number" min="0" step="0.1"
                    value={formEdicao.taxaMensal}
                    onChange={(e) => setFormEdicao({ ...formEdicao, taxaMensal: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Meses restantes</label>
                  <input
                    required type="number" min="1"
                    value={formEdicao.mesesRestantes}
                    onChange={(e) => setFormEdicao({ ...formEdicao, mesesRestantes: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDividaEditando(null)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
