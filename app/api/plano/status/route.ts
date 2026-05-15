import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await getOrCreateUser(user.email!, user.user_metadata?.full_name)
    const { tarefaId, status } = await req.json()

    await (prisma.user as any).update({
      where: { email: user.email! },
      data: {
        planoStatus: JSON.stringify({ tarefaId, status, updatedAt: new Date() }),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
