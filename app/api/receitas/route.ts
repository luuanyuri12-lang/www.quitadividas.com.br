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

  const entradas = await prisma.entradaReceita.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(entradas)
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

  const entrada = await prisma.entradaReceita.create({
    data: {
      userId: dbUser.id,
      descricao: body.descricao,
      valor: body.valor,
      tipo: body.tipo,
    },
  })
  return NextResponse.json(entrada)
}
