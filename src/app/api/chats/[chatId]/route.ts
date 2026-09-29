import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatId } = await params

  await supabaseAdmin
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('userId', session.user.id)

  return NextResponse.json({ success: true })
}
