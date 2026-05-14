import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const dividaId = searchParams.get('dividaId')
    if (!dividaId) return NextResponse.json({ error: 'dividaId required' }, { status: 400 })

    const pagamentos = await prisma.pagamento.findMany({
      where: { dividaId },
      orderBy: { data: 'desc' },
    })

    return NextResponse.json(pagamentos)
  } catch (error) {
    console.error('GET pagamentos error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const pagamento = await prisma.pagamento.create({
      data: {
        dividaId: String(body.dividaId),
        valor: Number(body.valor),
        data: body.data ? new Date(body.data) : new Date(),
        comprovante: body.comprovante ?? null,
      },
    })

    await prisma.divida.update({
      where: { id: body.dividaId },
      data: {
        valorTotal: { decrement: Number(body.valor) },
        mesesRestantes: { decrement: 1 },
      },
    })

    return NextResponse.json(pagamento)
  } catch (error) {
    console.error('POST pagamentos error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { id } = await req.json()
    await prisma.pagamento.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('DELETE pagamentos error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
