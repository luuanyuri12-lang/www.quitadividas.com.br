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

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)

    const nivel1 = await prisma.indicacao.findMany({
      where: { indicadorId: dbUser.id, nivel: 1 },
      include: { indicado: { select: { email: true, nome: true, plano: true, createdAt: true } } },
    })

    const nivel1Ids = nivel1.map((i) => i.indicadoId)

    const nivel2 = await prisma.indicacao.findMany({
      where: { indicadorId: { in: nivel1Ids }, nivel: 1 },
      include: { indicado: { select: { email: true, nome: true, plano: true, createdAt: true } } },
    })

    const nivel2Ids = nivel2.map((i) => i.indicadoId)

    const nivel3 = await prisma.indicacao.findMany({
      where: { indicadorId: { in: nivel2Ids }, nivel: 1 },
      include: { indicado: { select: { email: true, nome: true, plano: true, createdAt: true } } },
    })

    const comissoes = await prisma.comissao.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    })

    const saldoDisponivel = comissoes
      .filter((c) => c.status === 'DISPONIVEL')
      .reduce((s, c) => s + c.valor, 0)

    const saldoPendente = comissoes
      .filter((c) => c.status === 'PENDENTE')
      .reduce((s, c) => s + c.valor, 0)

    return NextResponse.json({
      codigoIndicacao: dbUser.codigoIndicacao,
      linkIndicacao: `${process.env.NEXT_PUBLIC_APP_URL}/cadastro?ref=${dbUser.codigoIndicacao}`,
      nivel1: nivel1.map((i) => i.indicado),
      nivel2: nivel2.map((i) => i.indicado),
      nivel3: nivel3.map((i) => i.indicado),
      totalIndicados: nivel1.length + nivel2.length + nivel3.length,
      saldoDisponivel,
      saldoPendente,
      comissoes: comissoes.slice(0, 20),
    })
  } catch (error) {
    console.error('GET indicacao error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
