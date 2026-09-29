import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { supabaseAdmin, syncUserToSupabaseAuth } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from '@/auth.config'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email, name, image, password')
          .eq('email', parsed.data.email)
          .single()

        if (error || !user || !user.password) return null

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password)
        if (!passwordMatch) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        // OAuth sign-in: ensure user exists in our database
        try {
          const email = user.email!

          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle()

          if (!existingUser) {
            const now = new Date().toISOString()
            const newId = crypto.randomUUID()

            const { data: newUser, error } = await supabaseAdmin
              .from('users')
              .insert({
                id: newId,
                email,
                name: user.name ?? null,
                image: user.image ?? null,
                emailVerified: now,
                updatedAt: now,
              })
              .select('id')
              .single()

            if (!error && newUser) {
              user.id = newUser.id

              const profileId = crypto.randomUUID()
              const { data: profile } = await supabaseAdmin
                .from('profiles')
                .insert({ id: profileId, userId: newUser.id, updatedAt: now })
                .select('id')
                .single()

              if (profile) {
                await supabaseAdmin.from('personal_info').insert({
                  id: crypto.randomUUID(),
                  profileId: profile.id,
                  fullName: user.name ?? null,
                  email,
                  photoUrl: user.image ?? null,
                  updatedAt: now,
                })
              }

              try {
                await syncUserToSupabaseAuth({ email, name: user.name, userId: newUser.id })
                await sendWelcomeEmail({ email, name: user.name })
              } catch (emailErr) {
                console.warn('OAuth post-creation sync failed:', emailErr)
              }
            }
          } else {
            user.id = existingUser.id
          }
        } catch (err) {
          console.warn('OAuth user creation error:', err)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
