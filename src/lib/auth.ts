import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcrypt';
import type { NextAuthConfig, User as NextAuthUser } from 'next-auth';
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User extends NextAuthUser {
    id: string;
    username: string;
  }
   interface Session {
     user: User;
   }
}

declare module "next-auth/jwt" {
   interface JWT {
     userId: string;
     username: string;
   }
 }


export const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (user && await bcrypt.compare(credentials.password as string, user.password)) {
          // Return user object without password
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
          } as NextAuthUser & { id: string; username: string };
        } else {
          return null; // Authentication failed
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JSON Web Tokens for session management
  },
  callbacks: {
     async jwt({ token, user }) {
      if (user) {
        // On sign in, add user id and username to the token
        token.userId = user.id;
        token.username = (user as NextAuthUser & { username: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
       // Add user id and username to the session object
       if (token && session.user) {
         session.user.id = token.userId;
         session.user.username = token.username;
       }
       return session;
     },
     // Redirect user to sign-in page if they try to access protected routes without being logged in
     authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnAuthPages = nextUrl.pathname.startsWith('/auth');
        const isOnPublicPages = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/poems'); // Define public pages

        if (isOnAuthPages) {
          if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
          return true; // Allow access to auth pages if not logged in
        }

        if (!isLoggedIn && !isOnPublicPages) {
          return false; // Redirect unauthenticated users trying to access protected pages
        }

        return true; // Allow access for logged-in users or for public pages
      },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page path
    // signOut: '/auth/signout', // Optional: Custom sign-out page
    // error: '/auth/error', // Optional: Custom error page
    // verifyRequest: '/auth/verify-request', // Optional: Custom email verification page
    newUser: '/auth/signup', // Redirect new users to sign-up or a profile setup page
  },
  secret: process.env.AUTH_SECRET, // Use the secret from .env
  trustHost: process.env.AUTH_TRUST_HOST === 'true', // Use setting from .env
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
