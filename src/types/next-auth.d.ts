import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      emailVerified?: Date | string | null
    } & DefaultSession['user']
  }

  interface User {
    emailVerified?: Date | string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    emailVerified?: Date | string | null
  }
}
