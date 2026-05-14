import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    return NextResponse.json({ rendaMensal: (dbUser as any).rendaMensal })
  } catch (error) {
    console.error('GET renda error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    const { rendaMensal } = await req.json()

    const dbUser = await (prisma.user as any).update({
      where: { email: user.email! },
      data: { rendaMensal: Number(rendaMensal) },
    })

    return NextResponse.json({ rendaMensal: (dbUser as any).rendaMensal })
  } catch (error) {
    console.error('PATCH renda error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
