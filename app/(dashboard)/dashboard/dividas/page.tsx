'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

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

const prioridadeOrder: Record<string, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

export default function DividasPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    tipo: 'Cartão de crédito',
    valorTotal: '',
    parcela: '',
    taxaMensal: '',
    mesesRestantes: '',
  })

  async function load() {
    const res = await fetch('/api/dividas')
    const data = await res.json()
    const sorted = (Array.isArray(data) ? data : []).sort(
      (a: Divida, b: Divida) =>
        prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade]
    )
    setDividas(sorted)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/dividas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        tipo: form.tipo,
        valorTotal: parseFloat(form.valorTotal),
        parcela: parseFloat(form.parcela),
        taxaMensal: parseFloat(form.taxaMensal),
        mesesRestantes: parseInt(form.mesesRestantes),
      }),
    })
    setForm({ nome: '', tipo: 'Cartão de crédito', valorTotal: '', parcela: '', taxaMensal: '', mesesRestantes: '' })
    setModalOpen(false)
    setSaving(false)
    await load()
  }

  async function handleDelete(id: string) {
    await fetch('/api/dividas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  const tipos = [
    'Cartão de crédito', 'Cheque especial', 'Empréstimo pessoal',
    'Financiamento', 'Crediário', 'Consignado', 'Outro',
  ]

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{dividas.length} dívida(s) cadastrada(s)</p>
        <button
          onClick={() => setModalOpen(true)}
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
            <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeBadge[d.prioridade]}`}>
                    {d.prioridade}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Nova dívida</h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

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
                    required
                    type="number"
                    value={form.valorTotal}
                    onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                    placeholder="10000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Parcela mensal (R$)</label>
                  <input
                    required
                    type="number"
                    value={form.parcela}
                    onChange={(e) => setForm({ ...form, parcela: e.target.value })}
                    placeholder="500"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Taxa mensal (%)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={form.taxaMensal}
                    onChange={(e) => setForm({ ...form, taxaMensal: e.target.value })}
                    placeholder="5.5"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Meses restantes</label>
                  <input
                    required
                    type="number"
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
                  onClick={() => setModalOpen(false)}
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
    </div>
  )
}
