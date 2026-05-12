import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { calcularPrioridade } from '@/lib/calculos/prioridadeDivida'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
  if (!dbUser) return NextResponse.json([])

  const dividas = await prisma.divida.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(dividas)
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

  const prioridade = calcularPrioridade(body.taxaMensal)

  const divida = await prisma.divida.create({
    data: {
      userId: dbUser.id,
      nome: body.nome,
      tipo: body.tipo,
      valorTotal: body.valorTotal,
      parcela: body.parcela,
      taxaMensal: body.taxaMensal,
      mesesRestantes: body.mesesRestantes,
      prioridade,
    },
  })
  return NextResponse.json(divida)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.divida.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
