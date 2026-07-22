import { prisma } from '@/lib/prisma'

function gerarCodigo(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6)
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
  return base + rand
}

export async function getOrCreateUser(email: string, nome?: string, codigoIndicacaoPor?: string) {
  let dbUser = await prisma.user.findUnique({ where: { email } })

  if (!dbUser) {
    const codigoIndicacao = gerarCodigo(email)
    dbUser = await prisma.user.create({
      data: {
        email,
        nome: nome ?? email.split('@')[0],
        plano: 'ESSENCIAL',
        codigoIndicacao,
      },
    })

    if (codigoIndicacaoPor) {
      const indicador = await prisma.user.findUnique({
        where: { codigoIndicacao: codigoIndicacaoPor },
      })
      if (indicador) {
        await prisma.indicacao.create({
          data: {
            indicadorId: indicador.id,
            indicadoId: dbUser.id,
            nivel: 1,
          },
        })
      }
    }
  }

  return dbUser
}
