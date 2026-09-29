import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqzfnsibusnanjwrusay.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_dummy_key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_dummy_service_key'

// Client for browser-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side usage (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  CERTIFICATES: 'certificates',
  PROJECT_SCREENSHOTS: 'project-screenshots',
  RESUMES: 'resumes',
} as const

/**
 * Upload a file to Supabase Storage (server-side, uses admin client)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

/**
 * Create or sync user in Supabase Authentication
 */
export async function syncUserToSupabaseAuth({
  email,
  name,
  userId,
  password,
}: {
  email: string
  name?: string | null
  userId: string
  password?: string
}) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = usersData?.users?.find((u) => u.email === email)

    if (!existingUser) {
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: password || undefined,
        email_confirm: true,
        user_metadata: { name, prisma_user_id: userId },
      })
      console.log(`[Supabase Auth] Created user in Supabase Auth for ${email}`)
    }
  } catch (err) {
    console.warn('[Supabase Auth] Warning syncing user creation:', err)
  }
}

/**
 * Delete user from Supabase Authentication
 */
export async function deleteUserFromSupabaseAuth(email: string) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
    const targetUser = usersData?.users?.find((u) => u.email === email)

    if (targetUser) {
      await supabaseAdmin.auth.admin.deleteUser(targetUser.id)
      console.log(`[Supabase Auth] Deleted user ${email} (${targetUser.id}) from Supabase Auth`)
    }
  } catch (err) {
    console.warn('[Supabase Auth] Warning deleting user from Supabase Auth:', err)
  }
}
