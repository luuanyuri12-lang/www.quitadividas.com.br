import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')
    const { anthropic } = await import('@/lib/anthropic')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await getOrCreateUser(user.email!, user.user_metadata?.full_name)

    const userCompleto = await (prisma.user as any).findUnique({
      where: { email: user.email! },
      include: { dividas: true, gastos: true },
    })

    const totalParcelas    = userCompleto?.dividas?.reduce((s: number, d: any) => s + d.parcela,    0) ?? 0
    const totalDividas     = userCompleto?.dividas?.reduce((s: number, d: any) => s + d.valorTotal, 0) ?? 0
    const rendaMensal      = (userCompleto as any)?.rendaMensal ?? 0
    const gastos: any[]    = userCompleto?.gastos  ?? []
    const dividas: any[]   = userCompleto?.dividas ?? []

    const totalFutil      = gastos.filter(g => g.categoria === 'Fútil')     .reduce((s, g) => s + g.valor, 0)
    const totalUtil       = gastos.filter(g => g.categoria === 'Útil')      .reduce((s, g) => s + g.valor, 0)
    const totalNecessario = gastos.filter(g => g.categoria === 'Necessário').reduce((s, g) => s + g.valor, 0)
    const sobra           = rendaMensal - totalParcelas - totalNecessario - totalUtil
    const indiceSaude     = rendaMensal > 0 ? Math.max(0, Math.round(100 - (totalParcelas / rendaMensal) * 100)) : 0

    const contextoDividas = dividas.length > 0
      ? dividas.map(d =>
          `- ${d.nome} (${d.tipo}): R$ ${d.valorTotal} total, parcela R$ ${d.parcela}/mês, taxa ${d.taxaMensal}% a.m., ${d.mesesRestantes} meses restantes, status: ${d.status}`
        ).join('\n')
      : 'Nenhuma dívida cadastrada'

    const contextoGastos = gastos.length > 0
      ? gastos.map(g => `- ${g.descricao}: R$ ${g.valor} (${g.categoria})`).join('\n')
      : 'Nenhum gasto cadastrado ainda'

    const prompt = `Você é um consultor financeiro especialista do Quita. Analise os dados financeiros abaixo e gere um plano de ação PERSONALIZADO com micro tarefas práticas e interativas.

DADOS DO USUÁRIO:
- Renda mensal: R$ ${rendaMensal}
- Total em dívidas: R$ ${totalDividas}
- Parcelas mensais: R$ ${totalParcelas}
- Índice de saúde financeira: ${indiceSaude}/100
- Sobra mensal atual: R$ ${sobra} ${sobra < 0 ? '(DÉFICIT)' : '(POSITIVO)'}
- Gastos fúteis identificados: R$ ${totalFutil}/mês
- Gastos úteis: R$ ${totalUtil}/mês
- Gastos necessários: R$ ${totalNecessario}/mês

DÍVIDAS:
${contextoDividas}

GASTOS:
${contextoGastos}

REGRAS IMPORTANTES:
1. Gere APENAS tarefas relevantes para ESTE usuário específico
2. NÃO sugira renegociar dívidas se o usuário não tiver dívidas
3. NÃO sugira cortar gastos fúteis se não houver gastos fúteis cadastrados
4. Priorize pelo impacto financeiro real (maior economia primeiro)
5. Cada tarefa deve ter um impacto em R$ calculado com base nos dados reais
6. Máximo de 8 tarefas, mínimo de 3
7. Ordene por prioridade: URGENTE > ALTA > MEDIA > BAIXA

Responda APENAS com JSON válido neste formato exato, sem markdown, sem explicações:
{
  "resumo": "Uma frase motivacional personalizada sobre a situação do usuário",
  "indiceSaude": ${indiceSaude},
  "tarefas": [
    {
      "id": "1",
      "titulo": "Título curto e direto",
      "descricao": "Descrição clara do que fazer e por quê",
      "categoria": "dividas|gastos|renda|habitos|negociacao|investimento",
      "prioridade": "urgente|alta|media|baixa",
      "impactoMensal": 500,
      "impactoTexto": "Economiza R$ 500/mês",
      "prazoSugerido": "Esta semana|Este mês|Em 30 dias|Em 60 dias|Em 90 dias",
      "comoFazer": "Passo a passo simples de como executar esta tarefa",
      "status": "pendente"
    }
  ]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const plano = JSON.parse(texto)

    return NextResponse.json(plano)
  } catch (error) {
    console.error('Plano gerar error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
