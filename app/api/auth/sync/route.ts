import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { getOrCreateUser } = await import('@/lib/getOrCreateUser')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(
      user.email!,
      user.user_metadata?.full_name
    )

    return NextResponse.json({ user: dbUser })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
