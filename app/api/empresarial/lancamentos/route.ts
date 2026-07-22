import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)

    const conta = await prisma.contaEmpresarial.findFirst({ where: { userId: dbUser.id } })
    if (!conta) return NextResponse.json([])

    const lancamentos = await prisma.lancamentoEmpresarial.findMany({
      where: { contaId: conta.id },
      orderBy: { data: 'desc' },
    })

    return NextResponse.json(lancamentos)
  } catch (error) {
    console.error('GET lancamentos error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)

    const conta = await prisma.contaEmpresarial.findFirst({ where: { userId: dbUser.id } })
    if (!conta) return NextResponse.json({ error: 'Nenhuma empresa cadastrada' }, { status: 400 })

    const body = await req.json()

    const lancamento = await prisma.lancamentoEmpresarial.create({
      data: {
        contaId: conta.id,
        descricao: String(body.descricao),
        valor: Number(body.valor),
        tipo: String(body.tipo),
        categoria: String(body.categoria),
        data: body.data ? new Date(body.data) : new Date(),
      },
    })

    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('POST lancamentos error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    const { id } = await req.json()

    const lancamento = await prisma.lancamentoEmpresarial.findUnique({
      where: { id },
      include: { conta: true },
    })

    if (!lancamento || lancamento.conta.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    await prisma.lancamentoEmpresarial.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('DELETE lancamentos error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
