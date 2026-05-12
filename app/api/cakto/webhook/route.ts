import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CAKTO_PRODUCT_PLAN_MAP } from '@/lib/cakto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.secret !== process.env.CAKTO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = body.event as string
    const email = body.data?.customer?.email as string
    const productId = body.data?.product?.id as string
    const nome = body.data?.customer?.name as string

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 })
    }

    if (event === 'purchase_approved' || event === 'subscription_renewed') {
      const newPlan = CAKTO_PRODUCT_PLAN_MAP[productId]
      if (!newPlan) {
        return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
      }
      await prisma.user.upsert({
        where: { email },
        update: { plano: newPlan },
        create: { email, nome: nome ?? '', plano: newPlan },
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
