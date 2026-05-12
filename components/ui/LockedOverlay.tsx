'use client'

import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LockedOverlayProps {
  planMinimo: 'PRO' | 'ELITE'
}

const planLabels = {
  PRO: { nome: 'Pro', preco: 'R$ 47/mês' },
  ELITE: { nome: 'Elite', preco: 'R$ 97/mês' },
}

export default function LockedOverlay({ planMinimo }: LockedOverlayProps) {
  const router = useRouter()
  const plan = planLabels[planMinimo]

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-6">
        <Lock className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Módulo bloqueado
      </h2>
      <p className="text-gray-500 mb-2 max-w-md">
        Este módulo está disponível apenas no plano{' '}
        <span className="font-semibold text-emerald-600">{plan.nome}</span> ou
        superior.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        Faça upgrade por apenas {plan.preco} e desbloqueie todos os recursos.
      </p>
      <button
        onClick={() => router.push('/planos')}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
      >
        Ver planos e fazer upgrade
      </button>
    </div>
  )
}
