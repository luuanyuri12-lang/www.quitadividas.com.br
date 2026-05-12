import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email!,
        nome: user.user_metadata?.full_name ?? '',
        plano: 'ESSENCIAL',
      },
    })
  }

  return NextResponse.json(dbUser)
}
