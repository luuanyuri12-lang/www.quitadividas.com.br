'use client'
import { useState, useEffect } from 'react'

export default function IndicacoesPage() {
  const [dados, setDados] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [modalSaque, setModalSaque] = useState(false)
  const [formSaque, setFormSaque] = useState({ valor: '', pixKey: '' })
  const [salvandoSaque, setSalvandoSaque] = useState(false)
  const [msgSaque, setMsgSaque] = useState('')

  useEffect(() => {
    fetch('/api/indicacao')
      .then(r => r.json())
      .then(data => { setDados(data); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  function copiarLink() {
    navigator.clipboard.writeText(dados?.linkIndicacao || '')
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function solicitarSaque() {
    setSalvandoSaque(true)
    try {
      const res = await fetch('/api/indicacao/saque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSaque)
      })
      const data = await res.json()
      if (res.ok) {
        setMsgSaque(data.mensagem)
        setModalSaque(false)
        fetch('/api/indicacao').then(r => r.json()).then(setDados)
      } else {
        setMsgSaque(data.error || 'Erro ao solicitar saque')
      }
    } catch {
      setMsgSaque('Erro ao solicitar saque')
    } finally {
      setSalvandoSaque(false)
    }
  }

  if (carregando) return <div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 0 40px' }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
        borderRadius: 16, padding: 24, marginBottom: 24, color: 'white'
      }}>
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Programa de Indicações</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Indique e ganhe até 3 níveis de comissão
        </h2>
        <p style={{ fontSize: 13, opacity: 0.85 }}>
          Nível 1: 30% | Nível 2: 10% | Nível 3: 5% — recorrente todo mês
        </p>
      </div>

      {/* SALDO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Saldo disponível</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>
            R$ {(dados?.saldoDisponivel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <button
            onClick={() => setModalSaque(true)}
            disabled={!dados?.saldoDisponivel || dados.saldoDisponivel < 20}
            style={{
              marginTop: 8, padding: '6px 12px', background: '#1D9E75',
              border: 'none', borderRadius: 6, color: 'white',
              fontSize: 12, cursor: 'pointer', fontWeight: 600,
              opacity: (!dados?.saldoDisponivel || dados.saldoDisponivel < 20) ? 0.5 : 1
            }}
          >
            💸 Sacar via Pix
          </button>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Saldo pendente</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#BA7517' }}>
            R$ {(dados?.saldoPendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>Liberado após 30 dias</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total indicados</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>
            {dados?.totalIndicados || 0}
          </p>
          <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>em 3 níveis</p>
        </div>
      </div>

      {msgSaque && (
        <div style={{ padding: 12, background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#0F6E56' }}>
          {msgSaque}
        </div>
      )}

      {/* LINK DE INDICAÇÃO */}
      <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Seu link de indicação</p>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
          Compartilhe esse link e ganhe comissão por cada assinatura gerada
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, padding: '10px 14px', background: '#f5f5f5',
            borderRadius: 8, fontSize: 13, color: '#333',
            border: '1px solid #e5e5e5', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {dados?.linkIndicacao || 'Carregando...'}
          </div>
          <button
            onClick={copiarLink}
            style={{
              padding: '10px 16px', background: copiado ? '#1D9E75' : '#111',
              border: 'none', borderRadius: 8, color: 'white',
              fontSize: 12, cursor: 'pointer', fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {copiado ? '✓ Copiado!' : '📋 Copiar link'}
          </button>
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#F0FDF8', borderRadius: 8, fontSize: 12, color: '#0F6E56' }}>
          Seu código: <strong>{dados?.codigoIndicacao}</strong>
        </div>
      </div>

      {/* TABELA DE COMISSÕES POR PLANO */}
      <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>💰 Quanto você ganha por indicação</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Plano</th>
              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Nível 1 (30%)</th>
              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Nível 2 (10%)</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>Nível 3 (5%)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>Essencial R$ 19,90</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1D9E75', fontWeight: 600 }}>R$ 5,97</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#BA7517' }}>R$ 1,99</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>R$ 0,99</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>Pro R$ 97,00</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1D9E75', fontWeight: 600 }}>R$ 29,10</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#BA7517' }}>R$ 9,70</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>R$ 4,85</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>Elite R$ 197,00</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1D9E75', fontWeight: 600 }}>R$ 59,10</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#BA7517' }}>R$ 19,70</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>R$ 9,85</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MEUS INDICADOS */}
      {[
        { nivel: 1, lista: dados?.nivel1, cor: '#1D9E75', pct: '30%' },
        { nivel: 2, lista: dados?.nivel2, cor: '#BA7517', pct: '10%' },
        { nivel: 3, lista: dados?.nivel3, cor: '#666', pct: '5%' },
      ].map(({ nivel, lista, cor, pct }) => lista?.length > 0 && (
        <div key={nivel} style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
            Nível {nivel} — {pct} de comissão ({lista.length} indicado{lista.length > 1 ? 's' : ''})
          </p>
          {lista.map((ind: any, i: number) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < lista.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{ind.nome || ind.email}</p>
                <p style={{ fontSize: 11, color: '#999' }}>
                  {new Date(ind.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                background: ind.plano === 'ELITE' ? '#EEEDFE' : ind.plano === 'PRO' ? '#E1F5EE' : '#f5f5f5',
                color: ind.plano === 'ELITE' ? '#534AB7' : ind.plano === 'PRO' ? '#0F6E56' : '#666',
                fontWeight: 500
              }}>
                {ind.plano}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* MODAL DE SAQUE */}
      {modalSaque && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 400, margin: '0 16px'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>💸 Solicitar saque via Pix</h3>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
              Saldo disponível: R$ {(dados?.saldoDisponivel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — Mínimo R$ 20,00
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Valor (R$)</label>
                <input
                  type="number"
                  value={formSaque.valor}
                  onChange={e => setFormSaque(p => ({ ...p, valor: e.target.value }))}
                  placeholder="Ex: 50.00"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Chave Pix</label>
                <input
                  type="text"
                  value={formSaque.pixKey}
                  onChange={e => setFormSaque(p => ({ ...p, pixKey: e.target.value }))}
                  placeholder="CPF, email, telefone ou chave aleatória"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#111' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setModalSaque(false)}
                style={{ flex: 1, padding: 10, background: 'white', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                onClick={solicitarSaque}
                disabled={salvandoSaque}
                style={{ flex: 1, padding: 10, background: '#1D9E75', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {salvandoSaque ? 'Solicitando...' : 'Confirmar saque'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 12 }}>
              Pagamentos processados em até 3 dias úteis
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
