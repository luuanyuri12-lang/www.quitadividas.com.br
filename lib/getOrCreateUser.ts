import { prisma } from '@/lib/prisma'

export async function getOrCreateUser(email: string, nome?: string) {
  return await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      nome: nome ?? email.split('@')[0],
      plano: 'ESSENCIAL',
    },
  })
}
