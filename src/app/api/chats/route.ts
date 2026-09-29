import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date().toISOString()
  const { data: chat, error } = await supabaseAdmin
    .from('chats')
    .insert({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: 'New Chat',
      updatedAt: now,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(chat)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: chats } = await supabaseAdmin
    .from('chats')
    .select('*, messages(*)')
    .eq('userId', session.user.id)
    .order('updatedAt', { ascending: false })
    .limit(20)

  return NextResponse.json(chats ?? [])
}
