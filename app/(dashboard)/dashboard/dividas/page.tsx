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

interface Pagamento {
  id: string
  dividaId: string
  valor: number
  data: string
  comprovante: string | null
  createdAt: string
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

  const [modalRenegociacao, setModalRenegociacao] = useState(false)
  const [dividaRenegociando, setDividaRenegociando] = useState<Divida | null>(null)
  const [formRenegociacao, setFormRenegociacao] = useState({
    valorTotal: '',
    parcela: '',
    taxaMensal: '',
    mesesRestantes: '',
  })

  const [modalPagamento, setModalPagamento] = useState(false)
  const [dividaPagando, setDividaPagando] = useState<Divida | null>(null)
  const [formPagamento, setFormPagamento] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    comprovante: '',
    comprovanteFile: null as File | null,
    comprovantePreview: '',
  })
  const [uploadando, setUploadando] = useState(false)
  const [salvandoPagamento, setSalvandoPagamento] = useState(false)

  const [modalHistorico, setModalHistorico] = useState(false)
  const [dividaHistorico, setDividaHistorico] = useState<Divida | null>(null)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [carregandoPagamentos, setCarregandoPagamentos] = useState(false)
  const [comprovanteVisualizando, setComprovanteVisualizando] = useState<string | null>(null)

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

  async function mudarStatus(divida: Divida, novoStatus: string) {
    if (novoStatus === 'RENEGOCIADA') {
      setDividaRenegociando(divida)
      setFormRenegociacao({
        valorTotal: String(divida.valorTotal),
        parcela: String(divida.parcela),
        taxaMensal: String(divida.taxaMensal),
        mesesRestantes: String(divida.mesesRestantes),
      })
      setModalRenegociacao(true)
      return
    }
    await fetch('/api/dividas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: divida.id, status: novoStatus }),
    })
    setDividas(prev => prev.map(d => d.id === divida.id ? { ...d, status: novoStatus } : d))
  }

  async function abrirHistorico(divida: Divida) {
    setDividaHistorico(divida)
    setModalHistorico(true)
    setCarregandoPagamentos(true)
    try {
      const res = await fetch('/api/pagamentos?dividaId=' + divida.id)
      const data = await res.json()
      setPagamentos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setCarregandoPagamentos(false)
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
              className={`bg-white rounded-2xl p-5 border border-gray-100 transition-opacity ${d.status === 'QUITADA' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
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
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
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
                  onChange={(e) => mudarStatus(d, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="ATIVA">Ativa</option>
                  <option value="RENEGOCIADA">Renegociada</option>
                  <option value="QUITADA">Quitada</option>
                </select>
              </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                <button
                  onClick={() => {
                    setDividaPagando(d)
                    setFormPagamento({
                      valor: String(d.parcela),
                      data: new Date().toISOString().split('T')[0],
                      comprovante: '',
                      comprovanteFile: null,
                      comprovantePreview: '',
                    })
                    setModalPagamento(true)
                  }}
                  style={{
                    flex: 1, padding: '8px 12px', background: '#E1F5EE',
                    border: '1px solid #1D9E75', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, color: '#0F6E56', fontWeight: 500
                  }}
                >
                  ✓ Paguei a parcela
                </button>
                <button
                  onClick={() => abrirHistorico(d)}
                  style={{
                    flex: 1, padding: '8px 12px', background: '#f5f5f5',
                    border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, color: '#555'
                  }}
                >
                  📋 Ver histórico
                </button>
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

      {/* Modal Pagamento */}
      {modalPagamento && dividaPagando && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 480, margin: '0 16px'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              Registrar Pagamento 💸
            </h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
              {dividaPagando.nome}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Valor pago (R$)
                </label>
                <input
                  type="number"
                  value={formPagamento.valor}
                  onChange={e => setFormPagamento(p => ({ ...p, valor: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
                <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  Parcela mensal: R$ {dividaPagando.parcela?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Data do pagamento
                </label>
                <input
                  type="date"
                  value={formPagamento.data}
                  onChange={e => setFormPagamento(p => ({ ...p, data: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Comprovante (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setFormPagamento(p => ({ ...p, comprovanteFile: file }))
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader()
                      reader.onload = (ev) => {
                        setFormPagamento(p => ({ ...p, comprovantePreview: ev.target?.result as string }))
                      }
                      reader.readAsDataURL(file)
                    } else {
                      setFormPagamento(p => ({ ...p, comprovantePreview: '' }))
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px dashed #ddd', borderRadius: 8, fontSize: 13, color: '#666' }}
                />
                {formPagamento.comprovantePreview && (
                  <img
                    src={formPagamento.comprovantePreview}
                    alt="Preview"
                    style={{ marginTop: 8, maxHeight: 120, borderRadius: 8, border: '1px solid #ddd' }}
                  />
                )}
                {formPagamento.comprovanteFile && !formPagamento.comprovantePreview && (
                  <p style={{ fontSize: 12, color: '#1D9E75', marginTop: 4 }}>
                    📄 {formPagamento.comprovanteFile.name}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => {
                  setModalPagamento(false)
                  setFormPagamento({ valor: '', data: new Date().toISOString().split('T')[0], comprovante: '', comprovanteFile: null, comprovantePreview: '' })
                }}
                style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14 }}
              >
                Cancelar
              </button>
              <button
                disabled={salvandoPagamento}
                onClick={async () => {
                  if (!formPagamento.valor) return
                  setSalvandoPagamento(true)
                  try {
                    let comprovanteUrl = ''
                    if (formPagamento.comprovanteFile) {
                      setUploadando(true)
                      const fd = new FormData()
                      fd.append('file', formPagamento.comprovanteFile)
                      const uploadRes = await fetch('/api/pagamentos/comprovante', { method: 'POST', body: fd })
                      if (uploadRes.ok) {
                        const uploadData = await uploadRes.json()
                        comprovanteUrl = uploadData.url
                      }
                      setUploadando(false)
                    }

                    const response = await fetch('/api/pagamentos', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        dividaId: dividaPagando.id,
                        valor: Number(formPagamento.valor),
                        data: formPagamento.data,
                        comprovante: comprovanteUrl || null,
                      }),
                    })

                    if (response.ok) {
                      setDividas(prev => prev.map(d => {
                        if (d.id === dividaPagando.id) {
                          return {
                            ...d,
                            valorTotal: Math.max(0, d.valorTotal - Number(formPagamento.valor)),
                            mesesRestantes: Math.max(0, d.mesesRestantes - 1),
                          }
                        }
                        return d
                      }))
                      setModalPagamento(false)
                      setFormPagamento({ valor: '', data: new Date().toISOString().split('T')[0], comprovante: '', comprovanteFile: null, comprovantePreview: '' })
                      alert('✅ Pagamento registrado! Continue assim, você está no caminho certo!')
                    }
                  } catch {
                    alert('Erro ao registrar pagamento')
                  } finally {
                    setSalvandoPagamento(false)
                  }
                }}
                style={{
                  flex: 1, padding: 12, border: 'none', borderRadius: 8,
                  background: '#1D9E75', cursor: 'pointer', fontSize: 14,
                  color: 'white', fontWeight: 600,
                  opacity: salvandoPagamento ? 0.7 : 1
                }}
              >
                {salvandoPagamento ? (uploadando ? 'Enviando comprovante...' : 'Salvando...') : 'Confirmar pagamento ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {modalHistorico && dividaHistorico && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 520, margin: '0 16px',
            maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Histórico de Pagamentos</h2>
                <p style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{dividaHistorico.nome}</p>
              </div>
              <button
                onClick={() => setModalHistorico(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}
              >
                ✕
              </button>
            </div>

            {carregandoPagamentos ? (
              <p style={{ textAlign: 'center', color: '#666', padding: 32 }}>Carregando...</p>
            ) : pagamentos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: 32 }}>
                Nenhum pagamento registrado ainda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pagamentos.map((p) => (
                  <div key={p.id} style={{
                    padding: '14px 16px', background: '#f9f9f9',
                    borderRadius: 10, border: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: '#E1F5EE', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: 18,
                          flexShrink: 0
                        }}>
                          💸
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>
                            R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            📅 {new Date(p.data).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'long', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.comprovante ? (
                          <button
                            onClick={() => setComprovanteVisualizando(p.comprovante)}
                            style={{
                              fontSize: 12, color: '#1D9E75', background: '#E1F5EE',
                              border: '1px solid #1D9E75', borderRadius: 6,
                              padding: '5px 10px', cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            📎 Ver comprovante
                          </button>
                        ) : (
                          <span style={{
                            fontSize: 11, color: '#999', padding: '5px 10px',
                            background: '#f0f0f0', borderRadius: 6
                          }}>
                            Sem comprovante
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop: 8, padding: '12px 16px', background: '#E1F5EE',
                  borderRadius: 10, textAlign: 'center'
                }}>
                  <p style={{ fontSize: 13, color: '#0F6E56', fontWeight: 500 }}>
                    Total pago: R$ {pagamentos.reduce((s, p) => s + Number(p.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Visualização Comprovante */}
      {comprovanteVisualizando && (
        <div
          onClick={() => setComprovanteVisualizando(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, cursor: 'zoom-out'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 16, padding: 24,
              maxWidth: 600, width: '100%', margin: '0 16px',
              maxHeight: '90vh', overflowY: 'auto', cursor: 'default'
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Comprovante de Pagamento</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={comprovanteVisualizando}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12, color: '#1D9E75', textDecoration: 'none',
                    padding: '6px 12px', border: '1px solid #1D9E75',
                    borderRadius: 6, fontWeight: 500
                  }}
                >
                  ↗ Abrir em nova aba
                </a>
                <button
                  onClick={() => setComprovanteVisualizando(null)}
                  style={{
                    background: '#f5f5f5', border: 'none', borderRadius: 6,
                    padding: '6px 12px', cursor: 'pointer', fontSize: 14, color: '#555'
                  }}
                >
                  ✕ Fechar
                </button>
              </div>
            </div>

            {comprovanteVisualizando.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={comprovanteVisualizando}
                style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }}
                title="Comprovante PDF"
              />
            ) : (
              <img
                src={comprovanteVisualizando}
                alt="Comprovante"
                style={{
                  width: '100%', borderRadius: 8,
                  border: '1px solid #eee', maxHeight: 600,
                  objectFit: 'contain'
                }}
              />
            )}

            <div style={{
              marginTop: 16, padding: '10px 14px', background: '#f9f9f9',
              borderRadius: 8, fontSize: 12, color: '#666', textAlign: 'center'
            }}>
              Clique fora do comprovante para fechar
            </div>
          </div>
        </div>
      )}

      {/* Modal Renegociação */}
      {modalRenegociacao && dividaRenegociando && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 500, margin: '0 16px'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Dívida Renegociada 🤝
            </h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              Ótimo! Informe os novos valores após a renegociação de <strong>{dividaRenegociando.nome}</strong>:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Novo valor total (R$)
                </label>
                <input
                  type="number"
                  value={formRenegociacao.valorTotal}
                  onChange={e => setFormRenegociacao(p => ({ ...p, valorTotal: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
                {dividaRenegociando.valorTotal && formRenegociacao.valorTotal && (
                  <p style={{ fontSize: 11, color: '#1D9E75', marginTop: 4 }}>
                    💰 Desconto: R$ {(dividaRenegociando.valorTotal - Number(formRenegociacao.valorTotal)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Nova parcela mensal (R$)
                </label>
                <input
                  type="number"
                  value={formRenegociacao.parcela}
                  onChange={e => setFormRenegociacao(p => ({ ...p, parcela: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Nova taxa de juros (% a.m.)
                </label>
                <input
                  type="number"
                  value={formRenegociacao.taxaMensal}
                  onChange={e => setFormRenegociacao(p => ({ ...p, taxaMensal: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
                  Novos meses restantes
                </label>
                <input
                  type="number"
                  value={formRenegociacao.mesesRestantes}
                  onChange={e => setFormRenegociacao(p => ({ ...p, mesesRestantes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setModalRenegociacao(false)}
                style={{
                  flex: 1, padding: '12px', border: '1px solid #ddd',
                  borderRadius: 8, background: 'white', cursor: 'pointer',
                  fontSize: 14, color: '#333'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const response = await fetch('/api/dividas', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: dividaRenegociando.id,
                      status: 'RENEGOCIADA',
                      valorTotal: Number(formRenegociacao.valorTotal),
                      parcela: Number(formRenegociacao.parcela),
                      taxaMensal: Number(formRenegociacao.taxaMensal),
                      mesesRestantes: Number(formRenegociacao.mesesRestantes),
                    })
                  })
                  if (response.ok) {
                    const atualizada = await response.json()
                    setDividas(prev => prev.map(d => d.id === atualizada.id ? atualizada : d))
                    setModalRenegociacao(false)
                    const economia = dividaRenegociando.valorTotal - Number(formRenegociacao.valorTotal)
                    if (economia > 0) {
                      alert(`🎉 Parabéns! Você economizou R$ ${economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com essa renegociação!`)
                    }
                  }
                }}
                style={{
                  flex: 1, padding: '12px', border: 'none',
                  borderRadius: 8, background: '#1D9E75', cursor: 'pointer',
                  fontSize: 14, color: 'white', fontWeight: 600
                }}
              >
                Confirmar renegociação ✓
              </button>
            </div>
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
