'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIA_ICON: Record<string, string> = {
  dividas:      '💳',
  gastos:       '✂️',
  renda:        '📈',
  habitos:      '🔄',
  negociacao:   '🤝',
  investimento: '💰',
}

const PRIORIDADE_COR: Record<string, { bg: string; text: string; border: string; label: string }> = {
  urgente: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: '🔴 Urgente' },
  alta:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', label: '🟡 Alta' },
  media:   { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', label: '🔵 Média' },
  baixa:   { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: '🟢 Baixa' },
}

export default function PlanoPage() {
  const router = useRouter()
  const [plano, setPlano]                   = useState<any>(null)
  const [carregando, setCarregando]         = useState(true)
  const [erro, setErro]                     = useState('')
  const [tarefaExpandida, setTarefaExpandida] = useState<string | null>(null)
  const [statusLocal, setStatusLocal]       = useState<Record<string, string>>({})

  useEffect(() => {
    const salvo      = localStorage.getItem('plano_quita')
    const salvadoEm  = localStorage.getItem('plano_quita_data')
    const umDia      = 24 * 60 * 60 * 1000

    if (salvo && salvadoEm && Date.now() - Number(salvadoEm) < umDia) {
      setPlano(JSON.parse(salvo))
      const statusSalvo = localStorage.getItem('plano_status')
      if (statusSalvo) setStatusLocal(JSON.parse(statusSalvo))
      setCarregando(false)
    } else {
      gerarPlano()
    }
  }, [])

  async function gerarPlano() {
    setCarregando(true)
    setErro('')
    try {
      const res = await fetch('/api/plano/gerar')
      if (!res.ok) throw new Error('Erro ao gerar plano')
      const data = await res.json()
      setPlano(data)
      localStorage.setItem('plano_quita',      JSON.stringify(data))
      localStorage.setItem('plano_quita_data', String(Date.now()))
    } catch {
      setErro('Não foi possível gerar seu plano. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  function mudarStatus(tarefaId: string, novoStatus: string) {
    const novo = { ...statusLocal, [tarefaId]: novoStatus }
    setStatusLocal(novo)
    localStorage.setItem('plano_status', JSON.stringify(novo))
  }

  function getStatus(tarefaId: string) {
    return statusLocal[tarefaId] || 'pendente'
  }

  const tarefas    = plano?.tarefas ?? []
  const concluidas = tarefas.filter((t: any) => getStatus(t.id) === 'concluida').length
  const progresso  = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0

  if (carregando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🧠</div>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#111' }}>Analisando seus dados...</p>
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', maxWidth: 300 }}>
          O Quita está criando um plano personalizado baseado nas suas dívidas, gastos e renda
        </p>
        <div style={{ width: 200, height: 4, background: '#e5e5e5', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '60%', background: '#1D9E75', borderRadius: 2 }} />
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <p style={{ fontSize: 15, color: '#A32D2D' }}>{erro}</p>
        <button
          onClick={gerarPlano}
          style={{ padding: '10px 24px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
        borderRadius: 16, padding: 24, marginBottom: 24, color: 'white'
      }}>
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Seu plano personalizado</p>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>
          {plano?.resumo || 'Seu plano de ação está pronto!'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: 4, width: progresso + '%', transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {concluidas}/{tarefas.length} tarefas
          </span>
        </div>
        <p style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{progresso}% do plano concluído</p>
      </div>

      {/* BOTÃO ATUALIZAR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => {
            localStorage.removeItem('plano_quita')
            localStorage.removeItem('plano_quita_data')
            gerarPlano()
          }}
          style={{
            padding: '8px 16px', background: 'white', border: '1px solid #ddd',
            borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#555',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          🔄 Atualizar plano com dados novos
        </button>
      </div>

      {/* TAREFAS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tarefas.map((tarefa: any) => {
          const status    = getStatus(tarefa.id)
          const expandida = tarefaExpandida === tarefa.id
          const prioridade = PRIORIDADE_COR[tarefa.prioridade] || PRIORIDADE_COR.baixa
          const concluida  = status === 'concluida'

          return (
            <div
              key={tarefa.id}
              style={{
                background: concluida ? '#F0FDF4' : 'white',
                border: concluida ? '1px solid #6EE7B7' : '1px solid #e5e5e5',
                borderRadius: 12,
                overflow: 'hidden',
                opacity: concluida ? 0.85 : 1,
                transition: 'all 0.2s',
              }}
            >
              {/* CABEÇALHO */}
              <div
                onClick={() => setTarefaExpandida(expandida ? null : tarefa.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 24, flexShrink: 0 }}>
                  {concluida ? '✅' : (CATEGORIA_ICON[tarefa.categoria] || '📌')}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#111', textDecoration: concluida ? 'line-through' : 'none' }}>
                      {tarefa.titulo}
                    </p>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20,
                      background: prioridade.bg, color: prioridade.text,
                      border: '1px solid ' + prioridade.border, fontWeight: 500,
                    }}>
                      {prioridade.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>
                      💰 {tarefa.impactoTexto}
                    </span>
                    <span style={{ fontSize: 11, color: '#999' }}>
                      ⏱ {tarefa.prazoSugerido}
                    </span>
                  </div>
                </div>

                <div style={{ flexShrink: 0, fontSize: 16, color: '#999' }}>
                  {expandida ? '▲' : '▼'}
                </div>
              </div>

              {/* EXPANDIDO */}
              {expandida && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f0' }}>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginTop: 12, marginBottom: 12 }}>
                    {tarefa.descricao}
                  </p>

                  <div style={{
                    background: '#F8FFFE', border: '1px solid #E1F5EE',
                    borderRadius: 8, padding: '12px 14px', marginBottom: 14,
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#0F6E56', marginBottom: 6 }}>
                      📋 Como fazer:
                    </p>
                    <p style={{ fontSize: 12, color: '#444', lineHeight: 1.7 }}>
                      {tarefa.comoFazer}
                    </p>
                  </div>

                  {tarefa.botaoLink && (
                    <button
                      onClick={() => router.push(tarefa.botaoLink)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        marginBottom: 10,
                        boxShadow: '0 4px 12px rgba(29,158,117,0.3)',
                      }}
                    >
                      {tarefa.botaoTexto}
                    </button>
                  )}

                  {/* BOTÕES DE STATUS */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {status !== 'em_andamento' && status !== 'concluida' && (
                      <button
                        onClick={() => mudarStatus(tarefa.id, 'em_andamento')}
                        style={{
                          flex: 1, padding: '8px', background: '#EFF6FF',
                          border: '1px solid #93C5FD', borderRadius: 8,
                          cursor: 'pointer', fontSize: 12, color: '#1E40AF', fontWeight: 500,
                        }}
                      >
                        ▶ Iniciar tarefa
                      </button>
                    )}

                    {status === 'em_andamento' && (
                      <button
                        onClick={() => mudarStatus(tarefa.id, 'pendente')}
                        style={{
                          flex: 1, padding: '8px', background: '#FEF3C7',
                          border: '1px solid #FCD34D', borderRadius: 8,
                          cursor: 'pointer', fontSize: 12, color: '#92400E', fontWeight: 500,
                        }}
                      >
                        ⏸ Em andamento
                      </button>
                    )}

                    {status !== 'concluida' && (
                      <button
                        onClick={() => mudarStatus(tarefa.id, 'concluida')}
                        style={{
                          flex: 1, padding: '8px', background: '#D1FAE5',
                          border: '1px solid #6EE7B7', borderRadius: 8,
                          cursor: 'pointer', fontSize: 12, color: '#065F46', fontWeight: 600,
                        }}
                      >
                        ✓ Marcar como concluída
                      </button>
                    )}

                    {status === 'concluida' && (
                      <button
                        onClick={() => mudarStatus(tarefa.id, 'pendente')}
                        style={{
                          flex: 1, padding: '8px', background: '#f5f5f5',
                          border: '1px solid #ddd', borderRadius: 8,
                          cursor: 'pointer', fontSize: 12, color: '#666',
                        }}
                      >
                        ↩ Reabrir tarefa
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CONCLUSÃO */}
      {progresso === 100 && tarefas.length > 0 && (
        <div style={{
          marginTop: 24, padding: 24,
          background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
          borderRadius: 16, textAlign: 'center', color: 'white',
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🏆</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Plano concluído!</p>
          <p style={{ fontSize: 13, opacity: 0.9 }}>
            Você completou todas as tarefas! Gere um novo plano para continuar evoluindo.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('plano_quita')
              localStorage.removeItem('plano_quita_data')
              gerarPlano()
            }}
            style={{
              marginTop: 16, padding: '10px 24px', background: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              color: '#0F6E56', fontWeight: 700, fontSize: 13,
            }}
          >
            🔄 Gerar novo plano
          </button>
        </div>
      )}
    </div>
  )
}
