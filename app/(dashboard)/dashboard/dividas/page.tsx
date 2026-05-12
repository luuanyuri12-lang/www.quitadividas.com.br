'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, X, AlertCircle } from 'lucide-react'

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

const formInicial = {
  nome: '',
  tipo: 'Cartão de crédito',
  valorTotal: '',
  parcela: '',
  taxaMensal: '',
  mesesRestantes: '',
}

export default function DividasPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(formInicial)

  async function carregarDividas() {
    console.log('[dividas] carregando dívidas...')
    try {
      const res = await fetch('/api/dividas')
      console.log('[dividas] status GET:', res.status)
      const data = await res.json()
      console.log('[dividas] dados recebidos:', data)
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

    console.log('[dividas] enviando POST:', payload)

    try {
      const response = await fetch('/api/dividas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('[dividas] status POST:', response.status)

      if (response.ok) {
        const nova = await response.json()
        console.log('[dividas] dívida criada:', nova)
        setForm(formInicial)
        setModalOpen(false)
        await carregarDividas()
      } else {
        const erroData = await response.json()
        console.error('[dividas] erro ao salvar:', erroData)
        setErro('Erro ao salvar dívida. Tente novamente.')
      }
    } catch (err) {
      console.error('[dividas] erro de rede:', err)
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    console.log('[dividas] deletando id:', id)
    try {
      const res = await fetch('/api/dividas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      console.log('[dividas] status DELETE:', res.status)
      await carregarDividas()
    } catch (err) {
      console.error('[dividas] erro ao deletar:', err)
    }
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
                    required
                    type="number"
                    min="0"
                    step="0.01"
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
                    min="0"
                    step="0.01"
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
                    min="0"
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
                    min="1"
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
    </div>
  )
}
