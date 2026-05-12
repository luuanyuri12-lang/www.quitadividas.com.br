import Link from 'next/link'
import { CAKTO_CHECKOUT_URLS } from '@/lib/cakto'
import {
  TrendingDown,
  Activity,
  CreditCard,
  Map,
  TrendingUp,
  Award,
  Heart,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  Target,
  BarChart3,
  ChevronDown,
  Star,
  AlertTriangle,
  Clock,
} from 'lucide-react'

const features = [
  {
    icon: Activity,
    title: 'Diagnóstico Financeiro',
    desc: 'Índice de saúde 0-100, comprometimento de renda e checklist completo da sua situação.',
  },
  {
    icon: CreditCard,
    title: 'Gestão de Dívidas',
    desc: 'Cadastre todas as dívidas, veja a prioridade por juros e acompanhe o progresso de quitação.',
  },
  {
    icon: Map,
    title: 'Plano de Ação',
    desc: 'Plano personalizado de 12 meses com 6 etapas claras para sair das dívidas de vez.',
  },
  {
    icon: TrendingUp,
    title: 'Aumento de Receita',
    desc: 'IA mapeia suas habilidades e sugere fontes de renda extra para acelerar a quitação.',
  },
  {
    icon: Award,
    title: 'Liderança',
    desc: 'Para donos de negócio: aprenda a gerar líderes e crescer sem depender só de você.',
  },
  {
    icon: Heart,
    title: 'Propósito',
    desc: 'Trabalhe o lado emocional da dívida: perdão financeiro, metas ousadas e propósito de vida.',
  },
]

const planos = [
  {
    key: 'ESSENCIAL' as const,
    nome: 'Essencial',
    preco: 'R$ 19,90',
    periodo: '/mês',
    desc: 'Para quem quer sair das dívidas com um plano claro',
    destaque: false,
    items: [
      { label: 'Diagnóstico financeiro completo', ok: true },
      { label: 'Gestão ilimitada de dívidas', ok: true },
      { label: 'Plano de ação em 12 meses', ok: true },
      { label: 'Chat com IA conselheira', ok: true },
      { label: 'Módulo Aumento de Receita', ok: false },
      { label: 'Módulo Liderança', ok: false },
      { label: 'Módulo Propósito', ok: false },
    ],
  },
  {
    key: 'PRO' as const,
    nome: 'Pro',
    preco: 'R$ 47,00',
    periodo: '/mês',
    desc: 'Para quem quer sair das dívidas e aumentar a renda ao mesmo tempo',
    destaque: true,
    items: [
      { label: 'Tudo do Essencial', ok: true },
      { label: 'Módulo Aumento de Receita + IA', ok: true },
      { label: 'Módulo Liderança', ok: true },
      { label: 'Calculadora de capacidade de gestão', ok: true },
      { label: 'Sugestões de renda extra por IA', ok: true },
      { label: 'Módulo Propósito', ok: false },
    ],
  },
  {
    key: 'ELITE' as const,
    nome: 'Elite',
    preco: 'R$ 97,00',
    periodo: '/mês',
    desc: 'Para donos de negócio que querem escalar com propósito',
    destaque: false,
    items: [
      { label: 'Tudo do Pro', ok: true },
      { label: 'Módulo Propósito completo', ok: true },
      { label: 'Diário de reflexão semanal', ok: true },
      { label: 'Exercício de perdão financeiro', ok: true },
      { label: 'Planejamento de metas ousadas', ok: true },
      { label: 'Suporte prioritário', ok: true },
    ],
  },
]

const depoimentos = [
  {
    nome: 'Rodrigo Mendes',
    cidade: 'São Paulo, SP',
    resultado: 'Quitei R$ 23.000 em dívidas em 8 meses',
    texto:
      'Achei que nunca ia sair do buraco. Tinha 4 cartões no limite e cheque especial estourado. O Quita me mostrou exatamente por onde começar e qual dívida atacar primeiro. Em 8 meses quitei tudo.',
    estrelas: 5,
  },
  {
    nome: 'Fernanda Costa',
    cidade: 'Belo Horizonte, MG',
    resultado: 'Reduzi 68% das parcelas mensais',
    texto:
      'Minha renda estava 80% comprometida com parcelas. Com o diagnóstico do Quita vi claramente o problema. Renegociei 3 dívidas com desconto e agora sobra dinheiro todo mês. Inacreditável.',
    estrelas: 5,
  },
  {
    nome: 'Carlos Almeida',
    cidade: 'Recife, PE',
    resultado: 'Aumentei a renda em R$ 2.800/mês',
    texto:
      'Além de organizar as dívidas, o módulo de aumento de receita me ajudou a descobrir que eu podia oferecer consultoria nas minhas horas livres. Em 3 meses já estava com renda extra consistente.',
    estrelas: 5,
  },
]

const faqs = [
  {
    pergunta: 'O que é o Quita?',
    resposta:
      'O Quita é uma plataforma de saúde financeira que ajuda pessoas físicas endividadas e donos de pequenos negócios a sair das dívidas de vez. Combinamos diagnóstico financeiro preciso, plano de ação personalizado de 12 meses e inteligência artificial para te dar suporte em cada etapa da jornada.',
  },
  {
    pergunta: 'Como funciona o plano de saída das dívidas?',
    resposta:
      'Você começa cadastrando todas as suas dívidas e renda. O Quita calcula seu índice de saúde financeira e gera automaticamente um plano em 6 etapas: 1) Estancar o sangramento, 2) Cortar gastos fúteis, 3) Renegociar dívidas, 4) Aumentar receita, 5) Quitar pelo método avalanche (mais cara primeiro) e 6) Construir reserva de emergência.',
  },
  {
    pergunta: 'Posso usar mesmo tendo muitas dívidas?',
    resposta:
      'Sim, e é exatamente para isso que o Quita foi criado. Quanto mais dívidas você tiver, mais o plano vai te ajudar a priorizar e organizar. O Quita foi desenhado para situações de endividamento real, não apenas para quem está "quase lá".',
  },
  {
    pergunta: 'Como funciona a integração com IA?',
    resposta:
      'O chat com IA usa o modelo Claude da Anthropic e é contextualizado com seus dados reais: suas dívidas, renda, índice de saúde e plano atual. Você pode perguntar qualquer coisa sobre sua situação financeira e receber orientações personalizadas. A IA segue os princípios do Quita: nunca indica agiota, sempre orienta a estancar o sangramento primeiro.',
  },
  {
    pergunta: 'Como cancelo minha assinatura?',
    resposta:
      'Você pode cancelar a qualquer momento direto pelo painel da Cakto (nossa plataforma de pagamentos), sem precisar falar com ninguém. Sem multa, sem burocracia. E se cancelar nos primeiros 7 dias, devolvemos 100% do valor pago.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Quita" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-[#1D9E75] hover:bg-[#178a64] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Quero sair das dívidas
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-br from-white via-emerald-50/40 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-[#1D9E75] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            Plataforma de saúde financeira com IA
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Você está a menos de 12 meses de ser{' '}
            <span className="text-[#1D9E75]">livre das dívidas.</span>
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-gray-800 max-w-2xl mx-auto mb-4 leading-snug">
            Em até 12 meses você quita suas dívidas. Não é promessa — é método.
          </p>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Chega de improvisar. Chega de pagar juros pra sempre. O Quita te dá o plano,
            os especialistas e a tecnologia para você quitar tudo e nunca mais voltar a se endividar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro"
              className="bg-[#1D9E75] hover:bg-[#178a64] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-200"
            >
              Quero sair das dívidas
            </Link>
            <a
              href="#planos"
              className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg transition-colors"
            >
              Ver planos
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            Sem cartão de crédito • 7 dias de garantia • Cancele quando quiser
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="max-w-4xl mx-auto mt-16 px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 bg-white rounded-lg h-6 mx-4 border border-gray-200 flex items-center px-3">
                <span className="text-xs text-gray-400">app.quita.com.br/dashboard</span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total em dívidas', value: 'R$ 34.500', color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Parcelas/mês', value: 'R$ 2.300', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Renda mensal', value: 'R$ 5.000', color: 'text-gray-700', bg: 'bg-gray-50' },
                { label: 'Saúde financeira', value: '42/100', color: 'text-[#1D9E75]', bg: 'bg-emerald-50' },
              ].map((card) => (
                <div key={card.label} className={`${card.bg} rounded-2xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Progresso do plano de 12 meses</p>
                  <span className="text-xs text-[#1D9E75] font-semibold">33% concluído</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full">
                  <div className="h-3 bg-[#1D9E75] rounded-full" style={{ width: '33%' }} />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['Estancar sangramento ✓', 'Cortar gastos fúteis ✓', 'Renegociar dívidas →'].map((s) => (
                    <span key={s} className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-gray-900 py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D9E75] font-semibold text-sm uppercase tracking-widest mb-3">
              Você não está sozinho
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              A realidade de quem está endividado
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                numero: '+60%',
                titulo: 'da renda vai para parcelas',
                desc: 'Mais de metade do que você ganha nem chega a seus bolsos. Vai direto para bancos e financeiras.',
              },
              {
                icon: Target,
                numero: '0',
                titulo: 'ideia de por onde começar',
                desc: 'Sem um plano claro, cada mês parece igual ao anterior. A sensação de estagnação paralisa.',
              },
              {
                icon: AlertTriangle,
                numero: 'R$ ??',
                titulo: 'perdido em juros todo mês',
                desc: 'Os juros compostos trabalham contra você 24h por dia. Cada mês de inação custa mais caro.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.titulo} className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                  <div className="bg-gray-700 rounded-xl p-3 w-fit mb-5">
                    <Icon className="w-6 h-6 text-[#1D9E75]" />
                  </div>
                  <p className="text-5xl font-extrabold text-white mb-2">{item.numero}</p>
                  <p className="text-lg font-semibold text-gray-200 mb-3">{item.titulo}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-300 text-lg">
              Se você identificou pelo menos um desses cenários,{' '}
              <span className="text-[#1D9E75] font-semibold">o Quita foi feito para você.</span>
            </p>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D9E75] font-semibold text-sm uppercase tracking-widest mb-3">
              Como funciona
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              3 passos para sair das dívidas de vez
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-emerald-100" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: Activity,
                  titulo: 'Faça seu diagnóstico',
                  desc: 'Cadastre suas dívidas e renda. O Quita calcula seu índice de saúde financeira e mostra exatamente sua situação real em menos de 5 minutos.',
                },
                {
                  step: '02',
                  icon: Map,
                  titulo: 'Receba seu plano',
                  desc: 'Um plano personalizado de 12 meses é gerado automaticamente, com etapas claras e priorizadas. Você sabe exatamente o que fazer a cada semana.',
                },
                {
                  step: '03',
                  icon: Zap,
                  titulo: 'Execute com apoio da IA',
                  desc: 'Nosso conselheiro com IA te acompanha, responde dúvidas, ajusta o plano conforme sua evolução e celebra cada dívida quitada.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="text-center relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 border-2 border-emerald-100 rounded-2xl mb-5 relative">
                      <Icon className="w-8 h-8 text-[#1D9E75]" />
                      <span className="absolute -top-3 -right-3 bg-[#1D9E75] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{item.titulo}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D9E75] font-semibold text-sm uppercase tracking-widest mb-3">
              Tudo que você precisa
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Uma plataforma completa de saúde financeira
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
                >
                  <div className="bg-emerald-50 group-hover:bg-emerald-100 rounded-xl p-3 w-fit mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-[#1D9E75]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D9E75] font-semibold text-sm uppercase tracking-widest mb-3">
              Investimento
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Escolha o plano ideal para você
            </h2>
            <p className="text-gray-500 mt-3">
              7 dias de garantia em todos os planos. Cancele quando quiser.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {planos.map((plano) => {
              const url = CAKTO_CHECKOUT_URLS[plano.key] || '/cadastro'
              return (
                <div
                  key={plano.key}
                  className={`rounded-3xl p-7 flex flex-col border-2 relative ${
                    plano.destaque
                      ? 'border-[#1D9E75] shadow-xl shadow-emerald-100 bg-white'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  {plano.destaque && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                      Mais popular
                    </div>
                  )}
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plano.nome}</h3>
                    <p className="text-sm text-gray-500 mb-4">{plano.desc}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">{plano.preco}</span>
                      <span className="text-gray-400 mb-1">{plano.periodo}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-7">
                    {plano.items.map((item) => (
                      <li key={item.label} className="flex items-center gap-2.5">
                        {item.ok ? (
                          <CheckCircle className="w-4 h-4 text-[#1D9E75] flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${item.ok ? 'text-gray-700' : 'text-gray-400'}`}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={url}
                    target={url !== '/cadastro' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`block text-center font-bold py-3.5 rounded-2xl text-sm transition-all ${
                      plano.destaque
                        ? 'bg-[#1D9E75] hover:bg-[#178a64] text-white shadow-md hover:scale-105'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    Assinar {plano.nome}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D9E75] font-semibold text-sm uppercase tracking-widest mb-3">
              Resultados reais
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Quem usou o Quita, mudou de vida
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: d.estrelas }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                  "{d.texto}"
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900 text-sm">{d.nome}</p>
                  <p className="text-gray-400 text-xs">{d.cidade}</p>
                  <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-1.5 inline-block">
                    <p className="text-[#1D9E75] text-xs font-semibold">{d.resultado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-3xl p-10 text-center">
            <div className="bg-[#1D9E75] rounded-2xl p-4 w-fit mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              7 dias de garantia total
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Risco zero. Se em 7 dias você não enxergar o caminho para sair das dívidas,
              devolvemos cada centavo. Sem burocracia, sem perguntas.{' '}
              <span className="font-semibold text-gray-900">
                A única coisa que você tem a perder são as suas dívidas.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm text-gray-500">
              <span className="flex items-center gap-1.5 justify-center">
                <CheckCircle className="w-4 h-4 text-[#1D9E75]" />
                Reembolso em até 3 dias úteis
              </span>
              <span className="flex items-center gap-1.5 justify-center">
                <CheckCircle className="w-4 h-4 text-[#1D9E75]" />
                Sem perguntas
              </span>
              <span className="flex items-center gap-1.5 justify-center">
                <CheckCircle className="w-4 h-4 text-[#1D9E75]" />
                Cancele em 1 clique
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D9E75] font-semibold text-sm uppercase tracking-widest mb-3">
              Dúvidas frequentes
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Perguntas frequentes
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.pergunta}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 hover:text-[#1D9E75] transition-colors">
                  <span>{faq.pergunta}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.resposta}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 sm:px-6 bg-[#1D9E75]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-emerald-200" />
            <span className="text-emerald-100 font-medium text-sm">
              Cada dia de dívida custa dinheiro
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            Cada dia que passa você paga juros.{' '}
            <span className="text-emerald-200">Cada dia que passa é dinheiro indo embora.</span>{' '}
            Começa hoje.
          </h2>
          <p className="text-emerald-100 text-lg mb-10">
            Junte-se a quem já escolheu ter um plano real para sair das dívidas.
          </p>
          <Link
            href="/cadastro"
            className="inline-block bg-white hover:bg-gray-50 text-[#1D9E75] font-bold px-10 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-xl"
          >
            Começar agora
          </Link>
          <p className="text-emerald-200 text-sm mt-5">
            Sem cartão de crédito para começar • 7 dias de garantia
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.svg" alt="Quita" className="h-9 w-auto brightness-0 invert" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Plataforma de saúde financeira para pessoas físicas e donos de negócio saírem das dívidas de vez.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Links rápidos</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Entrar', href: '/login' },
                  { label: 'Criar conta', href: '/cadastro' },
                  { label: 'Ver planos', href: '#planos' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <p className="text-gray-400 text-sm">
                Dúvidas ou suporte:
              </p>
              <a
                href="mailto:contato@quita.com.br"
                className="text-[#1D9E75] hover:text-emerald-400 text-sm font-medium transition-colors mt-1 block"
              >
                contato@quita.com.br
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">
              © 2025 Quita. Todos os direitos reservados.
            </p>
            <p className="text-gray-600 text-xs">
              Feito no Brasil para brasileiros saírem das dívidas.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
