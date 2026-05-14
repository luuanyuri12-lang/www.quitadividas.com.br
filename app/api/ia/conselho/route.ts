import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')
    const { anthropic, buildSystemPrompt } = await import('@/lib/anthropic')
    const { calcularIndiceSaude } = await import('@/lib/calculos/indiceSaude')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pergunta } = await req.json()
    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)

    const userComDados = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { dividas: true },
    })

    const totalParcelas = userComDados?.dividas.reduce(
      (soma: number, d: { parcela: number }) => soma + d.parcela, 0
    ) ?? 0

    const totalDividas = userComDados?.dividas.reduce(
      (soma: number, d: { valorTotal: number }) => soma + d.valorTotal, 0
    ) ?? 0

    const rendaMensal = (userComDados as any)?.rendaMensal ?? 0
    const indiceSaude = calcularIndiceSaude(rendaMensal, totalParcelas)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: buildSystemPrompt({
        rendaMensal,
        totalDividas,
        totalParcelas,
        indiceSaude,
        plano: dbUser.plano,
      }),
      messages: [{ role: 'user', content: pergunta }],
    })

    const resposta = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('IA error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
