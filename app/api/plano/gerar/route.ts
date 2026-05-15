import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await getOrCreateUser(user.email!, user.user_metadata?.full_name)

    const userCompleto = await (prisma as any).user.findUnique({
      where: { email: user.email! },
      include: { dividas: true, gastos: true },
    })

    const dividas: any[]  = userCompleto?.dividas ?? []
    const gastos: any[]   = userCompleto?.gastos  ?? []
    const rendaMensal: number = (userCompleto as any)?.rendaMensal ?? 0

    const totalParcelas   = dividas.reduce((s: number, d: any) => s + d.parcela,    0)
    const totalFutil      = gastos.filter((g: any) => g.categoria === 'Fútil')     .reduce((s: number, g: any) => s + g.valor, 0)
    const totalUtil       = gastos.filter((g: any) => g.categoria === 'Útil')      .reduce((s: number, g: any) => s + g.valor, 0)
    const totalNecessario = gastos.filter((g: any) => g.categoria === 'Necessário').reduce((s: number, g: any) => s + g.valor, 0)
    const sobra           = rendaMensal - totalParcelas - totalNecessario - totalUtil
    const indiceSaude     = rendaMensal > 0 ? Math.max(0, Math.round(100 - (totalParcelas / rendaMensal) * 100)) : 0

    const tarefas: any[] = []
    let id = 1

    // Cortar gastos fúteis
    if (totalFutil > 0) {
      tarefas.push({
        id: String(id++),
        titulo: 'Cortar gastos fúteis imediatamente',
        descricao: `Você tem R$ ${totalFutil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em gastos fúteis identificados. Esses gastos não agregam valor real à sua vida e estão consumindo dinheiro que poderia abater suas dívidas.`,
        categoria: 'gastos',
        prioridade: sobra < 0 ? 'urgente' : 'alta',
        impactoMensal: totalFutil,
        impactoTexto: `Libera R$ ${totalFutil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`,
        prazoSugerido: 'Esta semana',
        comoFazer: gastos
          .filter((g: any) => g.categoria === 'Fútil')
          .map((g: any) => `• Cancelar/reduzir: ${g.descricao} (R$ ${g.valor})`)
          .join('\n') + '\n\nRevise cada item e cancele agora.',
        status: 'pendente',
      })
    }

    // Renegociar dívida mais cara
    const dividasAtivas = dividas.filter((d: any) => d.status === 'ATIVA')
    const dividaMaisCara = [...dividasAtivas].sort((a: any, b: any) => b.taxaMensal - a.taxaMensal)[0]
    if (dividaMaisCara && dividaMaisCara.taxaMensal > 2) {
      const economiaEstimada = dividaMaisCara.parcela * 0.3
      tarefas.push({
        id: String(id++),
        titulo: `Renegociar ${dividaMaisCara.nome}`,
        descricao: `Sua dívida com ${dividaMaisCara.nome} tem taxa de ${dividaMaisCara.taxaMensal}% ao mês — uma das mais caras. Renegociar pode reduzir sua parcela em até 30%.`,
        categoria: 'negociacao',
        prioridade: dividaMaisCara.taxaMensal > 5 ? 'urgente' : 'alta',
        impactoMensal: Math.round(economiaEstimada),
        impactoTexto: `Pode economizar até R$ ${economiaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`,
        prazoSugerido: 'Este mês',
        comoFazer: `1. Ligue para ${dividaMaisCara.nome} ou acesse o app/site\n2. Solicite renegociação informando dificuldade de pagamento\n3. Peça desconto à vista ou parcelas menores\n4. Nunca aceite a primeira oferta — negocie sempre`,
        status: 'pendente',
      })
    }

    // Quitar dívida menor primeiro (bola de neve)
    const dividaMenor = [...dividasAtivas].sort((a: any, b: any) => a.valorTotal - b.valorTotal)[0]
    if (dividaMenor && dividasAtivas.length > 1) {
      tarefas.push({
        id: String(id++),
        titulo: `Quitar ${dividaMenor.nome} primeiro`,
        descricao: `A menor dívida (${dividaMenor.nome}) tem R$ ${dividaMenor.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restantes. Quitá-la libera R$ ${dividaMenor.parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês e te dá motivação para continuar.`,
        categoria: 'dividas',
        prioridade: 'alta',
        impactoMensal: dividaMenor.parcela,
        impactoTexto: `Libera R$ ${dividaMenor.parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`,
        prazoSugerido: 'Em 30 dias',
        comoFazer: `1. Junte o valor de R$ ${dividaMenor.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} o mais rápido possível\n2. Direcione qualquer renda extra para essa dívida\n3. Ao quitar, use a parcela liberada para atacar a próxima dívida`,
        status: 'pendente',
      })
    }

    // Reduzir gastos úteis
    if (totalUtil > 0) {
      const economiaPotencial = totalUtil * 0.4
      tarefas.push({
        id: String(id++),
        titulo: 'Reduzir gastos úteis em 40%',
        descricao: `Seus gastos úteis somam R$ ${totalUtil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês. Eles são necessários mas podem ser reduzidos sem grandes sacrifícios.`,
        categoria: 'gastos',
        prioridade: sobra < 0 ? 'alta' : 'media',
        impactoMensal: Math.round(economiaPotencial),
        impactoTexto: `Pode economizar R$ ${economiaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`,
        prazoSugerido: 'Este mês',
        comoFazer: gastos
          .filter((g: any) => g.categoria === 'Útil')
          .map((g: any) => `• ${g.descricao} (R$ ${g.valor}) — tente reduzir para R$ ${(g.valor * 0.6).toFixed(0)}`)
          .join('\n'),
        status: 'pendente',
      })
    }

    // Aumentar renda se houver déficit
    if (sobra < 0) {
      tarefas.push({
        id: String(id++),
        titulo: 'Criar fonte de renda extra urgente',
        descricao: `Você está com déficit de R$ ${Math.abs(sobra).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês. Cortar gastos pode não ser suficiente — você precisa aumentar sua renda.`,
        categoria: 'renda',
        prioridade: 'urgente',
        impactoMensal: Math.abs(sobra),
        impactoTexto: `Precisa de R$ ${Math.abs(sobra).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês a mais`,
        prazoSugerido: 'Esta semana',
        comoFazer: '1. Liste suas habilidades (culinária, tecnologia, artesanato, serviços gerais)\n2. Ofereça serviços no iFood, GetNinjas, Workana ou grupos do WhatsApp\n3. Venda itens que não usa mais no OLX ou Marketplace\n4. Considere horas extras no trabalho atual\n5. Meta: gerar pelo menos R$ ' + Math.abs(sobra).toLocaleString('pt-BR') + '/mês extra',
        botaoLink: '/dashboard/receita',
        botaoTexto: '📈 Ver estratégias de aumento de receita →',
        status: 'pendente',
      })
    }

    // Cadastrar renda se não tiver
    if (rendaMensal === 0) {
      tarefas.push({
        id: String(id++),
        titulo: 'Cadastrar sua renda mensal',
        descricao: 'Sem saber sua renda não conseguimos calcular sua saúde financeira. Cadastre sua renda no Painel Geral clicando no ícone de lápis ao lado de "Renda Mensal".',
        categoria: 'habitos',
        prioridade: 'urgente',
        impactoMensal: 0,
        impactoTexto: 'Essencial para o diagnóstico',
        prazoSugerido: 'Agora',
        comoFazer: '1. Vá ao Painel Geral\n2. Clique no ícone de lápis ao lado de "Renda Mensal"\n3. Digite o valor da sua renda mensal líquida\n4. Clique em salvar',
        status: 'pendente',
      })
    }

    // Cadastrar gastos se não tiver
    if (gastos.length === 0) {
      tarefas.push({
        id: String(id++),
        titulo: 'Mapear seus gastos mensais',
        descricao: 'Você ainda não cadastrou seus gastos. Sem esse mapeamento não conseguimos identificar onde está "vazando" dinheiro.',
        categoria: 'habitos',
        prioridade: 'alta',
        impactoMensal: 0,
        impactoTexto: 'Base para economizar',
        prazoSugerido: 'Hoje',
        comoFazer: '1. Vá ao Painel Geral\n2. Role até "Classificação de Gastos"\n3. Adicione todos seus gastos mensais\n4. Classifique cada um como Fútil, Útil ou Necessário\n5. O Quita vai analisar e sugerir cortes',
        status: 'pendente',
      })
    }

    // Hábito de acompanhamento
    if (dividas.length > 0) {
      tarefas.push({
        id: String(id++),
        titulo: 'Registrar pagamentos toda vez que pagar',
        descricao: 'Acompanhar cada pagamento realizado te mantém motivado e mostra o progresso real da sua jornada de quitação.',
        categoria: 'habitos',
        prioridade: 'baixa',
        impactoMensal: 0,
        impactoTexto: 'Mantém a motivação',
        prazoSugerido: 'Todo mês',
        comoFazer: '1. Após pagar qualquer parcela vá em "Minhas Dívidas"\n2. Clique em "✓ Paguei a parcela"\n3. Registre o valor e anexe o comprovante\n4. Acompanhe o valor total diminuindo',
        status: 'pendente',
      })
    }

    let resumo = ''
    if (indiceSaude <= 30) {
      resumo = 'Sua situação é crítica, mas existe saída. Com disciplina e seguindo este plano, você pode virar o jogo nos próximos meses. Cada tarefa concluída é um passo rumo à liberdade financeira.'
    } else if (indiceSaude <= 60) {
      resumo = 'Você está no caminho, mas ainda há muito para melhorar. Siga as tarefas abaixo com foco e consistência — a mudança começa agora.'
    } else {
      resumo = 'Sua saúde financeira está em bom estado. Continue seguindo as tarefas para acelerar ainda mais sua jornada rumo à liberdade total.'
    }

    return NextResponse.json({ resumo, indiceSaude, tarefas: tarefas.slice(0, 8) })
  } catch (error) {
    console.error('Plano gerar error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
