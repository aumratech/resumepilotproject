import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || 'dummy-google-id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'dummy-google-secret',
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || 'dummy-github-id',
      clientSecret: process.env.AUTH_GITHUB_SECRET || 'dummy-github-secret',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
