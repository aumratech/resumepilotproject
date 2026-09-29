import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'

export default async function AdminRootPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/login')
  }
  redirect('/dashboard')
}
