import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

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
    async signIn({ user, account, profile, email, credentials }): Promise<boolean> {
      console.log(user, account, profile, email, credentials);
      
      if (account?.provider === 'google' || account?.provider === 'kakao') {
        const userEmail = user.email || (profile as any).email;
        if (!userEmail) {
          console.error("No email found in user or profile");
          return false;
        }
    
        const existingUser = await prisma.user.findUnique({
          where: { email: userEmail },
          
        });
    

        if (existingUser) {
          // 기존 사용자에게 계정 연결
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              // 기타 필요한 필드들...
            },
          });
        }
      }
      return true;
    },
    
    
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        token.profile = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.profile = token.profile;
      }
      return session;
    },
  },
  
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };