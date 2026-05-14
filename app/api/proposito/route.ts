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

    const diario = await prisma.diarioProposito.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(diario)
  } catch (error) {
    console.error('GET proposito error:', error)
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

    const entrada = await prisma.diarioProposito.create({
      data: {
        userId: dbUser.id,
        reflexao: body.reflexao,
        semana: body.semana,
      },
    })
    return NextResponse.json(entrada)
  } catch (error) {
    console.error('POST proposito error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
