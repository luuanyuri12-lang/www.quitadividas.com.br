import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    const { valor, pixKey } = await req.json()

    const comissoes = await prisma.comissao.findMany({
      where: { userId: dbUser.id, status: 'DISPONIVEL' },
    })

    const saldoDisponivel = comissoes.reduce((s, c) => s + c.valor, 0)

    if (valor > saldoDisponivel) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    if (valor < 20) {
      return NextResponse.json({ error: 'Valor mínimo de saque é R$ 20,00' }, { status: 400 })
    }

    const saque = await prisma.saqueRequest.create({
      data: {
        userId: dbUser.id,
        valor: Number(valor),
        pixKey: String(pixKey),
        status: 'pendente',
      },
    })

    await prisma.comissao.updateMany({
      where: { userId: dbUser.id, status: 'DISPONIVEL' },
      data: { status: 'SOLICITADO' },
    })

    return NextResponse.json({ saque, mensagem: 'Saque solicitado! Pagamento via Pix em até 3 dias úteis.' })
  } catch (error) {
    console.error('POST saque error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
