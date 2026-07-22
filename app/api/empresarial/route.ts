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

    const conta = await prisma.contaEmpresarial.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(conta)
  } catch (error) {
    console.error('GET empresarial error:', error)
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
    const body = await req.json()

    if (!body.nome) {
      return NextResponse.json({ error: 'Nome da empresa é obrigatório' }, { status: 400 })
    }

    const conta = await prisma.contaEmpresarial.create({
      data: {
        userId: dbUser.id,
        nome: String(body.nome),
        cnpj: body.cnpj ? String(body.cnpj) : null,
        setor: body.setor ? String(body.setor) : null,
      },
    })

    return NextResponse.json(conta)
  } catch (error) {
    console.error('POST empresarial error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
