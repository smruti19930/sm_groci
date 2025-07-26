import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../database';
import bcrypt from 'bcrypt';

const nextAuthOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        try {
          const user = await db.query('SELECT * FROM users WHERE username = $1', [credentials.username]);

          if (user.rows.length > 0) {
            const isValid = await bcrypt.compare(credentials.password, user.rows[0].password);
            if (isValid) {
              const storeResult = await db.query('SELECT store_id FROM user_store_mappings WHERE user_id = $1', [user.rows[0].id]);
              const storeId = storeResult.rows.length > 0 ? storeResult.rows[0].store_id : null;
              return { id: user.rows[0].id.toString(), name: user.rows[0].username, storeId };
            }
          }
          return null;
        } catch (error) {
          console.error('Error authorizing user:', error);
          return null;
        }
      }
    })
  ],
  secret: 'your-secret-key',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id;
        token.storeId = user.storeId;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.storeId = token.storeId as string;
      }
      return session;
    }
  }
};

if (process.env.RENDER_EXTERNAL_URL) {
  (nextAuthOptions as any).trustHost = true;
}

export default NextAuth(nextAuthOptions);
