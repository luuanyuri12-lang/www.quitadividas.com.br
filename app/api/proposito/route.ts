import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
  if (!dbUser) return NextResponse.json([])

  const diario = await prisma.diarioProposito.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(diario)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const entrada = await prisma.diarioProposito.create({
    data: {
      userId: dbUser.id,
      reflexao: body.reflexao,
      semana: body.semana,
    },
  })
  return NextResponse.json(entrada)
}
