import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken"; // JWT 모듈 추가

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
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile_nickname profile_image account_email",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
        if (user) {
          user.author = user.author || "default";
          return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/error",
    verifyRequest: "/verify-request",
  },

  callbacks: {
    async signIn({ user, account }) {
      const existingUser = (await prisma.user.findFirst({
        where: { email: user.email },
        include: { accounts: true },
      })) as PrismaUser | null;

      if (existingUser) {
        user.author = existingUser.author || "default";

        return true;
      }
      return false;
    },

    async jwt({ token, user, account }) {


      if (user) {
        token.id = user.id;
        token.author = user.author || "default";
        token.name = user.name || "Unknown";
      }

      if (account) {
        token.accessToken = account.access_token || "default_token"; // 기본값 설정
      } else {
        token.accessToken = token.accessToken || "default_token"; // 토큰 유지
      }

  
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id || "defaultId", // Provide a default ID
        author: token.author || "default",
        name: token.name || "Unknown",
        accessToken: token.accessToken || "defaultToken", // Provide a default access token

      };
    
     
      return session;
    },
    
  },
};
