import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')

    const dbUser = await prisma.user.upsert({
      where: { email: 'luan_yuri12@hotmail.com' },
      update: { plano: 'ELITE', nome: 'Luan Yuri' },
      create: {
        email: 'luan_yuri12@hotmail.com',
        nome: 'Luan Yuri',
        plano: 'ELITE',
      },
    })

    return NextResponse.json({ success: true, user: dbUser })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
