import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {authConfig} from './auth.config';
import {z} from 'zod';
import type {User} from '@/lib/definitions';
import bcrypt from 'bcrypt';
import {neon} from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function getUser(email: string): Promise<User | undefined> {
  try {
    const users = await sql`SELECT *
                            FROM users
                            WHERE email = ${email}`;
    return users[0] as User | undefined;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const {auth, signIn, signOut} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({email: z.string().email(), password: z.string().min(8)})
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const {email, password} = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
