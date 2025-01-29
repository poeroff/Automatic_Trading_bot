import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

// JWT 타입 확장
declare module "next-auth/jwt" {
  interface JWT {
    id?: string; // 사용자 ID
    accessToken?: string; // 액세스 토큰
    profile?: Profile; // 프로필 정보 추가
  }
}

// 세션 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id?: string; // 사용자 ID
      accessToken?: string; // 액세스 토큰
      profile?: Profile; // 프로필 정보 추가
    } & DefaultSession["user"];
  }

  // Profile 타입 확장
  interface Profile {
    email_verified?: boolean; // Google 이메일 인증 여부
    kakao_account?: {
      is_email_verified?: boolean; // Kakao 이메일 인증 여부
      email?: string; // Kakao 이메일
    };
    given_name?: string; // Google 이름
    family_name?: string; // Google 성
    picture?: string; // 프로필 사진 URL
  }
}
