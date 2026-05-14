import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error } = await supabaseAdmin.storage
      .from('comprovantes')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('comprovantes')
      .getPublicUrl(fileName)

    console.log('Upload OK:', urlData.publicUrl)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
