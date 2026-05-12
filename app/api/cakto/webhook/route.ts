import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function identificarPlano(nomeProduto: string): 'ESSENCIAL' | 'PRO' | 'ELITE' | null {
  const nome = nomeProduto?.toLowerCase() ?? ''
  if (nome.includes('elite')) return 'ELITE'
  if (nome.includes('pro')) return 'PRO'
  if (nome.includes('essencial')) return 'ESSENCIAL'
  return null
}

export async function POST(req: NextRequest) {
  try {
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
      await prisma.user.upsert({
        where: { email },
        update: { plano: newPlan },
        create: { email, nome, plano: newPlan },
      })
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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
