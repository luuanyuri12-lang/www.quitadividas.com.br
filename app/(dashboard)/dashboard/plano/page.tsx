'use client'

import { useState } from 'react'
import { CheckCircle, Clock, PlayCircle } from 'lucide-react'

type Status = 'pendente' | 'em_andamento' | 'concluido'

interface Step {
  numero: number
  titulo: string
  descricao: string
  status: Status
}

const stepsIniciais: Step[] = [
  {
    numero: 1,
    titulo: 'Estancar o sangramento',
    descricao:
      'Identifique e pare imediatamente os gastos que estão aprofundando seu endividamento. Cancele assinaturas desnecessárias, negocie planos e elimine tudo que é fútil. O primeiro passo é não afundar mais.',
    status: 'pendente',
  },
  {
    numero: 2,
    titulo: 'Cortar gastos fúteis',
    descricao:
      'Faça um mapeamento de todos os seus gastos e classifique cada um em fútil, útil ou necessário. Corte tudo que é fútil imediatamente. Reavalie os úteis. Mantenha apenas o necessário.',
    status: 'pendente',
  },
  {
    numero: 3,
    titulo: 'Renegociar dívidas',
    descricao:
      'Entre em contato com cada credor e negocie condições melhores. Peça desconto para pagamento à vista, redução de juros ou parcelamento maior. Use o Serasa Limpa Nome e programas governamentais.',
    status: 'pendente',
  },
  {
    numero: 4,
    titulo: 'Aumentar receita',
    descricao:
      'Enquanto você reduz dívidas, aumente a renda em paralelo. Identifique habilidades que podem gerar renda extra. Freelances, vendas, serviços locais. Cada real a mais vai diretamente para quitar dívidas.',
    status: 'pendente',
  },
  {
    numero: 5,
    titulo: 'Método Avalanche: quitar a mais cara primeiro',
    descricao:
      'Pague o mínimo em todas as dívidas e concentre o dinheiro extra na dívida com a maior taxa de juros. Ao quitá-la, direcione esse valor para a próxima. É a estratégia matematicamente mais eficiente.',
    status: 'pendente',
  },
  {
    numero: 6,
    titulo: 'Construir reserva de emergência',
    descricao:
      'Após quitar as dívidas, construa uma reserva de 3 a 6 meses de despesas em renda fixa (Tesouro Selic). Isso evita que você volte ao ciclo de dívidas em caso de imprevistos.',
    status: 'pendente',
  },
]

const statusConfig: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: 'Pendente', color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-4 h-4" /> },
  em_andamento: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700', icon: <PlayCircle className="w-4 h-4" /> },
  concluido: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> },
}

const proximoStatus: Record<Status, Status> = {
  pendente: 'em_andamento',
  em_andamento: 'concluido',
  concluido: 'pendente',
}

export default function PlanoPage() {
  const [steps, setSteps] = useState<Step[]>(stepsIniciais)

  function toggleStatus(numero: number) {
    setSteps((prev) =>
      prev.map((s) =>
        s.numero === numero ? { ...s, status: proximoStatus[s.status] } : s
      )
    )
  }

  const concluidos = steps.filter((s) => s.status === 'concluido').length
  const progresso = Math.round((concluidos / steps.length) * 100)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Progresso geral */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Plano de 12 meses</h2>
          <span className="text-sm text-gray-500">{concluidos}/{steps.length} etapas</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full">
          <div
            className="h-3 bg-emerald-500 rounded-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{progresso}% do plano concluído</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const config = statusConfig[step.status]
          return (
            <div
              key={step.numero}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                step.status === 'concluido' ? 'border-emerald-200 opacity-75' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    step.status === 'concluido'
                      ? 'bg-emerald-100 text-emerald-700'
                      : step.status === 'em_andamento'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {step.numero}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{step.titulo}</h3>
                    <button
                      onClick={() => toggleStatus(step.numero)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.descricao}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
