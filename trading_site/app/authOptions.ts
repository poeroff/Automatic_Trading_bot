import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

interface PrismaUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  author?: string | null;
  emailVerified?: Date | null;
  accounts?: any[];
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'profile_nickname profile_image account_email'
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text"},

      },
      async authorize(credentials) {
        console.log(credentials)
        // 데이터베이스에서 사용자 찾기
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
        // 비밀번호 확인
        if (user) {
          return user; // 로그인 성공 시 사용자 객체 반환
        }

        return null; // 로그인 실패 시 null 반환
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/error',
    verifyRequest: '/verify-request',
  },
  

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'kakao') {
        try {
          const existingUser = await prisma.user.findFirst({
            where: { email: user.email },
            include: { accounts: true },
          }) as PrismaUser | null;
          if (existingUser && (!existingUser.accounts || existingUser.accounts.length === 0)) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
              },
            });
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        token.author = user.author || null;
        token.profile = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.author = token.author || null;
        session.user.profile = token.profile;
      }
      return session;
    },
  },
  
};