import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function identificarPlano(nomeProduto: string): 'ESSENCIAL' | 'PRO' | 'ELITE' | null {
  const nome = nomeProduto?.toLowerCase() ?? ''
  if (nome.includes('elite')) return 'ELITE'
  if (nome.includes('pro')) return 'PRO'
  if (nome.includes('essencial')) return 'ESSENCIAL'
  return null
}

const COMISSOES: Record<string, number[]> = {
  ESSENCIAL: [5.97, 1.99, 0.99],
  PRO: [29.10, 9.70, 4.85],
  ELITE: [59.10, 19.70, 9.85],
}

async function creditarComissoes(userId: string, plano: string, prisma: typeof import('@/lib/prisma').prisma) {
  const valores = COMISSOES[plano] || []

  const nivel1 = await prisma.indicacao.findFirst({ where: { indicadoId: userId } })
  if (!nivel1) return

  await prisma.comissao.create({
    data: { userId: nivel1.indicadorId, valor: valores[0] || 0, nivel: 1, origem: userId, status: 'PENDENTE' },
  })

  const nivel2 = await prisma.indicacao.findFirst({ where: { indicadoId: nivel1.indicadorId } })
  if (!nivel2) return

  await prisma.comissao.create({
    data: { userId: nivel2.indicadorId, valor: valores[1] || 0, nivel: 2, origem: userId, status: 'PENDENTE' },
  })

  const nivel3 = await prisma.indicacao.findFirst({ where: { indicadoId: nivel2.indicadorId } })
  if (!nivel3) return

  await prisma.comissao.create({
    data: { userId: nivel3.indicadorId, valor: valores[2] || 0, nivel: 3, origem: userId, status: 'PENDENTE' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()

    if (body.secret !== process.env.CAKTO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event: string = body.event ?? ''
    const email: string = body.data?.customer?.email ?? ''
    const nomeProduto: string = body.data?.product?.name ?? ''
    const nome: string = body.data?.customer?.name ?? ''

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 })
    }

    if (event === 'purchase_approved' || event === 'subscription_renewed') {
      const newPlan = identificarPlano(nomeProduto)
      if (!newPlan) {
        return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
      }
      const updatedUser = await prisma.user.upsert({
        where: { email },
        update: { plano: newPlan },
        create: { email, nome, plano: newPlan },
      })

      await creditarComissoes(updatedUser.id, newPlan, prisma)
    }

    if (
      event === 'subscription_canceled' ||
      event === 'refund' ||
      event === 'chargeback'
    ) {
      await prisma.user.updateMany({
        where: { email },
        data: { plano: 'ESSENCIAL' },
      })
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
