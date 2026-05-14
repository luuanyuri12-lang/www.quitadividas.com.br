import { NextRequest, NextResponse } from 'next/server'

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

    const dividas = await prisma.divida.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(dividas)
  } catch (error) {
    console.error('GET dividas error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')
    const { calcularPrioridade } = await import('@/lib/calculos/prioridadeDivida')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    const body = await req.json()

    const divida = await prisma.divida.create({
      data: {
        userId: dbUser.id,
        nome: String(body.nome),
        tipo: String(body.tipo),
        valorTotal: Number(body.valorTotal),
        parcela: Number(body.parcela),
        taxaMensal: Number(body.taxaMensal),
        mesesRestantes: Number(body.mesesRestantes),
        prioridade: calcularPrioridade(Number(body.taxaMensal)),
      },
    })

    return NextResponse.json(divida)
  } catch (error) {
    console.error('POST dividas error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    await prisma.divida.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('DELETE dividas error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
