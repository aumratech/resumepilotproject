import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatId } = await params

  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('chatId', chatId)
    .order('createdAt', { ascending: true })

  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatId } = await params
  const { role, content } = await req.json()

  const { data: message, error } = await supabaseAdmin
    .from('messages')
    .insert({ id: crypto.randomUUID(), chatId, role, content })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update chat title from first user message
  if (role === 'USER') {
    const { count } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chatId', chatId)

    if (count === 1) {
      const now = new Date().toISOString()
      await supabaseAdmin
        .from('chats')
        .update({ title: content.slice(0, 60) + (content.length > 60 ? '...' : ''), updatedAt: now })
        .eq('id', chatId)
    }
  }

  return NextResponse.json(message)
}
