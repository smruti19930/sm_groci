import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      storeId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    storeId?: string;
  }
}
