'use client'

import { useState, useEffect } from 'react'
import LockedOverlay from '@/components/ui/LockedOverlay'
import { Sparkles, Plus, TrendingUp } from 'lucide-react'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function gerarSugestoesLocal(habilidades: string): string {
  const h = habilidades.toLowerCase()
  const sugestoes: string[] = []

  if (h.includes('design') || h.includes('figma') || h.includes('criativo') || h.includes('arte')) {
    sugestoes.push('🎨 Ofereça criação de logos e identidade visual no 99Freelas ou Workana — R$ 300 a R$ 2.000 por projeto')
    sugestoes.push('📱 Crie posts para redes sociais de pequenos negócios — R$ 500 a R$ 1.500/mês por cliente')
    sugestoes.push('🖼️ Venda artes digitais e templates no Canva Creator ou Creative Market')
  }

  if (h.includes('tecnologia') || h.includes('programação') || h.includes('código') || h.includes('dev') || h.includes('software') || h.includes('digital')) {
    sugestoes.push('💻 Ofereça criação de sites e landing pages no GetNinjas — R$ 500 a R$ 3.000 por projeto')
    sugestoes.push('🤖 Automatize processos para pequenas empresas — R$ 1.000 a R$ 5.000 por projeto')
    sugestoes.push('📊 Crie planilhas e dashboards personalizados — R$ 200 a R$ 800 por projeto')
  }

  if (h.includes('marketing') || h.includes('lançamento') || h.includes('vendas') || h.includes('estrategista')) {
    sugestoes.push('📢 Ofereça consultoria de marketing digital para pequenos negócios — R$ 1.000 a R$ 3.000/mês')
    sugestoes.push('🚀 Gerencie lançamentos de produtos digitais — R$ 2.000 a R$ 10.000 por lançamento')
    sugestoes.push('📈 Crie e gerencie anúncios no Instagram e Facebook — R$ 800 a R$ 2.500/mês por cliente')
    sugestoes.push('🎯 Ofereça mentorias de estratégia de vendas — R$ 200 a R$ 500 por hora')
  }

  if (h.includes('aula') || h.includes('professor') || h.includes('ensino') || h.includes('educação') || h.includes('curso')) {
    sugestoes.push('📚 Crie um curso online na Hotmart ou Kiwify — renda passiva de R$ 500 a R$ 5.000/mês')
    sugestoes.push('👩‍🏫 Ofereça aulas particulares presenciais ou online — R$ 50 a R$ 150/hora')
    sugestoes.push('🎥 Crie conteúdo educativo no YouTube e monetize com AdSense')
  }

  if (h.includes('escrita') || h.includes('redação') || h.includes('texto') || h.includes('conteúdo') || h.includes('copywriter')) {
    sugestoes.push('✍️ Ofereça produção de conteúdo para blogs e redes sociais — R$ 50 a R$ 200 por artigo')
    sugestoes.push('📧 Escreva e-mails de vendas e copywriting — R$ 300 a R$ 1.500 por campanha')
    sugestoes.push('📖 Escreva e-books e materiais ricos para empresas — R$ 500 a R$ 2.000 por projeto')
  }

  if (h.includes('culinária') || h.includes('cozinha') || h.includes('comida') || h.includes('gastronomia')) {
    sugestoes.push('🍱 Venda marmitas ou refeições pelo iFood e WhatsApp — R$ 1.500 a R$ 4.000/mês')
    sugestoes.push('🎂 Faça bolos e doces por encomenda — R$ 800 a R$ 3.000/mês')
    sugestoes.push('👩‍🍳 Ofereça aulas de culinária online ou presencial — R$ 100 a R$ 300 por aula')
  }

  if (h.includes('foto') || h.includes('vídeo') || h.includes('câmera') || h.includes('edição')) {
    sugestoes.push('📸 Ofereça ensaios fotográficos para famílias e casais — R$ 300 a R$ 1.500 por ensaio')
    sugestoes.push('🎬 Edite vídeos para youtubers e empresas — R$ 200 a R$ 800 por vídeo')
    sugestoes.push('📹 Grave e edite conteúdo para redes sociais — R$ 500 a R$ 2.000/mês por cliente')
  }

  if (h.includes('idioma') || h.includes('inglês') || h.includes('espanhol') || h.includes('tradução')) {
    sugestoes.push('🌍 Ofereça aulas de idiomas online — R$ 60 a R$ 150/hora')
    sugestoes.push('📄 Faça traduções de documentos — R$ 30 a R$ 80 por página')
    sugestoes.push('🎧 Ofereça serviços de legendagem e transcrição — R$ 20 a R$ 50 por minuto de áudio')
  }

  sugestoes.push('🛒 Venda itens que não usa mais no OLX, Enjoei ou Facebook Marketplace')
  sugestoes.push('🚗 Faça entregas pelo Rappi, iFood ou Lalamove nos horários livres')
  sugestoes.push('💼 Cadastre-se no GetNinjas e ofereça seus serviços como freelancer')

  return sugestoes.slice(0, 6).map((s, i) => `${i + 1}. ${s}`).join('\n\n')
}

export default function ReceitaPage() {
  const [plano, setPlano] = useState<string | null>(null)
  const [habilidades, setHabilidades] = useState('')
  const [sugestoes, setSugestoes] = useState('')
  const [rendaExtra, setRendaExtra] = useState('')
  const [totalParcelas, setTotalParcelas] = useState(0)

  useEffect(() => {
    fetch('/api/usuario').then((r) => r.json()).then((u) => setPlano(u.plano))
    fetch('/api/dividas').then((r) => r.json()).then((d) => {
      const total = Array.isArray(d) ? d.reduce((s: number, x: { parcela: number }) => s + x.parcela, 0) : 0
      setTotalParcelas(total)
    })
  }, [])


  const rendaExtraNum = parseFloat(rendaExtra) || 0
  const mesesComExtra = rendaExtraNum > 0 && totalParcelas > 0
    ? Math.ceil(totalParcelas / rendaExtraNum)
    : null

  if (plano === null) {
    return <div className="text-gray-400 text-sm">Carregando...</div>
  }

  if (plano === 'ESSENCIAL') {
    return <LockedOverlay planMinimo="PRO" />
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Mapeamento de habilidades */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-1">Mapeamento de Habilidades</h2>
        <p className="text-sm text-gray-500 mb-4">
          Descreva suas habilidades e experiências. A IA vai sugerir formas de monetizá-las.
        </p>
        <textarea
          value={habilidades}
          onChange={(e) => setHabilidades(e.target.value)}
          placeholder="Ex: Tenho experiência com design gráfico, falo inglês intermediário, sei cozinhar bem, tenho carro..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <button
          onClick={() => {
            if (!habilidades.trim()) {
              alert('Descreva suas habilidades primeiro!')
              return
            }
            setSugestoes(gerarSugestoesLocal(habilidades))
          }}
          disabled={!habilidades.trim()}
          className="mt-3 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Gerar sugestões
        </button>
      </div>

      {/* Sugestões IA */}
      {sugestoes && (
        <div className="bg-white rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-800">Sugestões de Renda Extra</h2>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sugestoes}</div>
        </div>
      )}

      {/* Calculadora de impacto */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-1">Calculadora de Impacto</h2>
        <p className="text-sm text-gray-500 mb-4">
          Veja quanto mais rápido você quitaria suas dívidas com renda extra.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Renda extra por mês (R$)</label>
            <div className="relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={rendaExtra}
                onChange={(e) => setRendaExtra(e.target.value)}
                placeholder="500"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {rendaExtraNum > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 mb-1">Renda extra por mês</p>
              <p className="text-xl font-bold text-emerald-700">{fmt(rendaExtraNum)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-1">Renda extra por ano</p>
              <p className="text-xl font-bold text-blue-700">{fmt(rendaExtraNum * 12)}</p>
            </div>
            {mesesComExtra && (
              <div className="col-span-2 bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">
                  Direcionando {fmt(rendaExtraNum)} para dívidas todo mês
                </p>
                <p className="text-lg font-bold text-white">
                  Parcelas quitadas em {mesesComExtra} meses a mais de esforço
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
