// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;  // optional 제거
      accessToken?: string;
      author?: string | null;  // null 허용
      profile?: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        author?: string | null;  // null 허용
        [key: string]: any;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    author?: string | null;  // null 허용
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;  // optional 제거
      accessToken?: string;
      author?: string;
      profile?: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        author?: string | null;
        [key: string]: any;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    author?: string;
  }
}



// types/next-auth.d.ts
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    author?: string | null;  // null 허용
    profile?: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      author?: string | null;  // null 허용
      [key: string]: any;
    };
  }
}