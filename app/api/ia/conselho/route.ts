import { NextRequest, NextResponse } from 'next/server'
import { anthropic, buildSystemPrompt } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { calcularIndiceSaude } from '@/lib/calculos/indiceSaude'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pergunta } = await req.json()

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { dividas: true, entradas: true },
    })

    const totalParcelas = dbUser?.dividas.reduce((s: number, d: { parcela: number }) => s + d.parcela, 0) ?? 0
    const totalDividas = dbUser?.dividas.reduce((s: number, d: { valorTotal: number }) => s + d.valorTotal, 0) ?? 0
    const rendaMensal = dbUser?.entradas.reduce((s: number, e: { valor: number }) => s + e.valor, 0) ?? 0
    const indiceSaude = calcularIndiceSaude(rendaMensal, totalParcelas)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: buildSystemPrompt({
        rendaMensal,
        totalDividas,
        totalParcelas,
        indiceSaude,
        plano: dbUser?.plano ?? 'ESSENCIAL',
      }),
      messages: [{ role: 'user', content: pergunta }],
    })

    const resposta =
      message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('IA error:', error)
    return NextResponse.json({ error: 'Erro ao consultar IA' }, { status: 500 })
  }
}
