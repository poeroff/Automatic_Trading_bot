// types/next-auth.d.ts

import { JWT } from "next-auth/jwt";
import {sess} from "next-auth/sess"
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// 🔹 User 타입 확장 (accessToken 추가)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      author?: string | null;
      accessToken?: string | null;  // ✅ 추가
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    author?: string | null;
    accessToken?: string;  // ✅ 추가
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string | null;
    author?: string | null; // null 허용
    name?: string | null; // name 추가
    profile?: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      author?: string | null; // null 허용
      [key: string]: any;
    };
  }
}