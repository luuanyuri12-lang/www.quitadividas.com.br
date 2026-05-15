import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')
    const { anthropic } = await import('@/lib/anthropic')

    console.log('1. Imports OK')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('2. Auth:', user?.email, authError)

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    console.log('3. DB User:', dbUser.id)

    const userCompleto = await (prisma as any).user.findUnique({
      where: { email: user.email! },
      include: { dividas: true, gastos: true },
    })

    console.log('4. User completo:', userCompleto?.dividas?.length, 'dividas,', userCompleto?.gastos?.length, 'gastos')

    const totalParcelas = userCompleto?.dividas?.reduce((s: number, d: any) => s + d.parcela, 0) ?? 0
    const totalDividas  = userCompleto?.dividas?.reduce((s: number, d: any) => s + d.valorTotal, 0) ?? 0
    const rendaMensal   = (userCompleto as any)?.rendaMensal ?? 0
    const gastos: any[] = userCompleto?.gastos  ?? []
    const dividas: any[] = userCompleto?.dividas ?? []

    const totalFutil      = gastos.filter((g: any) => g.categoria === 'Fútil')     .reduce((s: number, g: any) => s + g.valor, 0)
    const totalUtil       = gastos.filter((g: any) => g.categoria === 'Útil')      .reduce((s: number, g: any) => s + g.valor, 0)
    const totalNecessario = gastos.filter((g: any) => g.categoria === 'Necessário').reduce((s: number, g: any) => s + g.valor, 0)
    const sobra       = rendaMensal - totalParcelas - totalNecessario - totalUtil
    const indiceSaude = rendaMensal > 0 ? Math.max(0, Math.round(100 - (totalParcelas / rendaMensal) * 100)) : 0

    console.log('5. Calculando prompt...')

    const contextoDividas = dividas.length > 0
      ? dividas.map((d: any) =>
          `- ${d.nome} (${d.tipo}): R$ ${d.valorTotal} total, parcela R$ ${d.parcela}/mes, taxa ${d.taxaMensal}% am, ${d.mesesRestantes} meses, status: ${d.status}`
        ).join('\n')
      : 'Nenhuma divida cadastrada'

    const contextoGastos = gastos.length > 0
      ? gastos.map((g: any) => `- ${g.descricao}: R$ ${g.valor} (${g.categoria})`).join('\n')
      : 'Nenhum gasto cadastrado ainda'

    console.log('6. Chamando Anthropic...')

    const prompt = `Voce e um consultor financeiro do Quita. Analise os dados e gere um plano de acao PERSONALIZADO com micro tarefas praticas.

DADOS DO USUARIO:
- Renda mensal: R$ ${rendaMensal}
- Total em dividas: R$ ${totalDividas}
- Parcelas mensais: R$ ${totalParcelas}
- Indice de saude financeira: ${indiceSaude}/100
- Sobra mensal atual: R$ ${sobra} ${sobra < 0 ? 'DEFICIT' : 'POSITIVO'}
- Gastos futeis identificados: R$ ${totalFutil}/mes
- Gastos uteis: R$ ${totalUtil}/mes
- Gastos necessarios: R$ ${totalNecessario}/mes

DIVIDAS:
${contextoDividas}

GASTOS:
${contextoGastos}

REGRAS:
1. Gere APENAS tarefas relevantes para ESTE usuario especifico
2. NAO sugira renegociar dividas se o usuario nao tiver dividas
3. NAO sugira cortar gastos se nao houver gastos cadastrados
4. Priorize pelo impacto financeiro real
5. Maximo 6 tarefas, minimo 3
6. Ordene por prioridade: urgente > alta > media > baixa

Responda APENAS com JSON valido sem markdown:
{
  "resumo": "frase motivacional personalizada",
  "indiceSaude": ${indiceSaude},
  "tarefas": [
    {
      "id": "1",
      "titulo": "titulo curto",
      "descricao": "descricao clara do que fazer",
      "categoria": "dividas",
      "prioridade": "alta",
      "impactoMensal": 500,
      "impactoTexto": "Economiza R$ 500/mes",
      "prazoSugerido": "Este mes",
      "comoFazer": "passo a passo simples",
      "status": "pendente"
    }
  ]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    console.log('7. Anthropic respondeu OK')

    const texto = message.content[0].type === 'text' ? message.content[0].text : '{}'

    let plano
    try {
      plano = JSON.parse(texto)
    } catch (parseError) {
      console.error('8. Erro ao fazer parse do JSON:', texto.substring(0, 200))
      return NextResponse.json({ error: 'Erro ao processar resposta da IA' }, { status: 500 })
    }

    console.log('9. Plano gerado com', plano?.tarefas?.length, 'tarefas')

    return NextResponse.json(plano)
  } catch (error) {
    console.error('ERRO COMPLETO:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
