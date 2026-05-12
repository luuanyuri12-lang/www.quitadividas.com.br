import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const prisma = new PrismaClient()

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'luan_yuri12@hotmail.com',
    password: 'Luan29071997',
    email_confirm: true,
  })

  if (error) {
    console.error('Erro ao criar usuário no Supabase:', error)
    return
  }

  console.log('Usuário criado no Supabase:', data.user?.id)

  const dbUser = await prisma.user.upsert({
    where: { email: 'luan_yuri12@hotmail.com' },
    update: { plano: 'ELITE', nome: 'Luan Yuri' },
    create: {
      email: 'luan_yuri12@hotmail.com',
      nome: 'Luan Yuri',
      plano: 'ELITE',
      rendaMensal: 0,
    },
  })

  console.log('Usuário criado no banco:', dbUser.id)
  console.log('Conta master criada com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
